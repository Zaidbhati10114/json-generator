// app/api/cron/check-models/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { testGeminiModel } from "@/lib/gemini/testModel";

async function handler(request: NextRequest) {
    try {
        console.log("🔍 [CRON] Starting model check...");

        const db = await getDb();

        const state = await db.collection("app_state").findOne({
            key: "gemini_model_check",
        });

        const now = Date.now();
        const lastChecked = state?.lastCheckedAt
            ? new Date(state.lastCheckedAt).getTime()
            : 0;

        const MIN_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours

        if (now - lastChecked < MIN_INTERVAL) {
            console.log("⏭️ [CRON] Skipping - checked recently");
            return NextResponse.json({
                success: true,
                skipped: true,
                message: "Checked recently",
                lastChecked: new Date(lastChecked).toISOString(),
                nextCheckAfter: new Date(lastChecked + MIN_INTERVAL).toISOString(),
            });
        }

        await db.collection("app_state").updateOne(
            { key: "gemini_model_check" },
            { $set: { lastCheckedAt: new Date() } },
            { upsert: true }
        );

        console.log("📡 Fetching models from Google API...");
        const res = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models",
            {
                headers: {
                    "x-goog-api-key": process.env.GOOGLE_API_KEY!,
                },
            }
        );

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Google API error response:", errorText);
            throw new Error(`Google API error: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        console.log(`📊 Found ${data.models?.length || 0} total models from Google`);

        // ✅ SMART FILTERING: Only models that support generateContent
        const geminiModels = data.models
            .filter((m: any) => {
                const name = m.name.replace("models/", "");
                const supported = m.supportedGenerationMethods || [];

                return (
                    name.startsWith("gemini") &&
                    (name.includes("flash") || name.includes("pro")) &&
                    !name.includes("vision") &&
                    !name.includes("image") &&
                    !name.includes("audio") &&
                    !name.includes("tts") &&
                    !name.includes("computer-use") &&
                    !name.includes("robotics") &&
                    !name.includes("deep-research") &&
                    !name.includes("embedding") &&
                    supported.includes("generateContent")
                );
            })
            .map((m: any) => m.name.replace("models/", ""));

        console.log(`🎯 Filtered to ${geminiModels.length} working Gemini models:`, geminiModels);

        const newModels: string[] = [];
        const testedModels: Array<{ model: string; passed: boolean }> = [];
        let promotedModel: string | null = null;

        for (const model of geminiModels) {
            const exists = await db.collection("ai_models").findOne({
                provider: "gemini",
                model,
            });

            if (exists) {
                console.log(`⏭️  Skipping existing model: ${model}`);
                continue;
            }

            newModels.push(model);
            console.log(`🧪 [CRON] Testing new model: ${model}`);

            const passed = await testGeminiModel(model);
            testedModels.push({ model, passed });

            await db.collection("ai_models").insertOne({
                provider: "gemini",
                model,
                status: passed ? "active" : "failed",
                createdAt: new Date(),
                lastTestedAt: new Date(),
                notes: passed ? "Auto-promoted via cron" : "Auto-failed via cron",
                isFallback: false,
            });

            if (passed) {
                console.log(`✅ [CRON] New working model found: ${model}`);
                promotedModel = model;

                await db.collection("ai_models").updateMany(
                    {
                        provider: "gemini",
                        status: "active",
                        model: { $ne: model },
                    },
                    { $set: { status: "deprecated" } }
                );

                await db.collection("model_changes").insertOne({
                    oldModel: state?.currentActiveModel || "unknown",
                    newModel: model,
                    changedAt: new Date(),
                    reason: "New model auto-promoted",
                });
            } else {
                console.log(`❌ [CRON] Model failed tests: ${model}`);
            }
        }

        const activeModel = await db.collection("ai_models").findOne({
            provider: "gemini",
            status: "active",
        });

        const needsEnvUpdate =
            activeModel?.model !== process.env.GEMINI_PRIMARY_MODEL;

        console.log(`✅ [CRON] Check complete. Active model: ${activeModel?.model}`);

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            totalGeminiModels: geminiModels.length,
            newModelsFound: newModels.length,
            newModels,
            testedModels,
            promotedModel,
            currentActiveModel: activeModel?.model,
            envModel: process.env.GEMINI_PRIMARY_MODEL,
            needsEnvUpdate,
            recommendation: needsEnvUpdate
                ? `⚠️ Update GEMINI_PRIMARY_MODEL to: ${activeModel?.model}`
                : "✅ Environment variable is up to date",
        });
    } catch (error) {
        console.error("❌ [CRON] Error checking models:", error);

        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const signature = request.headers.get("upstash-signature");

    if (!signature) {
        const body = await request.json();
        if (body?.secret !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return handler(request);
    }

    try {
        const { Receiver } = await import("@upstash/qstash");

        const receiver = new Receiver({
            currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
            nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
        });

        const body = await request.text();
        const isValid = await receiver.verify({
            signature,
            body,
        });

        if (!isValid) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        const newRequest = new NextRequest(request.url, {
            method: request.method,
            headers: request.headers,
            body,
        });

        return handler(newRequest);
    } catch (error) {
        console.error("Signature verification failed:", error);
        return NextResponse.json(
            { error: "Signature verification failed" },
            { status: 401 }
        );
    }
}

export async function GET(request: NextRequest) {
    const secret = request.nextUrl.searchParams.get("secret");

    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler(request);
}

import { getDb } from "@/lib/mongodb";
import { testGeminiModel } from "./testModel";


const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

export async function maybeCheckGeminiModels() {
    const db = await getDb();

    const state = await db.collection("app_state").findOne({
        key: "gemini_model_check",
    });

    const now = Date.now();
    const lastChecked = state?.lastCheckedAt
        ? new Date(state.lastCheckedAt).getTime()
        : 0;

    // ⛔ Too soon → do nothing
    if (now - lastChecked < CHECK_INTERVAL_MS) {
        return;
    }

    // 🔒 Update timestamp FIRST (prevents multiple parallel checks)
    await db.collection("app_state").updateOne(
        { key: "gemini_model_check" },
        { $set: { lastCheckedAt: new Date() } },
        { upsert: true }
    );

    // 🚀 Run in background (don’t block users)
    void checkForNewGeminiModels();
}


async function checkForNewGeminiModels() {
    const db = await getDb();

    const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models",
        {
            headers: {
                Authorization: `Bearer ${process.env.GOOGLE_API_KEY}`,
            },
        }
    );

    if (!res.ok) return;

    const data = await res.json();
    const models: string[] =
        data.models?.map((m: any) => m.name.replace("models/", "")) ?? [];

    for (const model of models) {
        // Only care about Gemini text models
        if (!model.startsWith("gemini")) continue;

        const exists = await db.collection("ai_models").findOne({
            provider: "gemini",
            model,
        });

        if (exists) continue;

        // 🧪 New model found → test it
        const passed = await testGeminiModel(model);

        await db.collection("ai_models").insertOne({
            provider: "gemini",
            model,
            status: passed ? "active" : "failed",
            createdAt: new Date(),
            lastTestedAt: new Date(),
            notes: passed ? "Auto-promoted" : "Auto-failed",
        });

        if (passed) {
            // 🔄 Demote old active model
            await db.collection("ai_models").updateMany(
                { provider: "gemini", status: "active" },
                { $set: { status: "deprecated" } }
            );

            await db.collection("ai_models").updateOne(
                { provider: "gemini", model },
                { $set: { status: "active" } }
            );
        }
    }
}


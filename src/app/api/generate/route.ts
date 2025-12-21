// app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

import { aj } from "@/lib/arcjet";
import { tokenBucket, shield, detectBot } from "@arcjet/next";

// 🔹 Gemini runtime helpers
import { maybeCheckGeminiModels } from "@/lib/gemini/maybeCheckModels";
import { getFallbackGeminiModel } from "@/lib/gemini/getFallbackModel";
import { markGeminiModelFailed } from "@/lib/gemini/markModelFailed";
import { getActiveGeminiModel } from "@/lib/gemini/getActiveGeminiModel";

const google = createGoogleGenerativeAI();

export async function POST(request: NextRequest) {
    // 🔁 STEP 2: free-tier lazy model check (non-blocking)
    void maybeCheckGeminiModels();

    try {
        // 🛡️ Arcjet protection
        const decision = await aj
            .withRule(
                tokenBucket({
                    mode: "LIVE",
                    refillRate: 2,
                    interval: 60,
                    capacity: 3,
                })
            )
            .withRule(
                detectBot({
                    mode: "LIVE",
                    allow: [],
                })
            )
            .withRule(
                shield({
                    mode: "LIVE",
                })
            )
            .protect(request, { requested: 1 });

        // @ts-ignore
        const remaining = decision.reason.remaining || 0;
        // @ts-ignore
        const resetTime = decision.reason.resetTime || Date.now() + 60000;
        const country = decision.ip.countryName || "Unknown";

        if (decision.isDenied()) {
            const waitTime = Math.ceil((resetTime - Date.now()) / 1000);

            let errorMessage = "Request denied";
            if (decision.reason.isRateLimit()) {
                errorMessage = "Rate limit exceeded. Please try again later.";
            } else if (decision.reason.isBot()) {
                errorMessage = "Bot detected. This service is for human use only.";
            } else if (decision.reason.isShield()) {
                errorMessage = "Request blocked for security reasons.";
            }

            return NextResponse.json(
                {
                    error: errorMessage,
                    retryAfter: waitTime,
                    resetTime: new Date(resetTime).toISOString(),
                    remainingTokens: Number(remaining),
                    country,
                },
                { status: 429 }
            );
        }

        // 📥 Parse request
        const { prompt } = await request.json();

        if (!prompt?.trim()) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        console.log("⚙️ Generating text from Gemini");

        // ============================
        // 🧠 STEP 3: SAFE + SELF-HEALING
        // ============================

        let modelName = await getActiveGeminiModel();
        let text: string;

        try {
            // 🟢 Try active model
            const result = await generateText({
                model: google(modelName),
                system:
                    "You are a helpful assistant that returns only valid JSON data without explanations.",
                prompt: `Output JSON only. ${prompt}`,
            });

            text = result.text;
        } catch (err) {
            console.error("❌ Active Gemini model failed:", modelName);

            // 🔴 Mark active model as failed
            await markGeminiModelFailed(modelName);

            // 🔄 Fallback immediately
            const fallbackModel = await getFallbackGeminiModel();

            const result = await generateText({
                model: google(fallbackModel),
                system:
                    "You are a helpful assistant that returns only valid JSON data without explanations.",
                prompt: `Output JSON only. ${prompt}`,
            });

            text = result.text;
        }

        // 🧹 Clean markdown fences
        const cleanedText = text.replace(/```json|```/gi, "").trim();

        let parsedData;
        try {
            parsedData = JSON.parse(cleanedText);
        } catch {
            parsedData = { raw_output: cleanedText };
        }

        return NextResponse.json(
            {
                generatedData: parsedData,
                rawText: cleanedText,
                remainingTokens: Number(remaining),
                resetTime: new Date(resetTime).toISOString(),
                country,
            },
            {
                headers: {
                    "X-RateLimit-Limit": "5",
                    "X-RateLimit-Remaining": remaining.toString(),
                    "X-RateLimit-Reset": resetTime.toString(),
                },
            }
        );
    } catch (error) {
        console.error("❌ Error generating text:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Internal Server Error";

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

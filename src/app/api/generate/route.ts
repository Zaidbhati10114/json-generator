// app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateWithFallback } from "@/lib/gemini/modelFallback";
import { aj } from "@/lib/arcjet";
import { tokenBucket, shield, detectBot } from "@arcjet/next";

const google = createGoogleGenerativeAI();

export async function POST(request: NextRequest) {
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

        // 📥 Parse and validate request
        const { prompt } = await request.json();

        if (!prompt?.trim()) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        // 🚫 Prevent abuse with massive prompts
        if (prompt.length > 2000) {
            return NextResponse.json(
                { error: "Prompt too long (max 2000 characters)" },
                { status: 400 }
            );
        }

        console.log("⚙️ Generating text from Gemini");

        // 🚀 Fast generation with automatic fallback (NO DB CALLS!)
        const { text, modelUsed, attemptedModels } = await generateWithFallback(
            prompt
        );

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
                modelUsed,
                remainingTokens: Number(remaining),
                resetTime: new Date(resetTime).toISOString(),
                country,
            },
            {
                headers: {
                    "X-RateLimit-Limit": "3",
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
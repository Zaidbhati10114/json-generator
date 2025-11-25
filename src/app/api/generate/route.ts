// app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { rateLimiter } from "@/lib/rate-limiter";

const google = createGoogleGenerativeAI();

function getClientIdentifier(request: NextRequest): string {
    // Try to get user ID from session/auth if available
    // For now, use IP address as identifier
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] :
        request.headers.get("x-real-ip") ||
        "unknown";
    return ip;
}

export async function POST(request: NextRequest) {
    try {
        // Get client identifier
        const clientId = getClientIdentifier(request);

        // Check rate limit
        const { allowed, remaining, resetTime } = rateLimiter.check(clientId);

        if (!allowed) {
            const waitTime = Math.ceil((resetTime - Date.now()) / 1000);
            return NextResponse.json(
                {
                    error: "Rate limit exceeded. Please try again in a minute.",
                    retryAfter: waitTime,
                    resetTime: new Date(resetTime).toISOString()
                },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": "3",
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": resetTime.toString(),
                        "Retry-After": waitTime.toString()
                    }
                }
            );
        }

        const { prompt } = await request.json();

        if (!prompt?.trim()) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        console.log("⚙️ Generating text from Gemini for prompt:", prompt);

        const { text } = await generateText({
            model: google("gemini-2.0-flash"),
            system: "You are a helpful assistant that returns only valid JSON data without any explanations.",
            prompt: `Output JSON only. ${prompt}`,
        });

        // 🧹 Clean up markdown-style code fences
        const cleanedText = text
            .replace(/```json|```/gi, "") // remove code fences
            .trim();

        // Try parsing cleaned text into JSON
        let parsedData;
        try {
            parsedData = JSON.parse(cleanedText);
        } catch {
            parsedData = { raw_output: cleanedText }; // fallback if still not valid
        }

        return NextResponse.json(
            {
                generatedData: parsedData,
                rawText: cleanedText,
            },
            {
                headers: {
                    "X-RateLimit-Limit": "3",
                    "X-RateLimit-Remaining": remaining.toString(),
                    "X-RateLimit-Reset": resetTime.toString()
                }
            }
        );
    } catch (error) {
        console.error("❌ Error generating text:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
import { NextRequest, NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI();

export async function POST(request: NextRequest) {
    try {
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

        return NextResponse.json({
            generatedData: parsedData,
            rawText: cleanedText,
        });
    } catch (error) {
        console.error("❌ Error generating text:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
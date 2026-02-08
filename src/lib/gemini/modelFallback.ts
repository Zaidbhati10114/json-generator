// lib/gemini/modelFallback.ts
import { generateText } from "ai";

const GEMINI_MODELS = [
    process.env.GEMINI_PRIMARY_MODEL || "gemini-2.0-flash-exp",
    "gemini-1.5-flash-002",
    "gemini-1.5-flash",
    "gemini-1.5-pro-002",
    "gemini-1.5-pro",
];

interface GenerationResult {
    text: string;
    modelUsed: string;
    attemptedModels: string[];
}

export async function generateWithFallback(
    google: any,
    prompt: string
): Promise<GenerationResult> {
    let lastError: any;
    const attemptedModels: string[] = [];

    for (const modelName of GEMINI_MODELS) {
        try {
            console.log(`🔄 Trying model: ${modelName}`);
            attemptedModels.push(modelName);

            const result = await generateText({
                model: google(modelName),
                system:
                    "You are a helpful assistant that returns only valid JSON data without explanations.",
                prompt: `Output JSON only. ${prompt}`,
                maxTokens: 1000,
            });

            console.log(`✅ Success with: ${modelName}`);

            return {
                text: result.text,
                modelUsed: modelName,
                attemptedModels,
            };
        } catch (err: any) {
            console.error(`❌ Model ${modelName} failed:`, err.message);
            lastError = err;
            // Continue to next model
        }
    }

    throw new Error(
        `All Gemini models failed. Attempted: ${attemptedModels.join(", ")}. ` +
        `Last error: ${lastError?.message}`
    );
}
import { getDb } from "@/lib/mongodb";

export async function getFallbackGeminiModel(): Promise<string> {
    const db = await getDb();

    const fallback = await db.collection("ai_models").findOne({
        provider: "gemini",
        isFallback: true,
    });

    if (!fallback) {
        throw new Error("❌ No fallback Gemini model found");
    }

    return fallback.model;
}

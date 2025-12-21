import { getDb } from "@/lib/mongodb";

export async function getActiveGeminiModel(): Promise<string> {
    const db = await getDb();

    const activeModel = await db.collection("ai_models").findOne({
        provider: "gemini",
        status: "active",
    });

    if (!activeModel) {
        throw new Error("❌ No active Gemini model found in ai_models");
    }

    return activeModel.model;
}

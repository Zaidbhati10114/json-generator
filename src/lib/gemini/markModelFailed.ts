import { getDb } from "@/lib/mongodb";

export async function markGeminiModelFailed(model: string) {
    const db = await getDb();

    await db.collection("ai_models").updateOne(
        { provider: "gemini", model },
        {
            $set: {
                status: "failed",
                notes: "Auto-failed at runtime",
                lastTestedAt: new Date(),
            },
        }
    );
}

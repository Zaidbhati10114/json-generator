import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI();

export async function testGeminiModel(model: string): Promise<boolean> {
    try {
        const { text } = await generateText({
            model: google(model),
            prompt: "Return JSON with key hello and value world.",
        });

        JSON.parse(text.replace(/```json|```/g, ""));
        return true;
    } catch {
        return false
    }
}

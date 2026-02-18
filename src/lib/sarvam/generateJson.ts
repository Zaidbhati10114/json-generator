import { SarvamAIClient } from "sarvamai";

const client = new SarvamAIClient({
    apiSubscriptionKey: process.env.SARVAM_API_KEY!,
});

/**
 * Force AI to return JSON only
 */
export async function generateJsonFromPrompt(userPrompt: string) {
    const systemPrompt = `
You are an API that generates structured data.

RULES:
- Return ONLY valid JSON
- No markdown
- No explanation
- No headings
- No backticks
- No text before or after JSON
- Always return an object or array
`;

    const finalPrompt = `
APP CONTEXT:
This is a SaaS app that generates structured data from prompts.

USER REQUEST:
${userPrompt}

Return the response as JSON.
`;

    const response = await client.chat.completions({
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: finalPrompt },
        ],
    });

    const rawText = response.choices[0].message.content;

    return cleanAndParseJSON(rawText);
}

function cleanAndParseJSON(text: string) {
    try {
        // Remove markdown if model still sends it
        const cleaned = text
            .replace(/```json/gi, "")
            .replace(/```/gi, "")
            .trim();

        // Extract JSON if text contains extra words
        const firstBrace = cleaned.indexOf("{");
        const firstBracket = cleaned.indexOf("[");

        let jsonStart = -1;
        if (firstBrace !== -1 && firstBracket !== -1) {
            jsonStart = Math.min(firstBrace, firstBracket);
        } else {
            jsonStart = Math.max(firstBrace, firstBracket);
        }

        const lastBrace = cleaned.lastIndexOf("}");
        const lastBracket = cleaned.lastIndexOf("]");

        let jsonEnd = Math.max(lastBrace, lastBracket) + 1;

        const jsonString = cleaned.substring(jsonStart, jsonEnd);

        const parsed = JSON.parse(jsonString);

        return {
            data: parsed,
            modelUsed: "sarvam-ai",
        };
    } catch (err) {
        return {
            data: { raw_output: text },
            modelUsed: "sarvam-ai",
        };
    }
}


// lib/gemini/modelFallback.ts

const GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-flash-latest",
];

interface GenerationResult {
    text: string;
    modelUsed: string;
    attemptedModels: string[];
}

export async function generateWithFallback(
    userPrompt: string
): Promise<GenerationResult> {
    let lastError: any;
    const attemptedModels: string[] = [];

    for (const modelName of GEMINI_MODELS) {
        try {
            console.log(`🔄 Trying model: ${modelName}`);
            attemptedModels.push(modelName);

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: `${userPrompt}\n\nIMPORTANT: Return ONLY valid JSON. No markdown code blocks, no explanations.`
                                    }
                                ]
                            }
                        ],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 4096,
                            responseMimeType: "application/json", // ✅ Force JSON output
                        }
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.text();
                console.error(`API error for ${modelName}:`, errorData);
                throw new Error(`API error: ${response.status} - ${errorData}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

            if (!text) {
                throw new Error("Empty response from API");
            }

            console.log(`✅ Success with: ${modelName}`);
            console.log(`📄 Response preview: ${text.substring(0, 100)}...`);

            return {
                text,
                modelUsed: modelName,
                attemptedModels,
            };
        } catch (err: any) {
            console.error(`❌ Model ${modelName} failed:`, err.message);
            lastError = err;
        }
    }

    throw new Error(
        `All Gemini models failed. Attempted: ${attemptedModels.join(", ")}. ` +
        `Last error: ${lastError?.message}`
    );
}
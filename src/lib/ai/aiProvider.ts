import { SarvamAIClient } from "sarvamai";
import { generateWithFallback } from "@/lib/gemini/modelFallback";

const provider = process.env.AI_PROVIDER || "gemini";

const sarvamClient = new SarvamAIClient({
    apiSubscriptionKey: process.env.SARVAM_API_KEY!,
});

const JSON_SYSTEM_PROMPT = `You are a JSON data generator. Output ONLY valid, complete JSON.

RULES:
1. NO markdown, NO \`\`\`json, just pure JSON starting with [
2. COMPLETE all structures - never truncate
3. Generate EXACT count requested
4. Keep ALL content SHORT (names, descriptions under 30 chars)
5. Close all brackets properly`;

/**
 * 🔢 Extract count from prompt
 */
function extractCountFromPrompt(prompt: string): number | null {
    const patterns = [
        /(?:generate|create|make|give\s*me|build|produce)\s+(\d+)/i,
        /(\d+)\s+(?:user\s*profiles?|users?|products?|items?|records?|entries?|people|customers?|employees?)/i,
    ];

    for (const pattern of patterns) {
        const match = prompt.match(pattern);
        if (match && match[1]) {
            const count = parseInt(match[1], 10);
            return Math.min(count, 100);
        }
    }
    return null;
}

/**
 * 🔧 Aggressive JSON repair
 */
function repairJSON(jsonStr: string): string {
    console.log("🔧 Repairing JSON...");

    // Find last complete object
    let lastGoodPosition = jsonStr.lastIndexOf('}');
    if (lastGoodPosition > -1) {
        jsonStr = jsonStr.substring(0, lastGoodPosition + 1);
    }

    // Remove trailing commas
    jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');

    // Balance quotes
    const quotes = (jsonStr.match(/"/g) || []).length;
    if (quotes % 2 !== 0) jsonStr += '"';

    // Balance structures
    const openBraces = (jsonStr.match(/\{/g) || []).length;
    const closeBraces = (jsonStr.match(/\}/g) || []).length;
    const openBrackets = (jsonStr.match(/\[/g) || []).length;
    const closeBrackets = (jsonStr.match(/\]/g) || []).length;

    for (let i = 0; i < (openBrackets - closeBrackets); i++) jsonStr += ']';
    for (let i = 0; i < (openBraces - closeBraces); i++) jsonStr += '}';

    return jsonStr;
}

/**
 * 🧹 Parse JSON with repair
 */
function parseJSONResponse(text: string): any {
    let cleaned = text
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/gi, "")
        .trim();

    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (!jsonMatch) throw new Error("No JSON found");

    let jsonStr = jsonMatch[0];

    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.log("⚠️ Parse failed, repairing...");
        jsonStr = repairJSON(jsonStr);
        return JSON.parse(jsonStr);
    }
}

/**
 * 🎯 Generate in safe chunks (IMPROVED)
 */
async function generateInChunks(prompt: string, totalCount: number) {
    const chunkSize = 5; // REDUCED from 8 to 5 for Sarvam's limits
    const chunks = Math.ceil(totalCount / chunkSize);
    const allItems: any[] = [];

    console.log(`📦 Chunking: ${totalCount} items → ${chunks} chunks of ~${chunkSize}`);

    // Simplify the prompt for chunking
    const basePrompt = simplifyPromptForChunking(prompt);

    for (let i = 0; i < chunks; i++) {
        const currentSize = Math.min(chunkSize, totalCount - (i * chunkSize));
        const startId = (i * chunkSize) + 1;

        console.log(`🔨 Chunk ${i + 1}/${chunks}: ${currentSize} items (${startId}-${startId + currentSize - 1})`);

        // SIMPLIFIED chunk prompt - minimal fields only
        const chunkPrompt = `Generate ${currentSize} ${getItemType(prompt)}.
Start ID from ${String(startId).padStart(3, '0')}.
Keep it minimal - essential fields only.
All text under 25 characters.
Output as JSON array: [{"id": "001", ...}, ...]`;

        try {
            const result = await generateSingle(chunkPrompt, currentSize, 2);
            const items = extractItems(result.text);

            if (items.length > 0) {
                console.log(`✅ Chunk ${i + 1}: ${items.length} items`);
                allItems.push(...items);
            } else {
                console.warn(`⚠️ Chunk ${i + 1}: No items extracted`);
            }

        } catch (error: any) {
            console.error(`❌ Chunk ${i + 1} failed:`, error.message.substring(0, 100));

            // Try one more time with even simpler prompt
            try {
                console.log(`🔄 Retrying chunk ${i + 1} with ultra-simple format...`);
                const ultraSimplePrompt = `Generate ${currentSize} items as JSON array.
Start ID: ${String(startId).padStart(3, '0')}
Format: [{"id":"001","name":"Item 1"},{"id":"002","name":"Item 2"}]
Keep names under 20 chars.`;

                const retryResult = await generateSingle(ultraSimplePrompt, currentSize, 1);
                const retryItems = extractItems(retryResult.text);

                if (retryItems.length > 0) {
                    console.log(`✅ Chunk ${i + 1} retry succeeded: ${retryItems.length} items`);
                    allItems.push(...retryItems);
                }
            } catch (retryError) {
                console.error(`❌ Chunk ${i + 1} retry also failed, skipping...`);
            }
        }

        // Delay between chunks
        if (i < chunks - 1) {
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    console.log(`🎉 Chunking complete: ${allItems.length}/${totalCount} items generated`);

    const arrayKey = getArrayKeyName(prompt);
    return {
        text: { [arrayKey]: allItems },
        modelUsed: "sarvam-chat",
        metadata: {
            requestedCount: totalCount,
            actualCount: allItems.length,
            chunks: chunks,
            successRate: `${Math.round((allItems.length / totalCount) * 100)}%`
        }
    };
}

/**
 * 📝 Simplify prompt for chunking
 */
function simplifyPromptForChunking(prompt: string): string {
    // Extract just the item type, ignore complex requirements
    const firstLine = prompt.split('\n')[0];
    return firstLine;
}

/**
 * 🏷️ Get item type from prompt
 */
function getItemType(prompt: string): string {
    const lower = prompt.toLowerCase();
    if (lower.includes('product')) return 'products';
    if (lower.includes('user') || lower.includes('profile')) return 'user profiles';
    if (lower.includes('employee')) return 'employee records';
    if (lower.includes('customer')) return 'customers';
    return 'items';
}

/**
 * 🔨 Single generation
 */
async function generateSingle(prompt: string, itemCount: number, maxRetries: number) {
    let lastError = "";

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const enhancedPrompt = `${prompt}

CRITICAL:
- Generate EXACTLY ${itemCount} items
- ALL text under 25 chars (names, descriptions, etc)
- Output complete valid JSON
- Start with [ or {
${attempt > 0 ? `\nRetry ${attempt}: Previous failed. Make it ULTRA SHORT!` : ''}`;

            let text: string;
            let modelUsed: string;

            if (provider === "sarvam") {
                console.log(`🟢 Sarvam (try ${attempt + 1}/${maxRetries + 1})`);

                const response = await sarvamClient.chat.completions({
                    messages: [
                        { role: "system", content: JSON_SYSTEM_PROMPT },
                        { role: "user", content: enhancedPrompt }
                    ],
                });

                text = response.choices[0].message.content;
                modelUsed = "sarvam-chat";

                console.log(`📏 Response: ${text.length} chars`);

                // If response is suspiciously long (likely truncated), throw early
                if (text.length > 1400 && itemCount > 3) {
                    throw new Error("Response likely truncated (too long)");
                }

            } else {
                console.log(`🔵 Gemini (try ${attempt + 1}/${maxRetries + 1})`);
                const geminiResponse = await generateWithFallback(
                    `${JSON_SYSTEM_PROMPT}\n\n${enhancedPrompt}`
                );
                text = geminiResponse.text;
                modelUsed = geminiResponse.modelUsed;
            }

            const parsedData = parseJSONResponse(text);
            const actualCount = getItemCount(parsedData);

            console.log(`✅ Parsed: ${actualCount} items`);

            return {
                text: parsedData,
                modelUsed,
                rawText: text,
                metadata: {
                    requestedCount: itemCount,
                    actualCount,
                }
            };

        } catch (error: any) {
            lastError = error.message;
            console.error(`⚠️ Try ${attempt + 1} failed:`, lastError.substring(0, 100));

            if (attempt === maxRetries) {
                throw new Error(`Failed after ${maxRetries + 1} attempts: ${lastError}`);
            }

            await new Promise(r => setTimeout(r, 800));
        }
    }

    throw new Error("Unexpected error");
}

/**
 * 🎯 Main generation logic
 */
export async function generateWithAI(
    prompt: string,
    options: { enforceJSON?: boolean; maxRetries?: number } = {}
) {
    const { enforceJSON = true, maxRetries = 2 } = options;

    const requestedCount = extractCountFromPrompt(prompt);
    const itemCount = requestedCount || 5;

    console.log(`📊 Count: ${itemCount} (${requestedCount ? 'detected' : 'default'})`);

    if (!enforceJSON) {
        return generateSingle(prompt, itemCount, maxRetries);
    }

    // Use chunking for 10+ items (LOWERED from 15)
    if (itemCount >= 10) {
        console.log("🔀 Using chunked generation");
        return generateInChunks(prompt, itemCount);
    }

    return generateSingle(prompt, itemCount, maxRetries);
}

/**
 * Helper functions
 */
function extractItems(data: any): any[] {
    if (Array.isArray(data)) return data;

    const keys = ['items', 'products', 'users', 'profiles', 'employees', 'records', 'data'];
    for (const key of keys) {
        if (data[key] && Array.isArray(data[key])) return data[key];
    }

    for (const key in data) {
        if (Array.isArray(data[key])) return data[key];
    }

    return [data];
}

function getItemCount(data: any): number {
    const items = extractItems(data);
    return items.length;
}

function getArrayKeyName(prompt: string): string {
    const lower = prompt.toLowerCase();
    if (lower.includes('product')) return 'products';
    if (lower.includes('user') || lower.includes('profile')) return 'profiles';
    if (lower.includes('employee')) return 'employees';
    if (lower.includes('customer')) return 'customers';
    return 'items';
}

export async function generateStructuredData(prompt: string) {
    return generateWithAI(prompt, {
        enforceJSON: true,
        maxRetries: 2,
    });
}
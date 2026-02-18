// /app/api/debug-prompt/route.ts
import { NextRequest, NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
    const { prompt } = await request.json();

    const detected = extractCountFromPrompt(prompt);

    return NextResponse.json({
        prompt,
        detectedCount: detected,
        willUseChunking: detected && detected >= 15,
        defaultCount: detected || 5
    });
}
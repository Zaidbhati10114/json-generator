import { NextRequest, NextResponse } from "next/server";
import { SarvamAIClient } from "sarvamai";

// Initialize once (outside handler = faster)
const client = new SarvamAIClient({
    apiSubscriptionKey: process.env.SARVAM_API_KEY!,
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const userMessage = body.message || "What is the capital of India?";

        const response = await client.chat.completions({
            messages: [
                {
                    role: "user",
                    content: userMessage,
                },
            ],
        });

        const reply = response.choices[0].message.content;

        return NextResponse.json({
            success: true,
            reply,
        });
    } catch (error: any) {
        console.error("Sarvam API Error:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch response from Sarvam AI",
            },
            { status: 500 }
        );
    }
}

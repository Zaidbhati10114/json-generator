import { NextRequest, NextResponse } from "next/server";
import { aj } from "@/lib/arcjet";
import { tokenBucket, shield, detectBot } from "@arcjet/next";
import { createJob } from "@/lib/mongodb/jobs";


/**
 * 🔐 Secure load test bypass
 */
function isLoadTestRequest(request: NextRequest) {
    const header = request.headers.get("x-load-test-secret");
    return (
        header &&
        process.env.LOAD_TEST_SECRET &&
        header === process.env.LOAD_TEST_SECRET
    );
}

export async function POST(request: NextRequest) {
    try {
        const isLoadTest = isLoadTestRequest(request);

        /**
         * 🔒 Arcjet protection (same as old API)
         */
        if (!isLoadTest) {
            const decision = await aj
                .withRule(
                    tokenBucket({
                        mode: "LIVE",
                        refillRate: 2,
                        interval: 60,
                        capacity: 3,
                    })
                )
                .withRule(detectBot({ mode: "LIVE", allow: [] }))
                .withRule(shield({ mode: "LIVE" }))
                .protect(request, { requested: 1 });

            if (decision.isDenied()) {
                return NextResponse.json(
                    { error: "Too many requests. Please try later." },
                    { status: 429 }
                );
            }
        }

        /**
         * 📥 Parse body
         */
        const { prompt } = await request.json();

        if (!prompt?.trim()) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        if (prompt.length > 2000) {
            return NextResponse.json(
                { error: "Prompt too long (max 2000 chars)" },
                { status: 400 }
            );
        }

        /**
         * 🧠 Create job in MongoDB queue
         */
        const jobId = await createJob(prompt);

        /**
         * ⚡ Return instantly
         */
        return NextResponse.json({
            success: true,
            jobId,
            message: "Job created successfully",
        });

    } catch (error) {
        console.error("Create job error:", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

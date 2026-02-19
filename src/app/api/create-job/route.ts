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

/**
 * 📊 Calculate cost based on prompt complexity
 */
function calculateRequestCost(prompt: string): number {
    const countMatch = prompt.match(/\b(\d+)\b/);
    const itemCount = countMatch ? parseInt(countMatch[1]) : 5;

    if (itemCount <= 10) return 1;
    if (itemCount <= 25) return 2;
    if (itemCount <= 50) return 3;
    return 5;
}

/**
 * 🌐 Get client IP for rate limiting
 */
function getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIp) {
        return realIp;
    }

    if (cfConnectingIp) {
        return cfConnectingIp;
    }

    return '127.0.0.1';
}

/**
 * 🎯 Simple in-memory rate limiter (development fallback)
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function simpleRateLimit(identifier: string, capacity: number, windowMs: number): boolean {
    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    // Clean up old entries
    if (record && now > record.resetAt) {
        rateLimitStore.delete(identifier);
    }

    const current = rateLimitStore.get(identifier);

    if (!current) {
        rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
        return true; // Allow
    }

    if (current.count >= capacity) {
        return false; // Deny
    }

    current.count++;
    return true; // Allow
}

export async function POST(request: NextRequest) {
    try {
        const isLoadTest = isLoadTestRequest(request);

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

        if (!isLoadTest) {
            const requestCost = calculateRequestCost(prompt);
            const clientIp = getClientIp(request);

            console.log(`🔍 Rate limit check: IP=${clientIp}, Cost=${requestCost}`);

            // Use simple rate limiter for development
            const isDev = process.env.NODE_ENV === 'development';

            if (isDev) {
                console.log(`🧪 Using simple rate limiter (dev mode)`);

                // Allow 15 requests per minute
                const allowed = simpleRateLimit(clientIp, 15, 60000);

                if (!allowed) {
                    console.log(`🚫 Rate limit exceeded (simple limiter)`);
                    return NextResponse.json(
                        {
                            error: "Rate limit exceeded",
                            message: "You're making requests too quickly. Please wait a moment.",
                        },
                        { status: 429 }
                    );
                }

                console.log(`✅ Request allowed (simple limiter)`);
            } else {
                // Use Arcjet in production
                console.log(`🔒 Using Arcjet (production mode)`);

                try {
                    const decision = await aj
                        .withRule(
                            tokenBucket({
                                mode: "LIVE",
                                characteristics: ["ip"],
                                refillRate: 10,
                                interval: 60,
                                capacity: 15,
                            })
                        )
                        .withRule(detectBot({ mode: "LIVE", allow: [] }))
                        .withRule(shield({ mode: "LIVE" }))
                        .protect(request, {
                            requested: requestCost,
                            ip: clientIp // ⭐ Add the IP here
                        });

                    console.log(`📊 Arcjet decision: ${decision.conclusion}`);

                    if (decision.isDenied()) {
                        console.log(`🚫 Request denied by Arcjet`);

                        if (decision.reason.isRateLimit()) {
                            return NextResponse.json(
                                {
                                    error: "Rate limit exceeded",
                                    message: "You're making requests too quickly. Please wait a moment.",
                                },
                                { status: 429 }
                            );
                        }

                        return NextResponse.json(
                            { error: "Request blocked" },
                            { status: 403 }
                        );
                    }

                    console.log(`✅ Request allowed by Arcjet`);
                } catch (arcjetError) {
                    console.error(`⚠️ Arcjet error:`, arcjetError);
                    // Continue without rate limiting if Arcjet fails
                }
            }
        }

        const jobId = await createJob(prompt);

        return NextResponse.json({
            success: true,
            jobId: jobId.toString(),
            id: jobId.toString(),
            message: "Job created successfully",
        });

    } catch (error) {
        console.error("Create job error:", error);
        return NextResponse.json(
            { error: "Failed to create job" },
            { status: 500 }
        );
    }
}
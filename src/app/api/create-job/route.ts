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
 * 🌐 Get client IP for rate limiting (used for dev mode)
 */
function getClientIp(request: NextRequest): string {
    const headers = [
        'x-forwarded-for',
        'x-real-ip',
        'cf-connecting-ip',
        'x-client-ip',
    ];

    for (const header of headers) {
        const value = request.headers.get(header);
        if (value) {
            const ip = value.split(',')[0].trim();
            if (ip && ip !== 'unknown') {
                return ip;
            }
        }
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
        return true;
    }

    if (current.count >= capacity) {
        return false;
    }

    current.count++;
    return true;
}

export async function POST(request: NextRequest) {
    try {
        const isLoadTest = isLoadTestRequest(request);

        /**
         * 📥 Parse body first (to calculate cost)
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
         * 🔒 Rate limiting (skip for load tests)
         */
        if (!isLoadTest) {
            const requestCost = calculateRequestCost(prompt);
            const isDev = process.env.NODE_ENV === 'development';

            console.log(`🔍 Rate limit check: Cost=${requestCost}, Env=${isDev ? 'dev' : 'prod'}`);

            if (isDev) {
                // Development: Use simple in-memory rate limiter
                console.log(`🧪 Using simple rate limiter (dev mode)`);

                const clientIp = getClientIp(request);
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
                // Production: Use Arcjet with automatic fingerprinting
                console.log(`🔒 Using Arcjet (production mode)`);

                try {
                    const decision = await aj
                        .withRule(
                            tokenBucket({
                                mode: "LIVE",
                                characteristics: [], // Empty = automatic request fingerprinting
                                refillRate: 10,
                                interval: 60,
                                capacity: 15,
                            })
                        )
                        .withRule(
                            detectBot({
                                mode: "LIVE",
                                allow: [],
                            })
                        )
                        .withRule(
                            shield({
                                mode: "LIVE",
                            })
                        )
                        .protect(request, { requested: requestCost });

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
                            {
                                error: "Request blocked",
                                message: "Your request was blocked by our security system.",
                            },
                            { status: 403 }
                        );
                    }

                    console.log(`✅ Request allowed by Arcjet`);
                } catch (arcjetError: any) {
                    console.error(`⚠️ Arcjet error:`, arcjetError.message);

                    // Fallback to simple rate limiter if Arcjet fails
                    console.log(`⚠️ Falling back to simple rate limiter`);

                    const allowed = simpleRateLimit('fallback', 15, 60000);

                    if (!allowed) {
                        return NextResponse.json(
                            {
                                error: "Rate limit exceeded",
                                message: "You're making requests too quickly. Please wait a moment.",
                            },
                            { status: 429 }
                        );
                    }

                    console.log(`✅ Request allowed (fallback limiter)`);
                }
            }
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
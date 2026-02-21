// app/api/create-live/route.ts (or wherever this file is located)
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { nanoid } from "nanoid";
import { aj } from "@/lib/arcjet";
import { tokenBucket, shield, detectBot } from "@arcjet/next";

export async function POST(request: NextRequest) {
    try {
        // Apply Arcjet protection for URL generation
        // More restrictive limits since URL generation is more resource-intensive
        const decision = await aj
            .withRule(
                tokenBucket({
                    mode: "LIVE",
                    refillRate: 2,      // 2 tokens per minute
                    interval: 60,       // every 60 seconds
                    capacity: 3,        // max 3 tokens (allows small burst)
                })
            )
            .withRule(
                // Block bots from generating URLs
                detectBot({
                    mode: "LIVE",
                    allow: [], // Block all automated bots
                })
            )
            .withRule(
                // Protect against injection attacks
                shield({
                    mode: "LIVE",
                })
            )
            .protect(request, {
                requested: 1, // Each URL generation consumes 1 token
            });

        // Extract rate limit info
        // @ts-ignore
        const remaining = decision.reason.remaining || 0;
        // @ts-ignore
        const resetTime = decision.reason.resetTime || Date.now() + 60000;
        const country = decision.ip.countryName || "Unknown";

        // Check if request was denied
        if (decision.isDenied()) {
            const waitTime = Math.ceil((resetTime - Date.now()) / 1000);

            let errorMessage = "Request denied";
            if (decision.reason.isRateLimit()) {
                errorMessage = "Rate limit exceeded. You can generate up to 3 URLs per minute. Please wait.";
            } else if (decision.reason.isBot()) {
                errorMessage = "Bot detected. URL generation is only available for human users.";
            } else if (decision.reason.isShield()) {
                errorMessage = "Request blocked for security reasons.";
            }

            return NextResponse.json(
                {
                    error: errorMessage,
                    retryAfter: waitTime,
                    resetTime: new Date(resetTime).toISOString(),
                    remainingTokens: Number(remaining),
                    country,
                },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": "3",
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": resetTime.toString(),
                        "Retry-After": waitTime.toString(),
                    },
                }
            );
        }

        // Get MongoDB connection
        const db = await getDb();
        const body = await request.json();
        const { data, prompt } = body || {};

        // 🔒 Validate required data
        if (!data) {
            return NextResponse.json(
                {
                    error: "Missing 'data' field",
                    remainingTokens: Number(remaining),
                },
                { status: 400 }
            );
        }

        // 🌐 Get IP from Arcjet decision (more reliable than headers)
        //@ts-ignore
        const ip = decision.ip.address || "unknown";
        const userAgent = request.headers.get("user-agent") || "unknown";

        // ⚙️ Daily limit check: max 10 URLs per IP in 24h
        // Keep this as an additional safeguard on top of Arcjet's per-minute limit
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentCount = await db.collection("live_datasets").countDocuments({
            ip,
            createdAt: { $gte: since },
        });

        if (recentCount >= 10) {
            return NextResponse.json(
                {
                    error: "Daily limit reached. You can generate up to 10 URLs per day.",
                    remainingTokens: Number(remaining),
                    resetTime: new Date(resetTime).toISOString(),
                    dailyLimitResets: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": "3",
                        "X-RateLimit-Remaining": remaining.toString(),
                        "X-RateLimit-Reset": resetTime.toString(),
                        "X-Daily-Limit": "10",
                        "X-Daily-Remaining": String(10 - recentCount),
                    },
                }
            );
        }

        // 🧱 Build record
        const shortId = nanoid(10);
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days (matching your feature description)

        await db.collection("live_datasets").insertOne({
            shortId,
            data,
            prompt,
            createdAt,
            expiresAt,
            ip,
            userAgent,
            country, // Store country info from Arcjet
            requestCount: 0,
            lastAccessedAt: new Date(),
        });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://json-generator-mu.vercel.app";
        const apiUrl = `${baseUrl}/api/live/${shortId}`;

        return NextResponse.json(
            {
                apiUrl,
                expiresAt,
                shortId,
                remainingTokens: Number(remaining),
                resetTime: new Date(resetTime).toISOString(),
                dailyRemaining: 10 - recentCount - 1,
                country,
            },
            {
                status: 201,
                headers: {
                    "X-RateLimit-Limit": "3",
                    "X-RateLimit-Remaining": remaining.toString(),
                    "X-RateLimit-Reset": resetTime.toString(),
                    "X-Daily-Limit": "10",
                    "X-Daily-Remaining": String(10 - recentCount - 1),
                },
            }
        );
    } catch (error) {
        console.error("❌ Error creating live data:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
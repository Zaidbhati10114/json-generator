import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
    try {
        const db = await getDb();
        const body = await request.json();
        const { data, prompt } = body || {};

        // 🔒 Validate required data
        if (!data) {
            return NextResponse.json({ error: "Missing 'data' field" }, { status: 400 });
        }

        // 🌐 Identify client
        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0] ||
            request.headers.get("x-real-ip") ||
            "unknown";
        const userAgent = request.headers.get("user-agent") || "unknown";

        // ⚙️ Rate limit: max 10 URLs per IP in 24h
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentCount = await db.collection("live_datasets").countDocuments({
            ip,
            createdAt: { $gte: since },
        });

        if (recentCount >= 10) {
            return NextResponse.json(
                { error: "Daily limit reached (10 URLs per IP per day)" },
                { status: 429 }
            );
        }

        // 🧱 Build record
        const shortId = nanoid(10);
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000); // +5 days

        await db.collection("live_datasets").insertOne({
            shortId,
            data,
            prompt,
            createdAt,
            expiresAt,
            ip,
            userAgent,
            requestCount: 0,
        });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://json-generator-mu.vercel.app";
        const apiUrl = `${baseUrl}/api/live/${shortId}`;

        return NextResponse.json(
            { apiUrl, expiresAt, shortId },
            { status: 201 }
        );
    } catch (error) {
        console.error("❌ Error creating live data:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

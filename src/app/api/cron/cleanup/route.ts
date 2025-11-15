import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Required for serverless cron routes

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);

        const now = new Date();

        // Compute thresholds
        const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

        // 🧹 Delete expired (older than 5 days)
        const expiredResult = await db
            .collection("live_datasets")
            .deleteMany({ createdAt: { $lt: fiveDaysAgo } });

        // 💤 Delete inactive (no access in last 3 days)
        const inactiveResult = await db
            .collection("live_datasets")
            .deleteMany({
                lastAccessedAt: { $lt: threeDaysAgo },
            });

        return NextResponse.json({
            status: "ok",
            deletedExpired: expiredResult.deletedCount,
            deletedInactive: inactiveResult.deletedCount,
            timestamp: now.toISOString(),
        });
    } catch (error: any) {
        console.error("❌ Cron cleanup error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const db = await getDb();
        //console.log("📦 Connected DB:", db.databaseName);

        const { id } = await context.params; // ✅ FIXED — must await
        //console.log("🔍 Looking for shortId:", id);

        const dataset = await db.collection("live_datasets").findOne({ shortId: id });

        //console.log("🧠 Query result:", dataset);

        if (!dataset) {
            return NextResponse.json({ error: "Data not found or expired" }, { status: 404 });
        }

        // Optional: limit fetches
        if ((dataset.requestCount ?? 0) >= 100) {
            return NextResponse.json({ error: "Fetch limit exceeded" }, { status: 403 });
        }

        await db.collection("live_datasets").updateOne(
            { shortId: id },
            { $set: { lastAccessedAt: new Date() }, $inc: { requestCount: 1 } }
        );

        return NextResponse.json(dataset.data);
    } catch (error) {
        console.error("❌ Error fetching live data:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

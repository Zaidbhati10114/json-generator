import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
    try {
        const db = await getDb();
        // Try reading server status or list collections
        const collections = await db.listCollections().toArray();

        return NextResponse.json({
            ok: true,
            database: db.databaseName,
            collections: collections.map((c) => c.name),
        });
    } catch (error: any) {
        console.error("❌ MongoDB test error:", error);
        return NextResponse.json(
            { ok: false, error: error.message },
            { status: 500 }
        );
    }
}

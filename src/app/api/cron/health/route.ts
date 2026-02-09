// app/api/cron/health/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
    try {
        const db = await getDb();

        const state = await db.collection("app_state").findOne({
            key: "gemini_model_check",
        });

        const activeModel = await db.collection("ai_models").findOne({
            provider: "gemini",
            status: "active",
        });

        const allModels = await db
            .collection("ai_models")
            .find({ provider: "gemini" })
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();

        const recentChanges = await db
            .collection("model_changes")
            .find({})
            .sort({ changedAt: -1 })
            .limit(5)
            .toArray();

        const modelsSynced =
            activeModel?.model === process.env.GEMINI_PRIMARY_MODEL;

        return NextResponse.json({
            status: "healthy",
            lastCheck: state?.lastCheckedAt || null,
            currentActiveModel: activeModel?.model || "none",
            envModel: process.env.GEMINI_PRIMARY_MODEL,
            modelsSynced,
            syncStatus: modelsSynced
                ? "✅ In sync"
                : "⚠️ Needs update - check cron logs",
            recentModels: allModels.map((m) => ({
                model: m.model,
                status: m.status,
                createdAt: m.createdAt,
                notes: m.notes,
            })),
            recentChanges: recentChanges.map((c) => ({
                from: c.oldModel,
                to: c.newModel,
                when: c.changedAt,
                reason: c.reason,
            })),
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: "unhealthy",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
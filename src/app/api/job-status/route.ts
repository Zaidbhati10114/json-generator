import { getJob } from "@/lib/mongodb/jobs";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
    try {
        const jobId = request.nextUrl.searchParams.get("id");

        if (!jobId) {
            return NextResponse.json(
                { error: "Job ID is required" },
                { status: 400 }
            );
        }

        const job = await getJob(jobId);

        if (!job) {
            return NextResponse.json(
                { error: "Job not found" },
                { status: 404 }
            );
        }

        /**
         * Return minimal safe data
         */
        return NextResponse.json({
            status: job.status,
            result: job.result,
            error: job.error,
            modelUsed: job.modelUsed,
            createdAt: job.createdAt,
            startedAt: job.startedAt,
            completedAt: job.completedAt,
        });
    } catch (error) {
        console.error("Job status error:", error);

        return NextResponse.json(
            { error: "Failed to fetch job status" },
            { status: 500 }
        );
    }
}

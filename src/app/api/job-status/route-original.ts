import { NextRequest, NextResponse } from "next/server";
import { getJobStatus } from "@/lib/mongodb/jobs";

export async function GET(request: NextRequest) {
    try {
        const jobId = request.nextUrl.searchParams.get("id");

        if (!jobId || jobId === 'undefined' || jobId === 'null') {
            return NextResponse.json(
                { error: "Job ID is required and must be valid" },
                { status: 400 }
            );
        }

        const job = await getJobStatus(jobId);

        if (!job) {
            return NextResponse.json(
                { error: "Job not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(job);

    } catch (error: any) {
        console.error("Job status error:", error);

        // Return better error messages
        if (error.message.includes('Invalid job ID')) {
            return NextResponse.json(
                { error: "Invalid job ID format" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to get job status", message: error.message },
            { status: 500 }
        );
    }
}
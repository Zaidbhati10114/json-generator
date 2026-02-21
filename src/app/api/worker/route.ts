import { NextRequest, NextResponse } from "next/server";
import { checkWorkerAuthorization } from "@/services/authorization";
import { getPendingJobsForProcessing, processJobsInBatches } from "@/services/jobProcessing";
import { createUnauthorizedResponse, createServerErrorResponse, createSuccessResponse } from "@/services/responseFormatting";

export async function GET(request: NextRequest) {
  try {
    // 🔐 Check authorization first
    const authResult = checkWorkerAuthorization(request);
    if (!authResult.authorized) {
      return createUnauthorizedResponse(authResult.error);
    }

    console.log("👷 Worker started...");

    const jobs = await getPendingJobsForProcessing(20);

    if (!jobs.length) {
      return createSuccessResponse({
        message: "No pending jobs",
      });
    }

    // Process jobs in parallel batches
    const results = await processJobsInBatches(jobs, 5);

    return createSuccessResponse({
      processedJobs: jobs.length,
      ...results
    });

  } catch (error: any) {
    console.error("💥 Worker error:", error);
    return createServerErrorResponse("Worker failed");
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getJobStatusService, extractJobIdFromRequest } from "@/services/jobStatus";
import { createNotFoundResponse, createValidationErrorResponse, createServerErrorResponse } from "@/services/responseFormatting";

export async function GET(request: NextRequest) {
  try {
    const jobId = extractJobIdFromRequest(request);

    const result = await getJobStatusService({ jobId: jobId || "" });

    if (!result.success) {
      if (result.statusCode === 400) {
        return createValidationErrorResponse("Job ID", result.error || "Invalid job ID");
      } else if (result.statusCode === 404) {
        return createNotFoundResponse("Job");
      } else {
        return createServerErrorResponse(result.error);
      }
    }

    return NextResponse.json(result.job);

  } catch (error: any) {
    console.error("Job status API error:", error);
    return createServerErrorResponse("Failed to get job status");
  }
}

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/services/rateLimiting";
import { createJobService, formatJobCreationResponse } from "@/services/jobCreation";
import { isLoadTestRequest } from "@/utils/config";

export async function POST(request: NextRequest) {
  try {
    const isLoadTest = isLoadTestRequest(request);

    // Parse request body
    const body = await request.json();
    const { prompt } = body;

    // Create job with validation
    const jobResult = await createJobService({ prompt });

    if (!jobResult.success) {
      return NextResponse.json(
        { error: jobResult.error },
        { status: jobResult.statusCode }
      );
    }

    // Check rate limiting
    const rateLimitResult = await checkRateLimit(
      request,
      jobResult.requestCost ?? 1,
      isLoadTest,
      'CREATE_JOB'
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: rateLimitResult.error,
          message: "You're making requests too quickly. Please wait a moment.",
        },
        { status: rateLimitResult.statusCode }
      );
    }

    // Return successful response
    const response = formatJobCreationResponse(jobResult);
    return NextResponse.json(response);

  } catch (error) {
    console.error("Create job API error:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}

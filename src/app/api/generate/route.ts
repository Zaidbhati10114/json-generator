import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/services/rateLimiting";
import { generateAIData, formatGenerationResponse } from "@/services/aiGeneration";
import { isLoadTestRequest } from "@/services/authorization";
import { createRateLimitResponse, createServerErrorResponse } from "@/services/responseFormatting";

export async function POST(request: NextRequest) {
  try {
    const isLoadTest = isLoadTestRequest(request);

    // Default values when Arcjet is bypassed
    let remaining = 999;
    let resetTime = Date.now() + 60000;
    let country = "LoadTest";

    // Check rate limiting
    const rateLimitResult = await checkRateLimit(
      request,
      1, // Generate always costs 1
      isLoadTest,
      'GENERATE'
    );

    if (!rateLimitResult.allowed) {
      const waitTime = Math.ceil((resetTime - Date.now()) / 1000);
      return createRateLimitResponse({
        error: rateLimitResult.error || "Rate limit exceeded. Please try again later.",
        retryAfter: waitTime,
        resetTime: new Date(resetTime).toISOString(),
        remainingTokens: Number(remaining),
        country,
      });
    }

    // Parse request body
    const { prompt } = await request.json();

    // Generate AI data
    const generationResult = await generateAIData({ prompt });

    if (!generationResult.success) {
      return createServerErrorResponse(generationResult.error);
    }

    // Format response with rate limit metadata
    const response = formatGenerationResponse(generationResult, {
      remainingTokens: Number(remaining),
      resetTime: new Date(resetTime).toISOString(),
      country,
      loadTestMode: isLoadTest,
    });

    return NextResponse.json(response, {
      headers: {
        "X-RateLimit-Limit": "3",
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": resetTime.toString(),
      },
    });

  } catch (error) {
    console.error("❌ Error generating text:", error);
    return createServerErrorResponse(
      error instanceof Error ? error.message : "Internal Server Error"
    );
  }
}

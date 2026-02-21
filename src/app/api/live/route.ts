import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/services/rateLimiting";
import { createLiveData } from "@/services/liveData";
import { createRateLimitResponse, createServerErrorResponse } from "@/services/responseFormatting";

export async function POST(request: NextRequest) {
  try {
    // Check rate limiting for live endpoint
    const rateLimitResult = await checkRateLimit(
      request,
      1, // Live data creation costs 1
      false, // No load test bypass for live endpoint
      'LIVE'
    );

    // Default values when rate limiting passes
    let remaining = 999;
    let resetTime = Date.now() + 60000;
    let country = "Unknown";

    if (!rateLimitResult.allowed) {
      const waitTime = Math.ceil((resetTime - Date.now()) / 1000);
      return createRateLimitResponse({
        error: "Rate limit exceeded. You can generate up to 3 URLs per minute. Please wait.",
        retryAfter: waitTime,
        resetTime: new Date(resetTime).toISOString(),
        remainingTokens: Number(remaining),
        country,
      });
    }

    // Parse request body
    const body = await request.json();
    const { data, prompt } = body || {};

    // Create live dataset
    const liveDataResult = await createLiveData(
      request,
      { data, prompt },
      {
        remainingTokens: Number(remaining),
        resetTime: new Date(resetTime).toISOString(),
        country,
      }
    );

    if (!liveDataResult.success) {
      if (liveDataResult.statusCode === 429) {
        // Daily limit exceeded
        return createRateLimitResponse({
          error: liveDataResult.error || "Daily limit reached",
          resetTime: liveDataResult.resetTime,
          remainingTokens: liveDataResult.remainingTokens,
          country: liveDataResult.country,
          dailyRemaining: liveDataResult.dailyRemaining,
        });
      } else {
        return createServerErrorResponse(liveDataResult.error);
      }
    }

    return NextResponse.json(
      {
        apiUrl: liveDataResult.apiUrl,
        expiresAt: liveDataResult.expiresAt,
        shortId: liveDataResult.shortId,
        remainingTokens: liveDataResult.remainingTokens,
        resetTime: liveDataResult.resetTime,
        dailyRemaining: liveDataResult.dailyRemaining,
        country: liveDataResult.country,
      },
      {
        status: 201,
        headers: {
          "X-RateLimit-Limit": "3",
          "X-RateLimit-Remaining": liveDataResult.remainingTokens?.toString() || "0",
          "X-RateLimit-Reset": new Date(liveDataResult.resetTime || "").getTime().toString(),
          "X-Daily-Limit": "10",
          "X-Daily-Remaining": liveDataResult.dailyRemaining?.toString() || "0",
        },
      }
    );

  } catch (error) {
    console.error("❌ Error creating live data:", error);
    return createServerErrorResponse("Internal server error");
  }
}

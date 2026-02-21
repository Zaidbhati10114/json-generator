import { getDb } from "@/lib/mongodb";
import { nanoid } from "nanoid";
import { getClientIp } from "@/utils/validation";
import { RATE_LIMIT_CONFIG } from "@/utils/config";

export interface LiveDataRequest {
  data: any;
  prompt?: string;
}

export interface LiveDataResult {
  success: boolean;
  apiUrl?: string;
  shortId?: string;
  expiresAt?: string;
  remainingTokens?: number;
  resetTime?: string;
  dailyRemaining?: number;
  country?: string;
  error?: string;
  statusCode?: number;
}

/**
 * Check daily limit for live data creation
 */
async function checkDailyLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const db = await getDb();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const recentCount = await db.collection("live_datasets").countDocuments({
    ip,
    createdAt: { $gte: since },
  });

  return {
    allowed: recentCount < RATE_LIMIT_CONFIG.LIVE.DAILY_LIMIT,
    remaining: Math.max(0, RATE_LIMIT_CONFIG.LIVE.DAILY_LIMIT - recentCount),
  };
}

/**
 * Create live dataset with rate limiting
 */
export async function createLiveData(
  request: Request,
  requestData: LiveDataRequest,
  rateLimitMetadata: {
    remainingTokens: number;
    resetTime: string;
    country?: string;
  }
): Promise<LiveDataResult> {
  const { data, prompt } = requestData;

  // Validate required data
  if (!data) {
    return {
      success: false,
      error: "Missing 'data' field",
      statusCode: 400,
    };
  }

  try {
    // Get IP and user agent
    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Check daily limit
    const dailyLimitCheck = await checkDailyLimit(ip);
    
    if (!dailyLimitCheck.allowed) {
      return {
        success: false,
        error: "Daily limit reached. You can generate up to 10 URLs per day.",
        statusCode: 429,
        remainingTokens: rateLimitMetadata.remainingTokens,
        resetTime: rateLimitMetadata.resetTime,
        dailyRemaining: 0,
      };
    }

    // Create record
    const db = await getDb();
    const shortId = nanoid(10);
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days

    await db.collection("live_datasets").insertOne({
      shortId,
      data,
      prompt,
      createdAt,
      expiresAt,
      ip,
      userAgent,
      country: rateLimitMetadata.country,
      requestCount: 0,
      lastAccessedAt: new Date(),
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://json-generator-mu.vercel.app";
    const apiUrl = `${baseUrl}/api/live/${shortId}`;

    return {
      success: true,
      apiUrl,
      shortId,
      expiresAt: expiresAt.toISOString(),
      remainingTokens: rateLimitMetadata.remainingTokens,
      resetTime: rateLimitMetadata.resetTime,
      dailyRemaining: dailyLimitCheck.remaining - 1,
      country: rateLimitMetadata.country,
    };

  } catch (error) {
    console.error("❌ Error creating live data:", error);
    return {
      success: false,
      error: "Internal server error",
      statusCode: 500,
    };
  }
}

import { NextRequest, NextResponse } from "next/server";
import { aj } from "@/lib/arcjet";
import { tokenBucket, shield, detectBot } from "@arcjet/next";
import { RATE_LIMIT_CONFIG, ERROR_MESSAGES, isDevelopment } from "@/utils/config";
import { getClientIp } from "@/utils/validation";

/**
 * Simple in-memory rate limiter (development fallback)
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function simpleRateLimit(identifier: string, capacity: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Clean up old entries
  if (record && now > record.resetAt) {
    rateLimitStore.delete(identifier);
  }

  const current = rateLimitStore.get(identifier);

  if (!current) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= capacity) {
    return false;
  }

  current.count++;
  return true;
}

/**
 * Rate limiting result interface
 */
export interface RateLimitResult {
  allowed: boolean;
  error?: string;
  statusCode?: number;
}

/**
 * Check rate limiting for a request
 */
export async function checkRateLimit(
  request: NextRequest,
  requestCost: number,
  isLoadTest: boolean,
  endpointType: 'CREATE_JOB' | 'GENERATE' | 'LIVE' = 'CREATE_JOB'
): Promise<RateLimitResult> {
  // Skip rate limiting for load tests
  if (isLoadTest) {
    console.log("🔓 Skipping rate limit for load test");
    return { allowed: true };
  }

  const devMode = isDevelopment();
  const config = RATE_LIMIT_CONFIG[endpointType];

  console.log(`🔍 Rate limit check: Cost=${requestCost}, Env=${devMode ? 'dev' : 'prod'}, Endpoint=${endpointType}`);

  if (devMode) {
    return checkDevelopmentRateLimit(request, config);
  } else {
    return checkProductionRateLimit(request, requestCost, config);
  }
}

/**
 * Development mode rate limiting (simple in-memory)
 */
function checkDevelopmentRateLimit(request: NextRequest, config: any): RateLimitResult {
  console.log("🧪 Using simple rate limiter (dev mode)");

  const clientIp = getClientIp(request);
  const allowed = simpleRateLimit(
    clientIp,
    config.DEV_CAPACITY,
    config.DEV_WINDOW_MS
  );

  if (!allowed) {
    console.log("🚫 Rate limit exceeded (simple limiter)");
    return {
      allowed: false,
      error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
      statusCode: 429,
    };
  }

  console.log("✅ Request allowed (simple limiter)");
  return { allowed: true };
}

/**
 * Production mode rate limiting (Arcjet)
 */
async function checkProductionRateLimit(
  request: NextRequest,
  requestCost: number,
  config: any
): Promise<RateLimitResult> {
  console.log("🔒 Using Arcjet (production mode)");

  try {
    const decision = await aj
      .withRule(
        tokenBucket({
          mode: "LIVE",
          characteristics: [], // Empty = automatic request fingerprinting
          refillRate: config.REFILL_RATE,
          interval: config.INTERVAL,
          capacity: config.CAPACITY,
        })
      )
      .withRule(
        detectBot({
          mode: "LIVE",
          allow: [],
        })
      )
      .withRule(
        shield({
          mode: "LIVE",
        })
      )
      .protect(request, { requested: requestCost });

    console.log(`📊 Arcjet decision: ${decision.conclusion}`);

    if (decision.isDenied()) {
      console.log("🚫 Request denied by Arcjet");

      if (decision.reason.isRateLimit()) {
        return {
          allowed: false,
          error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
          statusCode: 429,
        };
      }

      return {
        allowed: false,
        error: ERROR_MESSAGES.REQUEST_BLOCKED,
        statusCode: 403,
      };
    }

    console.log("✅ Request allowed by Arcjet");
    return { allowed: true };

  } catch (arcjetError: any) {
    console.error("⚠️ Arcjet error:", arcjetError.message);

    // Fallback to simple rate limiter if Arcjet fails
    console.log("⚠️ Falling back to simple rate limiter");

    const allowed = simpleRateLimit('fallback', config.CAPACITY, config.DEV_WINDOW_MS);

    if (!allowed) {
      return {
        allowed: false,
        error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
        statusCode: 429,
      };
    }

    console.log("✅ Request allowed (fallback limiter)");
    return { allowed: true };
  }
}

import { NextResponse } from "next/server";

/**
 * Standard API response interface
 */
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
  metadata?: Record<string, any>;
}

/**
 * Rate limit response interface
 */
export interface RateLimitResponse {
  error: string;
  retryAfter?: number;
  resetTime?: string;
  remainingTokens?: number;
  country?: string;
  dailyLimitResets?: string;
  dailyRemaining?: number;
}

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  metadata?: Record<string, any>,
  statusCode: number = 200
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    metadata,
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Create an error response
 */
export function createErrorResponse(
  error: string,
  statusCode: number = 400,
  message?: string
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error,
    ...(message && { message }),
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Create a rate limit response
 */
export function createRateLimitResponse(
  rateLimitData: RateLimitResponse,
  statusCode: number = 429
): NextResponse<RateLimitResponse> {
  const headers: Record<string, string> = {};

  // Add standard rate limit headers
  if (rateLimitData.remainingTokens !== undefined) {
    headers["X-RateLimit-Remaining"] = rateLimitData.remainingTokens.toString();
  }
  
  if (rateLimitData.resetTime) {
    headers["X-RateLimit-Reset"] = new Date(rateLimitData.resetTime).getTime().toString();
  }
  
  if (rateLimitData.retryAfter) {
    headers["Retry-After"] = rateLimitData.retryAfter.toString();
  }

  // Add daily limit headers if present
  if (rateLimitData.dailyRemaining !== undefined) {
    headers["X-Daily-Limit"] = "10";
    headers["X-Daily-Remaining"] = rateLimitData.dailyRemaining.toString();
  }

  return NextResponse.json(rateLimitData, {
    status: statusCode,
    headers,
  });
}

/**
 * Create a validation error response
 */
export function createValidationErrorResponse(
  field: string,
  message: string
): NextResponse<ApiResponse> {
  return createErrorResponse(
    `Validation failed for ${field}`,
    400,
    message
  );
}

/**
 * Create a not found response
 */
export function createNotFoundResponse(
  resource: string = "Resource"
): NextResponse<ApiResponse> {
  return createErrorResponse(
    `${resource} not found`,
    404
  );
}

/**
 * Create an unauthorized response
 */
export function createUnauthorizedResponse(
  message: string = "Unauthorized"
): NextResponse<ApiResponse> {
  return createErrorResponse(message, 401);
}

/**
 * Create a server error response
 */
export function createServerErrorResponse(
  error?: string
): NextResponse<ApiResponse> {
  return createErrorResponse(
    error || "Internal server error",
    500
  );
}

import { NextRequest } from "next/server";
import { API_CONFIG } from "@/utils/config";

/**
 * Authorization result interface
 */
export interface AuthResult {
  authorized: boolean;
  error?: string;
  statusCode?: number;
}

/**
 * Check if request is authorized for worker endpoints
 */
export function checkWorkerAuthorization(request: NextRequest): AuthResult {
  const headerSecret = request.headers.get("x-worker-secret");
  const querySecret = request.nextUrl.searchParams.get("secret");
  const secret = process.env.LOAD_TEST_SECRET;

  // Ensure secret is configured
  if (!secret) {
    console.error("⚠️  LOAD_TEST_SECRET environment variable is not set!");
    return {
      authorized: false,
      error: "Server configuration error",
      statusCode: 500,
    };
  }

  // Check if either header or query param matches the secret
  const isValid = Boolean(
    (headerSecret && headerSecret === secret) ||
    (querySecret && querySecret === secret)
  );

  if (!isValid) {
    console.warn("🚫 Unauthorized access attempt detected");
    return {
      authorized: false,
      error: "Unauthorized",
      statusCode: 401,
    };
  }

  return { authorized: true };
}

/**
 * Check if request is a load test request
 */
export function isLoadTestRequest(request: NextRequest): boolean {
  const header = request.headers.get(API_CONFIG.LOAD_TEST_HEADER);
  const secret = process.env.LOAD_TEST_SECRET;
  return !!(header && secret && header === secret);
}

/**
 * Check if request has valid load test bypass
 */
export function checkLoadTestBypass(request: NextRequest): AuthResult {
  const isLoadTest = isLoadTestRequest(request);
  
  if (isLoadTest) {
    console.log("🔓 Load test bypass activated");
    return { authorized: true };
  }
  
  return { authorized: false };
}

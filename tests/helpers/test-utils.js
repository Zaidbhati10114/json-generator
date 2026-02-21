import { BASE_URL, API_ENDPOINTS, LOAD_TEST_HEADERS } from "./config.js";

/**
 * Make a POST request to create a job
 */
export async function createJob(prompt, useLoadTestHeaders = false) {
  const headers = {
    "Content-Type": "application/json",
    ...(useLoadTestHeaders && LOAD_TEST_HEADERS["x-load-test-secret"] && {
      "x-load-test-secret": LOAD_TEST_HEADERS["x-load-test-secret"],
    }),
  };

  const response = await fetch(`${BASE_URL}${API_ENDPOINTS.CREATE_JOB}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();
  return { response, data };
}

/**
 * Print test header
 */
export function printTestHeader(title) {
  console.log(`🧪 ${title}\n`);
  console.log("=".repeat(60));
}

/**
 * Print test results summary
 */
export function printResultsSummary(successCount, rateLimitedCount, errorCount = 0, expected) {
  console.log("\n" + "=".repeat(60));
  console.log(`✅ Successful: ${successCount}/20`);
  console.log(`🚫 Rate Limited: ${rateLimitedCount}/20`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount}/20`);
  }
  console.log(`Expected: ${expected}`);
  console.log("=".repeat(60));
}

/**
 * Print rate limit warning if no rate limiting occurred
 */
export function printRateLimitWarning() {
  console.log("\n⚠️  WARNING: No rate limiting occurred!");
  console.log("Possible causes:");
  console.log("1. Arcjet is in DRY_RUN mode");
  console.log("2. IP characteristics not working in localhost");
  console.log("3. Token bucket not properly configured");
}

/**
 * Process a single test result
 */
export function processTestResult(result, requestNumber) {
  if (result.response.ok) {
    const jobId = result.data.jobId?.substring(0, 8);
    console.log(`✅ Request ${requestNumber}: Success (jobId: ${jobId}...)`);
    return { success: true, rateLimited: false, error: false };
  } else if (result.response.status === 429) {
    console.log(`🚫 Request ${requestNumber}: Rate Limited`);
    return { success: false, rateLimited: true, error: false };
  } else {
    console.log(`❌ Request ${requestNumber}: Error (${result.response.status}) - ${result.data.error}`);
    return { success: false, rateLimited: false, error: true };
  }
}

/**
 * Handle network errors
 */
export function handleNetworkError(error, requestNumber) {
  console.log(`❌ Request ${requestNumber}: Network error`);
  return { success: false, rateLimited: false, error: true };
}

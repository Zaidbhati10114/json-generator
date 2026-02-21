// tests/load/rate-limit-parallel.test.js
import {
  createJob,
  printTestHeader,
  printResultsSummary,
  processTestResult,
} from "../helpers/test-utils.js";
import { RATE_LIMIT_CONFIG } from "../helpers/config.js";

async function testRateLimitingParallel() {
  printTestHeader("Testing Rate Limiting (Parallel)");

  const requests = [];

  // Try to make 20 requests rapidly in parallel
  for (let i = 1; i <= RATE_LIMIT_CONFIG.TEST_REQUESTS; i++) {
    const promise = createJob(`Generate 5 items - test ${i}`).then(
      (result) => ({
        requestNumber: i,
        ...result,
      }),
    );

    requests.push(promise);
  }

  const results = await Promise.all(requests);

  console.log("\n📊 Results:\n");

  let successCount = 0;
  let rateLimitedCount = 0;
  let errorCount = 0;

  results.forEach((result) => {
    const processed = processTestResult(result, result.requestNumber);

    if (processed.success) successCount++;
    else if (processed.rateLimited) rateLimitedCount++;
    else errorCount++;
  });

  printResultsSummary(
    successCount,
    rateLimitedCount,
    errorCount,
    `~${RATE_LIMIT_CONFIG.EXPECTED_SUCCESS} successful (capacity limit)`,
  );
}

testRateLimitingParallel().catch(console.error);

// tests/load/rate-limit-sequential.test.js
import {
  createJob,
  printTestHeader,
  printResultsSummary,
  printRateLimitWarning,
  processTestResult,
  handleNetworkError,
} from "../helpers/test-utils.js";
import { RATE_LIMIT_CONFIG } from "../helpers/config.js";

async function testRateLimitingSequential() {
  printTestHeader("Testing Rate Limiting (Sequential)");

  let successCount = 0;
  let rateLimitedCount = 0;
  let errorCount = 0;

  // Make requests one at a time
  for (let i = 1; i <= RATE_LIMIT_CONFIG.TEST_REQUESTS; i++) {
    try {
      const result = await createJob(`Generate 5 items - test ${i}`);
      const processed = processTestResult(result, i);

      if (processed.success) successCount++;
      else if (processed.rateLimited) rateLimitedCount++;
      else errorCount++;

      // Small delay to see the progression
      await new Promise((r) =>
        setTimeout(r, RATE_LIMIT_CONFIG.SEQUENTIAL_DELAY),
      );
    } catch (error) {
      const processed = handleNetworkError(error, i);
      if (processed.error) errorCount++;
    }
  }

  printResultsSummary(
    successCount,
    rateLimitedCount,
    errorCount,
    `~${RATE_LIMIT_CONFIG.EXPECTED_SUCCESS} successful, ~${RATE_LIMIT_CONFIG.EXPECTED_RATE_LIMITED} rate limited`,
  );

  if (rateLimitedCount === 0) {
    printRateLimitWarning();
  }
}

testRateLimitingSequential().catch(console.error);

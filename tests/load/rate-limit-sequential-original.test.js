// test-rate-limit-sequential.js
const BASE_URL = "http://localhost:3000";

async function testRateLimitingSequential() {
  console.log("🧪 Testing Rate Limiting (Sequential)\n");
  console.log("=".repeat(60));

  let successCount = 0;
  let rateLimitedCount = 0;

  // Make requests one at a time
  for (let i = 1; i <= 20; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/create-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `Generate 5 items - test ${i}` }),
      });

      const data = await res.json();

      if (res.ok) {
        successCount++;
        console.log(
          `✅ Request ${i}: Success (jobId: ${data.jobId?.substring(0, 8)}...)`,
        );
      } else if (res.status === 429) {
        rateLimitedCount++;
        console.log(`🚫 Request ${i}: Rate Limited`);
      } else {
        console.log(`❌ Request ${i}: Error (${res.status}) - ${data.error}`);
      }

      // Small delay to see the progression
      await new Promise((r) => setTimeout(r, 100));
    } catch (error) {
      console.log(`❌ Request ${i}: Network error`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`✅ Successful: ${successCount}/20`);
  console.log(`🚫 Rate Limited: ${rateLimitedCount}/20`);
  console.log(`Expected: ~15 successful, ~5 rate limited`);
  console.log("=".repeat(60));

  if (rateLimitedCount === 0) {
    console.log("\n⚠️  WARNING: No rate limiting occurred!");
    console.log("Possible causes:");
    console.log("1. Arcjet is in DRY_RUN mode");
    console.log("2. IP characteristics not working in localhost");
    console.log("3. Token bucket not properly configured");
  }
}

testRateLimitingSequential().catch(console.error);

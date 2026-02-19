// test-rate-limit.js
const BASE_URL = "http://localhost:3000";

async function testRateLimiting() {
  console.log("🧪 Testing Rate Limiting\n");
  console.log("=".repeat(60));

  const requests = [];

  // Try to make 20 small requests rapidly
  for (let i = 1; i <= 20; i++) {
    const promise = fetch(`${BASE_URL}/api/create-job`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: `Generate 5 items - test ${i}` }),
    }).then(async (res) => {
      const data = await res.json();
      return {
        request: i,
        status: res.status,
        success: res.ok,
        data,
      };
    });

    requests.push(promise);
  }

  const results = await Promise.all(requests);

  console.log("\n📊 Results:\n");

  let successCount = 0;
  let rateLimitedCount = 0;

  results.forEach((result) => {
    if (result.success) {
      successCount++;
      console.log(`✅ Request ${result.request}: Success`);
    } else if (result.status === 429) {
      rateLimitedCount++;
      console.log(`🚫 Request ${result.request}: Rate Limited`);
    } else {
      console.log(`❌ Request ${result.request}: Error (${result.status})`);
    }
  });

  console.log("\n" + "=".repeat(60));
  console.log(`✅ Successful: ${successCount}/20`);
  console.log(`🚫 Rate Limited: ${rateLimitedCount}/20`);
  console.log(`Expected: ~15 successful (capacity limit)`);
  console.log("=".repeat(60));
}

testRateLimiting().catch(console.error);

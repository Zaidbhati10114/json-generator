// test-ai-worker.js
const testCases = [
  {
    name: "Test 1: Large E-commerce Dataset",
    prompt:
      "Generate 50 e-commerce products with nested categories, variants (sizes and colors), customer reviews (rating and comment), stock levels, and pricing tiers",
  },
  {
    name: "Test 2: Complex Employee Records",
    prompt:
      "Create 25 employee records including personal info (name, email, phone), work history (array of previous jobs with company, role, duration), skills array, certifications with expiry dates, and emergency contacts with relationship",
  },
];

async function runTests() {
  const BASE_URL = "http://localhost:3000";
  const SECRET = process.env.LOAD_TEST_SECRET || "zaid-super-secret-load-test";

  console.log(`🌐 Testing against: ${BASE_URL}`);
  console.log(`🔑 Using secret: ${SECRET}\n`);

  for (const testCase of testCases) {
    console.log(`${"=".repeat(60)}`);
    console.log(`🧪 ${testCase.name}`);
    console.log(`${"=".repeat(60)}\n`);

    try {
      // Step 1: Create job
      console.log("📤 Creating job...");
      const createRes = await fetch(`${BASE_URL}/api/create-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: testCase.prompt }),
      });

      // Check response status
      if (!createRes.ok) {
        const text = await createRes.text();
        console.error(`❌ HTTP ${createRes.status}: ${text.substring(0, 200)}`);
        continue;
      }

      const contentType = createRes.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await createRes.text();
        console.error(`❌ Expected JSON but got: ${contentType}`);
        console.error(`Response: ${text.substring(0, 500)}`);
        continue;
      }

      const createData = await createRes.json();
      const jobId = createData.jobId || createData.id;

      if (!jobId) {
        console.error("❌ No jobId in response:", createData);
        continue;
      }

      console.log(`✅ Job created: ${jobId}`);

      // Step 2: Trigger worker
      console.log("\n🔨 Triggering worker...");
      const workerRes = await fetch(`${BASE_URL}/api/worker?secret=${SECRET}`);

      if (!workerRes.ok) {
        const text = await workerRes.text();
        console.error(
          `❌ Worker failed (HTTP ${workerRes.status}): ${text.substring(0, 200)}`,
        );
        continue;
      }

      const workerResult = await workerRes.json();
      console.log("✅ Worker response:", JSON.stringify(workerResult, null, 2));

      // Step 3: Wait and check job status
      console.log("\n⏳ Waiting 3 seconds for job processing...");
      await new Promise((resolve) => setTimeout(resolve, 3000));

      console.log("📊 Checking job status...");
      const statusRes = await fetch(`${BASE_URL}/api/job-status?id=${jobId}`);

      if (!statusRes.ok) {
        const text = await statusRes.text();
        console.error(
          `❌ Status check failed (HTTP ${statusRes.status}): ${text.substring(0, 200)}`,
        );
        continue;
      }

      const status = await statusRes.json();

      console.log("\n📋 Final Status:");
      console.log("- Job ID:", jobId);
      console.log("- Status:", status.status);
      console.log("- Model:", status.modelUsed || "N/A");

      if (status.status === "completed" && status.result) {
        const itemCount = getItemCount(status.result);
        console.log("- Items generated:", itemCount);

        const firstItem = getFirstItem(status.result);
        const preview = JSON.stringify(firstItem, null, 2);
        console.log("- First item preview:");
        console.log(
          preview.substring(0, 500) + (preview.length > 500 ? "..." : ""),
        );

        console.log("\n✅ TEST PASSED ✅\n");
      } else if (status.status === "failed") {
        console.log("- Error:", status.error);
        console.log("\n❌ TEST FAILED ❌\n");
      } else {
        console.log("- Current status:", status.status);
        console.log("\n⏳ TEST STILL PROCESSING ⏳\n");
      }
    } catch (error) {
      console.error("\n❌ TEST ERROR:", error.message);
      console.error("Stack:", error.stack);
      console.log();
    }
  }

  console.log("🏁 All tests completed!\n");
}

// Helper functions
function getItemCount(data) {
  if (Array.isArray(data)) return data.length;
  const arrayKeys = [
    "items",
    "products",
    "users",
    "profiles",
    "employees",
    "records",
    "data",
    "entries",
  ];
  for (const key of arrayKeys) {
    if (data[key] && Array.isArray(data[key])) return data[key].length;
  }
  return Object.keys(data).length;
}

function getFirstItem(data) {
  if (Array.isArray(data)) return data[0];
  const arrayKeys = [
    "items",
    "products",
    "users",
    "profiles",
    "employees",
    "records",
    "data",
    "entries",
  ];
  for (const key of arrayKeys) {
    if (data[key] && Array.isArray(data[key])) return data[key][0];
  }
  return data;
}

// Run tests
runTests().catch(console.error);

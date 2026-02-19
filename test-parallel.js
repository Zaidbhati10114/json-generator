// test-parallel.js
const BASE_URL = "http://localhost:3000";
const SECRET = "zaid-super-secret-load-test";

async function testParallelProcessing() {
  console.log("🚀 Testing Parallel Processing\n");
  console.log("=".repeat(60));

  const jobPrompts = [
    "Generate 10 products",
    "Generate 15 user profiles",
    "Generate 20 customer records",
    "Generate 8 products with reviews",
    "Generate 12 employee records",
    "Generate 10 blog posts",
    "Generate 15 books with authors",
    "Generate 10 restaurants with menus",
    "Generate 12 movies with cast",
    "Generate 10 courses with lessons",
  ];

  console.log(`📤 Creating ${jobPrompts.length} jobs...\n`);
  const startCreate = Date.now();

  // ⭐ Create jobs with delay to avoid rate limiting
  const jobIds = [];
  for (let i = 0; i < jobPrompts.length; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/create-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: jobPrompts[i] }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`❌ Job ${i + 1} creation failed: ${errorText}`);
        jobIds.push(null);
      } else {
        const data = await res.json();
        const jobId = data.jobId || data.id;

        if (!jobId) {
          console.error(`❌ Job ${i + 1} - No jobId in response:`, data);
          jobIds.push(null);
        } else {
          console.log(`✅ Job ${i + 1} created: ${jobId}`);
          jobIds.push(jobId);
        }
      }
    } catch (error) {
      console.error(`❌ Job ${i + 1} error:`, error.message);
      jobIds.push(null);
    }

    // ⭐ Add 200ms delay between requests to avoid rate limiting
    if (i < jobPrompts.length - 1) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  // Filter out null values
  const validJobIds = jobIds.filter((id) => id !== null);

  const createTime = ((Date.now() - startCreate) / 1000).toFixed(1);
  console.log(
    `\n⏱️  ${validJobIds.length}/${jobPrompts.length} jobs created successfully in ${createTime}s\n`,
  );

  if (validJobIds.length === 0) {
    console.error("❌ No jobs created successfully. Aborting test.");
    return;
  }

  // Trigger worker
  console.log("🔨 Triggering worker to process all jobs...\n");
  const startProcess = Date.now();

  const workerRes = await fetch(`${BASE_URL}/api/worker?secret=${SECRET}`);
  const workerResult = await workerRes.json();

  const processTime = ((Date.now() - startProcess) / 1000).toFixed(1);

  console.log("\n" + "=".repeat(60));
  console.log("📊 RESULTS:");
  console.log("=".repeat(60));
  console.log(`Total jobs processed: ${workerResult.processedJobs}`);
  console.log(`Successful: ${workerResult.successful}`);
  console.log(`Failed: ${workerResult.failed}`);
  console.log(`Processing time: ${processTime}s`);
  console.log(
    `Average per job: ${(parseFloat(processTime) / workerResult.processedJobs).toFixed(1)}s`,
  );

  // Calculate efficiency
  const sequentialEstimate = workerResult.processedJobs * 10;
  const speedup = (sequentialEstimate / parseFloat(processTime)).toFixed(1);

  console.log("\n💡 Performance:");
  console.log(`Sequential estimate: ${sequentialEstimate}s`);
  console.log(`Actual time: ${processTime}s`);
  console.log(`Speed improvement: ${speedup}x faster 🚀`);

  // Wait and check all job statuses
  console.log("\n⏳ Waiting 2 seconds before checking statuses...\n");
  await new Promise((r) => setTimeout(r, 2000));

  console.log("📋 Job Status Summary:");
  console.log("-".repeat(60));

  let completedCount = 0;
  let totalItems = 0;

  for (let i = 0; i < validJobIds.length; i++) {
    try {
      const statusRes = await fetch(
        `${BASE_URL}/api/job-status?id=${validJobIds[i]}`,
      );

      if (!statusRes.ok) {
        console.log(
          `❌ Job ${i + 1}: Failed to fetch status (${statusRes.status})`,
        );
        continue;
      }

      const status = await statusRes.json();

      if (status.status === "completed") {
        completedCount++;
        const itemCount = getItemCount(status.result);
        totalItems += itemCount;
        console.log(`✅ Job ${i + 1}: ${status.status} - ${itemCount} items`);
      } else {
        console.log(`⏳ Job ${i + 1}: ${status.status}`);
      }
    } catch (error) {
      console.log(`❌ Job ${i + 1}: Error checking status`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(
    `✅ ${completedCount}/${validJobIds.length} jobs completed successfully`,
  );
  console.log(`📦 Total items generated: ${totalItems}`);
  console.log("=".repeat(60));
}

function getItemCount(data) {
  if (Array.isArray(data)) return data.length;
  const arrayKeys = [
    "items",
    "products",
    "users",
    "profiles",
    "employees",
    "records",
    "posts",
    "books",
    "restaurants",
    "movies",
    "courses",
  ];
  for (const key of arrayKeys) {
    if (data[key] && Array.isArray(data[key])) return data[key].length;
  }
  return Object.keys(data).length;
}

testParallelProcessing().catch(console.error);

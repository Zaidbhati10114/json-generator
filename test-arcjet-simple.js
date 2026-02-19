// test-arcjet-simple.js
const BASE_URL = "http://localhost:3000";

async function testArcjetSimple() {
  console.log("🧪 Testing Arcjet - Simple Check\n");

  // Make 3 requests with 500ms delay
  for (let i = 1; i <= 3; i++) {
    console.log(`\n📤 Request ${i}:`);

    const res = await fetch(`${BASE_URL}/api/create-job`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add a header to help identify the request
        "x-test-request": `test-${i}`,
      },
      body: JSON.stringify({ prompt: `Generate 5 items - simple test ${i}` }),
    });

    console.log(`   Status: ${res.status}`);
    console.log(`   Headers:`, Object.fromEntries(res.headers.entries()));

    const data = await res.json();
    console.log(`   Response:`, data);

    // Wait before next request
    if (i < 3) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log("\n👀 NOW CHECK YOUR SERVER CONSOLE");
  console.log("You should see logs starting with 🔍 and 📊");
  console.log("If you don't see those logs, the Arcjet code isn't running.");
}

testArcjetSimple().catch(console.error);

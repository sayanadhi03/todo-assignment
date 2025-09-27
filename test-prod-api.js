// Test the production API endpoints
async function testAPI() {
  const baseUrl =
    "https://todo-assignment-ombdyzlvm-sayanadhikary003-gmailcoms-projects.vercel.app";

  console.log("🔍 Testing production API endpoints...\n");

  // Test 1: Health endpoint
  try {
    console.log("1. Testing /api/health...");
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthResponse.json();
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Response:`, healthData);
  } catch (error) {
    console.log(`   ❌ Health check failed:`, error.message);
  }

  console.log("\n");

  // Test 2: Login endpoint
  try {
    console.log("2. Testing /api/auth/login...");
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@acme.test",
        password: "password",
      }),
    });

    console.log(`   Status: ${loginResponse.status}`);

    if (loginResponse.status === 500) {
      const errorText = await loginResponse.text();
      console.log(`   Error response:`, errorText.substring(0, 300) + "...");
    } else {
      const loginData = await loginResponse.json();
      console.log(`   Response:`, loginData);
    }
  } catch (error) {
    console.log(`   ❌ Login test failed:`, error.message);
  }
}

testAPI();

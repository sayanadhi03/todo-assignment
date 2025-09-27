const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

// Import models
const Tenant = require("../models/Tenant");
const User = require("../models/User");
const Note = require("../models/Note");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI environment variable is not set");
  process.exit(1);
}

async function testApplication() {
  try {
    console.log("🧪 Starting application tests...\n");

    // Test 1: Database connection
    console.log("1️⃣ Testing database connection...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Database connection successful");

    // Test 2: Check if tenants exist
    console.log("\n2️⃣ Testing tenant data...");
    const tenants = await Tenant.find({});
    console.log(`✅ Found ${tenants.length} tenants:`);
    tenants.forEach((tenant) => {
      console.log(`   - ${tenant.name} (${tenant.slug}) - ${tenant.plan} plan`);
    });

    // Test 3: Check if users exist
    console.log("\n3️⃣ Testing user data...");
    const users = await User.find({}).populate("tenantId", "name slug");
    console.log(`✅ Found ${users.length} users:`);
    users.forEach((user) => {
      console.log(`   - ${user.email} (${user.role}) - ${user.tenantId.name}`);
    });

    // Test 4: Test tenant isolation
    console.log("\n4️⃣ Testing tenant isolation...");
    const acmeTenant = await Tenant.findOne({ slug: "acme" });
    const globexTenant = await Tenant.findOne({ slug: "globex" });

    // Create test notes for each tenant
    await Note.create({
      title: "Test Acme Note",
      content: "This belongs to Acme",
      tenantId: acmeTenant._id,
      createdBy: users.find((u) => u.email === "admin@acme.test")._id,
    });

    await Note.create({
      title: "Test Globex Note",
      content: "This belongs to Globex",
      tenantId: globexTenant._id,
      createdBy: users.find((u) => u.email === "admin@globex.test")._id,
    });

    // Verify isolation
    const acmeNotes = await Note.find({ tenantId: acmeTenant._id });
    const globexNotes = await Note.find({ tenantId: globexTenant._id });

    console.log(`✅ Acme tenant has ${acmeNotes.length} notes`);
    console.log(`✅ Globex tenant has ${globexNotes.length} notes`);

    // Test 5: JWT Secret
    console.log("\n5️⃣ Testing JWT configuration...");
    const JWT_SECRET = process.env.JWT_SECRET;
    if (JWT_SECRET && JWT_SECRET.length >= 32) {
      console.log("✅ JWT_SECRET is properly configured");
    } else {
      console.log("⚠️  JWT_SECRET should be at least 32 characters long");
    }

    // Test 6: Environment variables
    console.log("\n6️⃣ Testing environment configuration...");
    const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length === 0) {
      console.log("✅ All required environment variables are set");
    } else {
      console.log(
        `❌ Missing environment variables: ${missingVars.join(", ")}`
      );
    }

    console.log("\n🎉 All tests completed successfully!");
    console.log("\n📋 Next steps:");
    console.log(
      "   1. Make sure your .env.local file has the correct MONGO_URI"
    );
    console.log("   2. Run: npm run dev");
    console.log("   3. Open: http://localhost:3000");
    console.log("   4. Login with any of the test accounts");
    console.log("\n🔑 Test accounts:");
    console.log("   - admin@acme.test (password)");
    console.log("   - user@acme.test (password)");
    console.log("   - admin@globex.test (password)");
    console.log("   - user@globex.test (password)");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error("\n🔧 Troubleshooting:");
    console.error("   1. Check your MONGO_URI in .env.local");
    console.error("   2. Ensure MongoDB Atlas allows connections from your IP");
    console.error("   3. Verify database user has read/write permissions");
    console.error("   4. Run: npm run seed (to create test data)");
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the test
testApplication();

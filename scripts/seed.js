const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

// Import models
const Tenant = require("../models/Tenant");
const User = require("../models/User");
const Note = require("../models/Note");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI environment variable is not set");
  process.exit(1);
}

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Tenant.deleteMany({});
    await Note.deleteMany({});

    // Create tenants
    console.log("Creating tenants...");
    const acmeTenant = await Tenant.create({
      name: "Acme Corporation",
      slug: "acme",
      plan: "FREE",
    });

    const globexTenant = await Tenant.create({
      name: "Globex Corporation",
      slug: "globex",
      plan: "FREE",
    });

    // Hash password for all users
    const hashedPassword = await bcrypt.hash("password", 12);

    // Create users
    console.log("Creating users...");

    // Acme users
    await User.create({
      email: "admin@acme.test",
      password: hashedPassword,
      role: "Admin",
      tenantId: acmeTenant._id,
    });

    await User.create({
      email: "user@acme.test",
      password: hashedPassword,
      role: "Member",
      tenantId: acmeTenant._id,
    });

    // Globex users
    await User.create({
      email: "admin@globex.test",
      password: hashedPassword,
      role: "Admin",
      tenantId: globexTenant._id,
    });

    await User.create({
      email: "user@globex.test",
      password: hashedPassword,
      role: "Member",
      tenantId: globexTenant._id,
    });

    console.log("✅ Database seeded successfully!");
    console.log("");
    console.log("Test accounts created:");
    console.log("- admin@acme.test (Admin, Acme tenant)");
    console.log("- user@acme.test (Member, Acme tenant)");
    console.log("- admin@globex.test (Admin, Globex tenant)");
    console.log("- user@globex.test (Member, Globex tenant)");
    console.log("");
    console.log("All passwords: password");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run the seed function
seedDatabase();

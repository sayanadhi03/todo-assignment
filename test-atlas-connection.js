const mongoose = require("mongoose");

async function testConnection() {
  const connectionStrings = [
    "mongodb+srv://timepasswithsa_db_user:hrXXuuOC1l9jgyUT@cluster0.mongodb.net/notes-saas?retryWrites=true&w=majority",
    "mongodb+srv://timepasswithsa_db_user:hrXXuuOC1l9jgyUT@cluster0.mongodb.net/?retryWrites=true&w=majority",
    "mongodb+srv://timepasswithsa_db_user:hrXXuuOC1l9jgyUT@cluster0.mongodb.net/test?retryWrites=true&w=majority",
  ];

  for (let i = 0; i < connectionStrings.length; i++) {
    try {
      console.log(`🔍 Testing connection ${i + 1}...`);
      console.log(`   ${connectionStrings[i]}`);

      await mongoose.connect(connectionStrings[i], {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // 5 second timeout
      });

      console.log("✅ Connection successful!");
      console.log("📊 Database name:", mongoose.connection.name);
      console.log("📡 Connected to:", mongoose.connection.host);

      await mongoose.connection.close();
      console.log("🎉 This connection string works!");
      console.log("\n🔗 Use this connection string:");
      console.log(connectionStrings[i]);
      break;
    } catch (error) {
      console.log(`❌ Connection ${i + 1} failed:`, error.message);
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
    }
  }
}

testConnection();

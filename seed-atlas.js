const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Import models
const Tenant = require('./models/Tenant');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function seedAtlasDatabase(atlasConnectionString) {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    
    // Connect to Atlas instead of local
    await mongoose.connect(atlasConnectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB Atlas successfully!');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Tenant.deleteMany({});

    // Create tenants
    console.log('🏢 Creating tenants...');
    const acmeTenant = await Tenant.create({
      name: 'Acme Corporation',
      slug: 'acme',
      plan: 'PRO'
    });

    const globexTenant = await Tenant.create({
      name: 'Globex Corporation', 
      slug: 'globex',
      plan: 'FREE'
    });

    console.log('✅ Tenants created successfully');

    // Create users
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('password', 10);

    const users = [
      {
        email: 'admin@acme.test',
        password: hashedPassword,
        role: 'Admin',
        tenantId: acmeTenant._id
      },
      {
        email: 'user@acme.test',
        password: hashedPassword,
        role: 'Member',
        tenantId: acmeTenant._id
      },
      {
        email: 'admin@globex.test',
        password: hashedPassword,
        role: 'Admin',
        tenantId: globexTenant._id
      },
      {
        email: 'user@globex.test',
        password: hashedPassword,
        role: 'Member',
        tenantId: globexTenant._id
      }
    ];

    await User.insertMany(users);
    console.log('✅ Users created successfully');

    // Verify data
    const tenantCount = await Tenant.countDocuments();
    const userCount = await User.countDocuments();

    console.log('\n📊 Database Summary:');
    console.log(`   • Tenants: ${tenantCount}`);
    console.log(`   • Users: ${userCount}`);
    console.log('\n🎉 Atlas database seeded successfully!');
    console.log('🔐 Test accounts (password: "password"):');
    console.log('   • admin@acme.test (Admin)');
    console.log('   • user@acme.test (Member)');
    console.log('   • admin@globex.test (Admin)');
    console.log('   • user@globex.test (Member)');

    await mongoose.connection.close();
    console.log('📤 Connection closed');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Check if connection string is provided as argument
const atlasConnectionString = process.argv[2];

if (!atlasConnectionString) {
  console.log('❌ Please provide your Atlas connection string as an argument:');
  console.log('   node seed-atlas.js "mongodb+srv://username:password@cluster.mongodb.net/notes-saas?retryWrites=true&w=majority"');
  process.exit(1);
}

seedAtlasDatabase(atlasConnectionString);
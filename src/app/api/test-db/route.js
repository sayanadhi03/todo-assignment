import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../models/User";
import Tenant from "../../../../models/Tenant";

export async function GET() {
  try {
    console.log("Debug: Starting database connection test...");
    
    // Test database connection
    await connectDB();
    console.log("Debug: Database connected successfully");
    
    // Test User model
    console.log("Debug: Testing User model...");
    const userCount = await User.countDocuments();
    console.log("Debug: User count:", userCount);
    
    // Test Tenant model
    console.log("Debug: Testing Tenant model...");
    const tenantCount = await Tenant.countDocuments();
    console.log("Debug: Tenant count:", tenantCount);
    
    // Test finding a specific user
    console.log("Debug: Looking for admin@acme.test...");
    const testUser = await User.findOne({ email: 'admin@acme.test' }).populate("tenantId");
    console.log("Debug: Found user:", !!testUser);
    console.log("Debug: User has tenant:", !!testUser?.tenantId);
    
    return NextResponse.json({
      status: 'Database connection test successful',
      userCount,
      tenantCount,
      testUserFound: !!testUser,
      testUserHasTenant: !!testUser?.tenantId,
      testUserDetails: testUser ? {
        id: testUser._id,
        email: testUser.email,
        role: testUser.role,
        tenantName: testUser.tenantId?.name
      } : null
    });
    
  } catch (error) {
    console.error("Debug: Database connection error:", error);
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        message: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
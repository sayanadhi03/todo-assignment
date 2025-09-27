import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/mongodb";
import User from "../../../../../models/User";
import Tenant from "../../../../../models/Tenant";
import { comparePassword, generateToken } from "../../../../../lib/auth";

export async function POST(request) {
  try {
    console.log("Login attempt starting...");

    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected successfully");

    console.log("Parsing request body...");
    const { email, password } = await request.json();
    console.log("Request parsed, email:", email);

    if (!email || !password) {
      console.log("Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log("Looking for user with email:", email);
    // Find user with populated tenant info
    const user = await User.findOne({ email }).populate("tenantId");
    console.log("User found:", !!user);

    if (!user) {
      console.log("User not found");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT with tenant info
    const tokenPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId._id.toString(),
      iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = generateToken(tokenPayload);

    const response = {
      accessToken,
      expiresIn: 3600,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        tenant: {
          id: user.tenantId._id.toString(),
          name: user.tenantId.name,
          slug: user.tenantId.slug,
          plan: user.tenantId.plan,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Login error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Return more detailed error in development
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(
        {
          error: "Internal server error",
          details: error.message,
          stack: error.stack,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

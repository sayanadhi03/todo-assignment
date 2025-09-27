import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/mongodb";
import User from "../../../../../models/User";
import Tenant from "../../../../../models/Tenant";
import { comparePassword, generateToken } from "../../../../../lib/auth";

export async function POST(request) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user with populated tenant info
    const user = await User.findOne({ email }).populate("tenantId");

    if (!user) {
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

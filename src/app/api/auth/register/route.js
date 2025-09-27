import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/mongodb";
import User from "../../../../../models/User";
import Tenant from "../../../../../models/Tenant";
import { hashPassword, generateToken } from "../../../../../lib/auth";

export async function POST(request) {
  try {
    await connectDB();

    const {
      email,
      password,
      tenantSlug,
      role = "Member",
    } = await request.json();

    if (!email || !password || !tenantSlug) {
      return NextResponse.json(
        { error: "Email, password, and tenant are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Find the tenant
    const tenant = await Tenant.findOne({ slug: tenantSlug });
    if (!tenant) {
      return NextResponse.json(
        { error: 'Invalid tenant. Please choose either "acme" or "globex"' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user (always as Member for new registrations)
    const user = await User.create({
      email,
      password: hashedPassword,
      role: "Member", // New users are always Members
      tenantId: tenant._id,
    });

    // Generate JWT
    const tokenPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: tenant._id.toString(),
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
          id: tenant._id.toString(),
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.plan,
        },
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

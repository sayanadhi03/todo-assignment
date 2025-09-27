import { NextResponse } from "next/server";
import { connectDB } from "../../../../../../lib/mongodb";
import Tenant from "../../../../../../models/Tenant";
import { verifyAuth } from "../../../../../../middleware/auth";

// POST /api/tenants/[slug]/upgrade - Upgrade tenant to Pro plan
export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const user = verifyAuth(request);
    await connectDB();

    // Only Admin can upgrade
    if (user.role !== "Admin") {
      return NextResponse.json(
        { error: "Only administrators can upgrade the plan" },
        { status: 403 }
      );
    }

    // Find tenant by slug and ensure it belongs to the user's tenant
    const tenant = await Tenant.findOne({
      slug: slug,
      _id: user.tenantId,
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    if (tenant.plan === "PRO") {
      return NextResponse.json(
        { error: "Tenant is already on Pro plan" },
        { status: 400 }
      );
    }

    // Upgrade to Pro
    tenant.plan = "PRO";
    await tenant.save();

    return NextResponse.json({
      message: "Tenant successfully upgraded to Pro plan",
      tenant: {
        id: tenant._id.toString(),
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
      },
    });
  } catch (error) {
    console.error("Upgrade tenant error:", error);
    if (
      error.message === "No token provided" ||
      error.name === "JsonWebTokenError"
    ) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

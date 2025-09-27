import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Note from "../../../../models/Note";
import Tenant from "../../../../models/Tenant";
import { verifyAuth } from "../../../../middleware/auth";

// GET /api/notes - List all notes for the tenant
export async function GET(request) {
  try {
    const user = verifyAuth(request);
    await connectDB();

    const notes = await Note.find({ tenantId: user.tenantId })
      .sort({ createdAt: -1 })
      .populate("createdBy", "email");

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Get notes error:", error);
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

// POST /api/notes - Create a new note
export async function POST(request) {
  try {
    const user = verifyAuth(request);
    await connectDB();

    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Check plan limits
    const tenant = await Tenant.findById(user.tenantId);
    if (tenant.plan === "FREE") {
      const noteCount = await Note.countDocuments({ tenantId: user.tenantId });
      if (noteCount >= 3) {
        return NextResponse.json(
          {
            error: "Plan limit reached",
            canUpgrade: true,
            message:
              "Free plan allows maximum 3 notes. Upgrade to Pro for unlimited notes.",
          },
          { status: 403 }
        );
      }
    }

    const note = new Note({
      title,
      content,
      tenantId: user.tenantId,
      createdBy: user.id,
    });

    await note.save();
    await note.populate("createdBy", "email");

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("Create note error:", error);
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

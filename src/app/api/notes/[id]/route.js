import { NextResponse } from "next/server";
import { connectDB } from "../../../../../lib/mongodb";
import Note from "../../../../../models/Note";
import { verifyAuth } from "../../../../../middleware/auth";

// GET /api/notes/[id] - Get a specific note
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = verifyAuth(request);
    await connectDB();

    const note = await Note.findOne({
      _id: id,
      tenantId: user.tenantId,
    }).populate("createdBy", "email");

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Get note error:", error);
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

// PUT /api/notes/[id] - Update a specific note
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const user = verifyAuth(request);
    await connectDB();

    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, tenantId: user.tenantId },
      { title, content, updatedAt: new Date() },
      { new: true }
    ).populate("createdBy", "email");

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Update note error:", error);
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

// DELETE /api/notes/[id] - Delete a specific note
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const user = verifyAuth(request);
    await connectDB();

    const note = await Note.findOneAndDelete({
      _id: id,
      tenantId: user.tenantId,
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete note error:", error);
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

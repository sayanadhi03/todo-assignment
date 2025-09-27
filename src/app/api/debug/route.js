import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Debug endpoint called");

    // Check environment variables
    const hasMongoUri = !!process.env.MONGO_URI;
    const hasJwtSecret = !!process.env.JWT_SECRET;
    const nodeEnv = process.env.NODE_ENV;

    console.log("Environment check:", {
      hasMongoUri,
      hasJwtSecret,
      nodeEnv,
      mongoUriPrefix: process.env.MONGO_URI?.substring(0, 20) + "...",
    });

    return NextResponse.json({
      status: "API routes working",
      timestamp: new Date().toISOString(),
      environment: {
        hasMongoUri,
        hasJwtSecret,
        nodeEnv,
        mongoUriPrefix: process.env.MONGO_URI?.substring(0, 20) + "...",
      },
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      {
        error: "Debug endpoint failed",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

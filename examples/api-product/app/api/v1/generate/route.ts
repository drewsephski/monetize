import { NextRequest, NextResponse } from "next/server";

/**
 * Generate endpoint - uses 1 API credit per call
 * Protected by API key middleware
 */

export async function POST(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  const plan = request.headers.get("x-plan");

  try {
    const body = await request.json();
    const { prompt, type = "text" } = body;

    // Simulate generation work
    const result = {
      id: `gen_${Date.now()}`,
      content: `Generated ${type} for: "${prompt || "sample"}"`,
      type,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: result,
      usage: {
        plan,
        creditsUsed: 1,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}

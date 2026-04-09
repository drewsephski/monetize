import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    success: true,
    data: {
      id: `gen_${Date.now()}`,
      prompt: body.prompt || "Hello world",
      output: `Generated payload for "${body.prompt || "Hello world"}".`,
    },
    usage: {
      creditsUsed: 1,
      plan: request.headers.get("x-plan") || "free",
    },
  });
}

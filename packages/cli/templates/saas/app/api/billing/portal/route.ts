import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin") || "http://localhost:3000";

  return NextResponse.redirect(`${origin}/dashboard?portal=1`);
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") || "http://localhost:3000";

  return NextResponse.json({
    url: `${origin}/dashboard?portal=1`,
    sandbox: true,
  });
}

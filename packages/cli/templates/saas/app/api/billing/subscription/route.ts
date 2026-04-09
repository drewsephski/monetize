import { NextRequest, NextResponse } from "next/server";

const plans = {
  starter: {
    plan: "starter",
    status: "starter",
    periodLabel: "Starter plan with no active renewal.",
    seats: { used: 1, total: 1 },
    events: { used: 120, total: 500 },
    automations: { used: 1, total: 2 },
  },
  growth: {
    plan: "growth",
    status: "active",
    periodLabel: "Renews in 30 days.",
    seats: { used: 3, total: 5 },
    events: { used: 4200, total: 10000 },
    automations: { used: 4, total: 10 },
  },
  scale: {
    plan: "scale",
    status: "trialing",
    periodLabel: "Trial ends in 11 days.",
    seats: { used: 8, total: 999 },
    events: { used: 18250, total: 50000 },
    automations: { used: 18, total: 40 },
  },
} as const;

export async function GET(request: NextRequest) {
  const plan = request.nextUrl.searchParams.get("plan") || "starter";

  return NextResponse.json(plans[plan as keyof typeof plans] || plans.starter);
}

import { NextResponse } from "next/server";

// This route returns the current user's subscription
// In production, integrate with @drew/billing-sdk

const mockSubscription = {
  plan: "pro",
  status: "active",
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  features: [
    "10 team members",
    "10,000 API calls/month",
    "Advanced analytics",
    "Priority support",
    "Custom integrations",
    "API access",
  ],
  usage: {
    apiCalls: { used: 2340, limit: 10000 },
    storage: { used: 450, limit: 5000 },
    team: { used: 3, limit: 10 },
  },
};

export async function GET() {
  // In production:
  // const session = await auth();
  // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // const subscription = await billing.getSubscription(session.user.id);

  // Return mock data for the starter
  return NextResponse.json(mockSubscription);
}

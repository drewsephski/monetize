import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customers, subscriptions } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const customer = await db.query.customers.findFirst({
      where: eq(customers.userId, userId),
    });

    if (!customer) {
      return NextResponse.json(
        {
          hasSubscription: false,
          subscription: null,
        },
        { status: 200 }
      );
    }

    const userSubscriptions = await db.query.subscriptions.findMany({
      where: eq(subscriptions.customerId, customer.id),
    });

    const activeSubscription = userSubscriptions.find(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );

    return NextResponse.json({
      hasSubscription: !!activeSubscription,
      subscription: activeSubscription || null,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Subscription fetch error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

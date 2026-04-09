import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { customers, subscriptions, plans } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = session;

    // Get customer and subscription data
    const customer = await db.query.customers.findFirst({
      where: eq(customers.userId, user.id),
    });

    const userSubscriptions = customer
      ? await db.query.subscriptions.findMany({
          where: eq(subscriptions.customerId, customer.id),
          orderBy: (subscriptions, { desc }) => [desc(subscriptions.createdAt)],
        })
      : [];

    const activeSubscription = userSubscriptions.find(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );

    // Get plan details if subscription exists
    let planName = null;
    let stripePriceId = null;
    if (activeSubscription?.planId) {
      const plan = await db.query.plans.findFirst({
        where: eq(plans.id, activeSubscription.planId),
      });
      planName = plan?.name || null;
      stripePriceId = plan?.stripePriceId || null;
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      customer: customer
        ? {
            id: customer.id,
            stripeCustomerId: customer.stripeCustomerId,
          }
        : null,
      subscription: activeSubscription
        ? {
            id: activeSubscription.id,
            status: activeSubscription.status,
            planId: activeSubscription.planId,
            stripePriceId,
            planName,
            currentPeriodEnd: activeSubscription.currentPeriodEnd,
          }
        : null,
      hasSubscription: !!activeSubscription,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

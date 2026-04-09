import { db } from "@/lib/db";
import { subscriptions, customers, plans } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

async function sync() {
  try {
    // Find the customer
    const customer = await db.query.customers.findFirst({
      where: eq(customers.stripeCustomerId, "cus_UIek0MmsRvNNfu"),
    });

    if (!customer) {
      console.log("Customer not found");
      process.exit(1);
    }

    // Fetch subscription from Stripe
    const stripeSubs = await stripe.subscriptions.list({
      customer: "cus_UIek0MmsRvNNfu",
      status: "active",
      expand: ["data.items"],
    });

    if (stripeSubs.data.length === 0) {
      console.log("No active subscription found in Stripe");
      process.exit(1);
    }

    // Retrieve full subscription to get current_period_end
    const stripeSub = await stripe.subscriptions.retrieve(stripeSubs.data[0].id);
    console.log("Found Stripe subscription:", stripeSub.id);
    const periodEnd = (stripeSub as unknown as { current_period_end: number }).current_period_end;
    console.log("current_period_end:", periodEnd);

    // Get plan
    const priceId = stripeSub.items.data[0]?.price.id;
    const plan = await db.query.plans.findFirst({
      where: eq(plans.stripePriceId, priceId || ""),
    });

    // Check if subscription already exists
    const existing = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.stripeSubscriptionId, stripeSub.id),
    });

    if (existing) {
      console.log("Subscription already exists:", existing.id);
      process.exit(0);
    }

    // Create subscription
    const newSub = await db.insert(subscriptions).values({
      customerId: customer.id,
      stripeSubscriptionId: stripeSub.id,
      stripeStatus: "active",
      status: "active",
      planId: plan?.id || null,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    }).returning();

    console.log("Created subscription:", newSub[0].id);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

sync();

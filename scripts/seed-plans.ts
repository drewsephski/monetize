import { db } from "@/lib/db";
import { plans } from "@/drizzle/schema";

async function seedPlans() {
  const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;

  if (!proPriceId) {
    console.error("NEXT_PUBLIC_STRIPE_PRICE_PRO not set");
    process.exit(1);
  }

  try {
    // Check if plan already exists
    const existingPlan = await db.query.plans.findFirst({
      where: (plans, { eq }) => eq(plans.stripePriceId, proPriceId),
    });

    if (existingPlan) {
      console.log("Pro plan already exists:", existingPlan.id);
      process.exit(0);
    }

    // Create Pro plan
    const plan = await db.insert(plans).values({
      name: "Pro",
      stripePriceId: proPriceId,
      metadata: {
        description: "For growing teams",
        price: 29,
        interval: "month",
        features: [
          "Unlimited API calls",
          "Unlimited projects",
          "Advanced analytics",
          "Priority support",
          "Team collaboration",
          "Custom integrations",
        ],
      },
    }).returning();

    console.log("Created Pro plan:", plan[0].id);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed plans:", error);
    process.exit(1);
  }
}

seedPlans();

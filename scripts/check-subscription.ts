import { db } from "@/lib/db";

async function check() {
  try {
    // Get all subscriptions
    const subs = await db.query.subscriptions.findMany({
      orderBy: (subscriptions, { desc }) => [desc(subscriptions.createdAt)],
    });
    console.log("Subscriptions in database:");
    console.log(JSON.stringify(subs, null, 2));

    // Get all customers
    const custs = await db.query.customers.findMany();
    console.log("\nCustomers in database:");
    console.log(JSON.stringify(custs, null, 2));

    // Get plans
    const plansList = await db.query.plans.findMany();
    console.log("\nPlans in database:");
    console.log(JSON.stringify(plansList, null, 2));

  } catch (error) {
    console.error("Error:", error);
  }
  process.exit(0);
}

check();

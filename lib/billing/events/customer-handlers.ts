import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { customers, subscriptions } from "@/drizzle/schema";
import type { EventHandlerContext } from "./types";

export async function handleCustomerDeleted({
  event,
  tx,
  logger,
}: EventHandlerContext) {
  const customer = event.data.object as Stripe.Customer;

  logger.info(
    { stripeCustomerId: customer.id },
    "Processing customer deleted"
  );

  // Find the customer in our database
  const existingCustomer = await tx.query.customers.findFirst({
    where: eq(customers.stripeCustomerId, customer.id),
  });

  if (!existingCustomer) {
    logger.warn(
      { stripeCustomerId: customer.id },
      "Customer not found for deletion"
    );
    return;
  }

  // Mark all subscriptions as canceled
  const customerSubscriptions = await tx.query.subscriptions.findMany({
    where: eq(subscriptions.customerId, existingCustomer.id),
  });

  for (const subscription of customerSubscriptions) {
    if (subscription.status !== "canceled") {
      await tx
        .update(subscriptions)
        .set({
          stripeStatus: "canceled",
          status: "canceled",
          canceledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscription.id));

      logger.info(
        { subscriptionId: subscription.id },
        "Marked subscription as canceled due to customer deletion"
      );
    }
  }

  // Note: We keep the customer record for historical purposes
  // but we could also delete it if needed
  logger.info(
    { customerId: existingCustomer.id },
    "Processed customer deletion"
  );
}

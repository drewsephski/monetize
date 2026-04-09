import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { customers } from "@/drizzle/schema";
import type { EventHandlerContext } from "./types";

export async function handleCheckoutSessionCompleted({
  event,
  stripe,
  tx,
  logger,
}: EventHandlerContext) {
  const session = event.data.object as Stripe.Checkout.Session;

  logger.info(
    { sessionId: session.id, mode: session.mode },
    "Processing checkout session completed"
  );

  const customerId = session.customer as string | null;
  const userId = session.client_reference_id;

  if (!userId) {
    logger.error(
      { sessionId: session.id },
      "No client_reference_id in checkout session"
    );
    throw new Error("Missing client_reference_id in checkout session");
  }

  if (!customerId) {
    logger.error(
      { sessionId: session.id },
      "No customer in checkout session"
    );
    throw new Error("Missing customer in checkout session");
  }

  // Check if customer link already exists
  const existingCustomer = await tx.query.customers.findFirst({
    where: eq(customers.stripeCustomerId, customerId),
  });

  if (existingCustomer) {
    logger.info(
      { customerId: existingCustomer.id, userId },
      "Customer link already exists"
    );
    return;
  }

  // Verify the customer exists in Stripe
  try {
    const stripeCustomer = await stripe.customers.retrieve(customerId);
    if (stripeCustomer.deleted) {
      logger.error({ customerId }, "Customer was deleted in Stripe");
      throw new Error("Customer was deleted in Stripe");
    }
  } catch (error) {
    logger.error({ customerId, error }, "Failed to verify customer in Stripe");
    throw error;
  }

  // Create customer link with idempotency check (userId + stripeCustomerId is unique)
  const [customer] = await tx
    .insert(customers)
    .values({
      userId,
      stripeCustomerId: customerId,
    })
    .onConflictDoNothing({ target: customers.stripeCustomerId })
    .returning();

  if (customer) {
    logger.info(
      { customerId: customer.id, userId, stripeCustomerId: customerId },
      "Created customer link"
    );
  } else {
    logger.info(
      { stripeCustomerId: customerId },
      "Customer link already existed (concurrent creation)"
    );
  }
}

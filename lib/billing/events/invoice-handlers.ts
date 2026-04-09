import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { customers, subscriptions, invoices } from "@/drizzle/schema";
import { billingHooks } from "../hooks";
import type { EventHandlerContext } from "./types";

export async function handleInvoiceCreated({
  event,
  tx,
  logger,
}: EventHandlerContext) {
  const invoice = event.data.object as Stripe.Invoice;

  logger.info(
    { invoiceId: invoice.id, number: invoice.number },
    "Processing invoice created"
  );

  // Find customer
  const customer = await tx.query.customers.findFirst({
    where: eq(customers.stripeCustomerId, invoice.customer as string),
  });

  if (!customer) {
    logger.error(
      { stripeCustomerId: invoice.customer },
      "Customer not found for invoice"
    );
    throw new Error(`Customer not found: ${invoice.customer}`);
  }

  // Type assertion for Stripe SDK types
  const invoiceData = invoice as unknown as {
    subscription?: string;
  };

  // Find subscription if applicable
  let subscriptionId: string | null = null;
  if (invoiceData.subscription) {
    const subscription = await tx.query.subscriptions.findFirst({
      where: eq(subscriptions.stripeSubscriptionId, invoiceData.subscription),
    });
    subscriptionId = subscription?.id || null;
  }

  // Check if invoice already exists
  const existing = await tx.query.invoices.findFirst({
    where: eq(invoices.stripeInvoiceId, invoice.id),
  });

  if (existing) {
    logger.info({ invoiceId: existing.id }, "Invoice already exists");
    return;
  }

  // Create invoice record
  const [newInvoice] = await tx
    .insert(invoices)
    .values({
      stripeInvoiceId: invoice.id,
      customerId: customer.id,
      subscriptionId,
      status: invoice.status || "draft",
      amount: invoice.total,
      currency: invoice.currency,
      hostedInvoiceUrl: invoice.hosted_invoice_url || null,
      pdfUrl: invoice.invoice_pdf || null,
      invoiceNumber: invoice.number || null,
      description: invoice.description || null,
    })
    .returning();

  logger.info({ invoiceId: newInvoice.id }, "Created invoice record");
}

export async function handleInvoiceFinalized({
  event,
  tx,
  logger,
}: EventHandlerContext) {
  const invoice = event.data.object as Stripe.Invoice;

  logger.info(
    { invoiceId: invoice.id, number: invoice.number },
    "Processing invoice finalized"
  );

  const existing = await tx.query.invoices.findFirst({
    where: eq(invoices.stripeInvoiceId, invoice.id),
  });

  if (!existing) {
    // Invoice might not exist if we missed the created event
    logger.warn(
      { invoiceId: invoice.id },
      "Invoice not found for finalized, creating"
    );
    return handleInvoiceCreated({ event, stripe: {} as Stripe, tx, logger });
  }

  await tx
    .update(invoices)
    .set({
      status: "open",
      hostedInvoiceUrl: invoice.hosted_invoice_url || existing.hostedInvoiceUrl,
      pdfUrl: invoice.invoice_pdf || existing.pdfUrl,
      invoiceNumber: invoice.number || existing.invoiceNumber,
    })
    .where(eq(invoices.id, existing.id));

  logger.info({ invoiceId: existing.id }, "Updated invoice to finalized");
}

export async function handleInvoicePaymentSucceeded({
  event,
  tx,
  logger,
}: EventHandlerContext) {
  const invoice = event.data.object as Stripe.Invoice;

  logger.info(
    { invoiceId: invoice.id, amount: invoice.amount_paid },
    "Processing invoice payment succeeded"
  );

  const existing = await tx.query.invoices.findFirst({
    where: eq(invoices.stripeInvoiceId, invoice.id),
  });

  if (!existing) {
    logger.warn(
      { invoiceId: invoice.id },
      "Invoice not found for payment succeeded, creating"
    );
    await handleInvoiceCreated({ event, stripe: {} as Stripe, tx, logger });
  }

  // Update invoice status
  const paidAt = invoice.status_transitions?.paid_at
    ? new Date(invoice.status_transitions.paid_at * 1000)
    : new Date();

  await tx
    .update(invoices)
    .set({
      status: "paid",
      paidAt,
    })
    .where(eq(invoices.stripeInvoiceId, invoice.id));

  // Type assertion for subscription property
  const invoiceData = invoice as unknown as {
    subscription?: string;
  };

  // Update subscription status if applicable
  if (invoiceData.subscription) {
    const subscription = await tx.query.subscriptions.findFirst({
      where: eq(subscriptions.stripeSubscriptionId, invoiceData.subscription),
    });

    if (subscription && subscription.status === "past_due") {
      await tx
        .update(subscriptions)
        .set({
          stripeStatus: "active",
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscription.id));

      logger.info(
        { subscriptionId: subscription.id },
        "Reactivated subscription after payment"
      );
    }
  }

  logger.info({ invoiceId: invoice.id }, "Marked invoice as paid");
}

export async function handleInvoicePaymentFailed({
  event,
  tx,
  logger,
}: EventHandlerContext) {
  const invoice = event.data.object as Stripe.Invoice;

  logger.warn(
    { invoiceId: invoice.id, attemptCount: invoice.attempt_count },
    "Processing invoice payment failed"
  );

  const existing = await tx.query.invoices.findFirst({
    where: eq(invoices.stripeInvoiceId, invoice.id),
  });

  if (!existing) {
    logger.warn(
      { invoiceId: invoice.id },
      "Invoice not found for payment failed, creating"
    );
    await handleInvoiceCreated({ event, stripe: {} as Stripe, tx, logger });
  }

  // Update invoice status
  await tx
    .update(invoices)
    .set({
      status: "open", // Still open, will retry
    })
    .where(eq(invoices.stripeInvoiceId, invoice.id));

  // Type assertion for subscription property
  const invoiceData = invoice as unknown as {
    subscription?: string;
    next_payment_attempt?: number;
  };

  // Find customer for hooks
  const customer = await tx.query.customers.findFirst({
    where: eq(customers.stripeCustomerId, invoice.customer as string),
  });

  // Mark subscription as past_due and track dunning
  if (invoiceData.subscription) {
    const subscription = await tx.query.subscriptions.findFirst({
      where: eq(subscriptions.stripeSubscriptionId, invoiceData.subscription),
    });

    if (subscription) {
      const oldStatus = subscription.status;

      // Update subscription with dunning tracking
      await tx
        .update(subscriptions)
        .set({
          stripeStatus: "past_due",
          status: "past_due",
          failedPaymentCount: (subscription.failedPaymentCount || 0) + 1,
          pastDueSince: subscription.pastDueSince || new Date(),
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, subscription.id));

      logger.warn(
        {
          subscriptionId: subscription.id,
          invoiceId: invoice.id,
          failedCount: (subscription.failedPaymentCount || 0) + 1,
        },
        "Marked subscription as past_due due to payment failure"
      );

      // Trigger payment failed hook
      if (customer) {
        await billingHooks.executePaymentFailed({
          userId: customer.userId,
          customerId: customer.id,
          subscriptionId: subscription.id,
          invoiceId: existing?.id || invoice.id,
          amount: invoice.amount_due,
          currency: invoice.currency,
          attemptCount: invoice.attempt_count,
          nextPaymentAttempt: invoiceData.next_payment_attempt
            ? new Date(invoiceData.next_payment_attempt * 1000)
            : null,
        });
      }

      // Trigger status change hook if status changed
      if (oldStatus !== "past_due" && customer) {
        await billingHooks.executeSubscriptionStatusChange({
          userId: customer.userId,
          customerId: customer.id,
          subscriptionId: subscription.id,
          oldStatus,
          newStatus: "past_due",
          reason: "payment_failed",
        });
      }
    }
  }

  logger.info({ invoiceId: invoice.id }, "Processed payment failure");
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { plans } from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { stripe } from "@/lib/billing/stripe";
import Stripe from "stripe";

interface SyncOptions {
  dryRun?: boolean;
  includeArchived?: boolean;
}

/**
 * POST /api/internal/sync-plans
 *
 * Pulls products and prices from Stripe and syncs to local DB.
 * Ensures Stripe remains source of truth.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const body: SyncOptions = await request.json().catch(() => ({}));
    const { dryRun = true, includeArchived = false } = body;

    logger.info({
      msg: "Starting plan sync from Stripe",
      requestId,
      dryRun,
      includeArchived,
    });

    const results = {
      created: 0,
      updated: 0,
      archived: 0,
      errors: 0,
      unchanged: 0,
      details: [] as Array<{
        action: string;
        stripePriceId: string;
        name: string;
        error?: string;
      }>,
    };

    // Fetch all active prices from Stripe with expanded products
    const prices = await stripe.prices.list({
      limit: 100,
      expand: ["data.product"],
      active: includeArchived ? undefined : true,
    });

    // Get existing plans from DB for comparison
    const existingPlans = await db
      .select({
        id: plans.id,
        stripePriceId: plans.stripePriceId,
        name: plans.name,
        features: plans.features,
        limits: plans.limits,
        trialDays: plans.trialDays,
      })
      .from(plans);

    const existingPlanMap = new Map(existingPlans.map((p) => [p.stripePriceId, p]));

    for (const price of prices.data) {
      try {
        const product = price.product as Stripe.Product;
        const stripePriceId = price.id;
        const name = product.name;

        // Extract features and limits from product metadata
        const features = product.metadata?.features
          ? JSON.parse(product.metadata.features)
          : [];
        const limits = product.metadata?.limits
          ? JSON.parse(product.metadata.limits)
          : {};
        const trialDays = parseInt(product.metadata?.trial_days || "0", 10);

        const existing = existingPlanMap.get(stripePriceId);

        if (!existing) {
          // Create new plan
          if (!dryRun) {
            await db.insert(plans).values({
              name,
              stripePriceId,
              features,
              limits,
              trialDays,
              metadata: {
                stripeProductId: product.id,
                stripePriceId: price.id,
                priceAmount: price.unit_amount,
                priceCurrency: price.currency,
                priceType: price.type,
                priceRecurring: price.recurring,
              },
            });
          }

          results.created++;
          results.details.push({
            action: dryRun ? "would_create" : "created",
            stripePriceId,
            name,
          });
        } else {
          // Check if update needed
          const needsUpdate =
            existing.name !== name ||
            JSON.stringify(existing.features) !== JSON.stringify(features) ||
            JSON.stringify(existing.limits) !== JSON.stringify(limits) ||
            existing.trialDays !== trialDays;

          if (needsUpdate) {
            if (!dryRun) {
              await db
                .update(plans)
                .set({
                  name,
                  features,
                  limits,
                  trialDays,
                  metadata: sql`jsonb_set(
                    jsonb_set(
                      jsonb_set(
                        jsonb_set(coalesce(metadata, '{}'::jsonb), '{stripeProductId}', to_jsonb(${product.id})),
                        '{stripePriceId}', to_jsonb(${price.id})
                      ),
                      '{priceAmount}', to_jsonb(${price.unit_amount})
                    ),
                    '{priceType}', to_jsonb(${price.type})
                  )`,
                })
                .where(eq(plans.id, existing.id));
            }

            results.updated++;
            results.details.push({
              action: dryRun ? "would_update" : "updated",
              stripePriceId,
              name,
            });
          } else {
            results.unchanged++;
          }
        }
      } catch (error) {
        results.errors++;
        results.details.push({
          action: "error",
          stripePriceId: price.id,
          name: (price.product as Stripe.Product)?.name || "Unknown",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Check for plans in DB that no longer exist in Stripe (archived)
    const stripePriceIds = new Set(prices.data.map((p) => p.id));
    for (const existing of existingPlans) {
      if (!stripePriceIds.has(existing.stripePriceId)) {
        if (!dryRun) {
          // Soft delete - mark as archived
          await db
            .update(plans)
            .set({
              metadata: sql`jsonb_set(coalesce(metadata, '{}'::jsonb), '{archived}', 'true')`,
            })
            .where(eq(plans.id, existing.id));
        }

        results.archived++;
        results.details.push({
          action: dryRun ? "would_archive" : "archived",
          stripePriceId: existing.stripePriceId,
          name: existing.name,
        });
      }
    }

    logger.info({
      msg: "Plan sync complete",
      requestId,
      dryRun,
      results: {
        created: results.created,
        updated: results.updated,
        archived: results.archived,
        unchanged: results.unchanged,
        errors: results.errors,
      },
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json({
      success: results.errors === 0,
      dryRun,
      summary: {
        created: results.created,
        updated: results.updated,
        archived: results.archived,
        unchanged: results.unchanged,
        errors: results.errors,
        totalProcessed: prices.data.length,
      },
      details: results.details.slice(0, 50), // Limit details in response
      meta: {
        requestId,
        durationMs: Date.now() - startTime,
      },
    });
  } catch (error) {
    logger.error({
      msg: "Plan sync failed",
      requestId,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      {
        error: "Plan sync failed",
        requestId,
        meta: {
          durationMs: Date.now() - startTime,
        },
      },
      { status: 500 }
    );
  }
}

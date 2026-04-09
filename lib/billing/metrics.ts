import { db } from "@/lib/db";
import { billingMetrics } from "@/drizzle/schema";

interface MetricInput {
  name: string;
  value: number;
  dimensions?: Record<string, string>;
}

/**
 * Track a billing metric to the metrics table.
 * Uses 5-minute bucketing for aggregation.
 */
export async function trackMetric(input: MetricInput): Promise<void> {
  try {
    // Round to 5-minute bucket
    const now = new Date();
    const bucketMinutes = Math.floor(now.getMinutes() / 5) * 5;
    const bucketTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      bucketMinutes
    );

    await db.insert(billingMetrics).values({
      metricName: input.name,
      metricValue: input.value,
      dimensions: input.dimensions || {},
      bucketTime,
    });
  } catch (error) {
    // Silently fail - metrics should never break the main flow
    console.error("Failed to track metric:", error);
  }
}

/**
 * Track webhook processing time
 */
export async function trackWebhookDuration(
  eventType: string,
  durationMs: number,
  success: boolean
): Promise<void> {
  await trackMetric({
    name: "webhook_processing_time",
    value: durationMs,
    dimensions: {
      event_type: eventType,
      success: success ? "true" : "false",
    },
  });
}

/**
 * Track failed event
 */
export async function trackFailedEvent(
  eventType: string,
  error: string
): Promise<void> {
  await trackMetric({
    name: "failed_events_count",
    value: 1,
    dimensions: {
      event_type: eventType,
      error: error.substring(0, 100), // Truncate long errors
    },
  });
}

/**
 * Track subscription state change
 */
export async function trackSubscriptionStateChange(
  fromStatus: string,
  toStatus: string
): Promise<void> {
  await trackMetric({
    name: "subscription_state_changes",
    value: 1,
    dimensions: {
      from_status: fromStatus,
      to_status: toStatus,
    },
  });
}

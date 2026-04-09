import { BillingClient } from "./client";
import { BillingError, BillingErrorCode } from "./types";

export interface TrackUsageOptions {
  userId: string;
  feature: string;
  quantity: number;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface TrackUsageResult {
  success: boolean;
  usageEventId: string;
  stripeSynced: boolean;
  stripeRecordId?: string;
}

export function trackUsage(client: BillingClient) {
  return async (options: TrackUsageOptions): Promise<TrackUsageResult> => {
    // Validate inputs
    if (!options.userId) {
      throw new BillingError(
        "userId is required",
        BillingErrorCode.BAD_REQUEST,
        400
      );
    }

    if (!options.feature) {
      throw new BillingError(
        "feature is required",
        BillingErrorCode.BAD_REQUEST,
        400
      );
    }

    if (typeof options.quantity !== "number" || options.quantity <= 0) {
      throw new BillingError(
        "quantity must be a positive number",
        BillingErrorCode.BAD_REQUEST,
        400
      );
    }

    return client.request<TrackUsageResult>("POST", "/api/usage/track", {
      userId: options.userId,
      feature: options.feature,
      quantity: options.quantity,
      timestamp: options.timestamp,
      metadata: options.metadata,
    });
  };
}

export interface GetUsageOptions {
  userId: string;
  feature?: string;
  periodStart?: string;
  periodEnd?: string;
}

export interface UsageDataPoint {
  timestamp: string;
  quantity: number;
  feature: string;
}

export interface GetUsageResult {
  userId: string;
  totalUsage: number;
  period: {
    start: string;
    end: string;
  };
  byFeature: Record<string, number>;
  dataPoints: UsageDataPoint[];
}

export function getUsage(client: BillingClient) {
  return async (options: GetUsageOptions): Promise<GetUsageResult> => {
    if (!options.userId) {
      throw new BillingError(
        "userId is required",
        BillingErrorCode.BAD_REQUEST,
        400
      );
    }

    const params = new URLSearchParams();
    params.append("userId", options.userId);
    if (options.feature) params.append("feature", options.feature);
    if (options.periodStart) params.append("periodStart", options.periodStart);
    if (options.periodEnd) params.append("periodEnd", options.periodEnd);

    return client.request<GetUsageResult>(
      "GET",
      `/api/usage?${params.toString()}`
    );
  };
}

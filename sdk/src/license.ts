import { BillingClient } from "./client";
import { BillingError } from "./types";

export interface LicenseOptions {
  licenseKey: string;
  machineId?: string; // Optional: unique machine identifier
}

export interface LicenseValidationResult {
  valid: boolean;
  license?: {
    id: string;
    tier: "free" | "pro" | "team" | "enterprise";
    status: string;
    features: string[];
    usageLimits: Record<string, number>;
    currentUsage: Record<string, number>;
    expiresAt?: string;
  };
  error?: string;
}

export interface LicenseManager {
  validate: () => Promise<LicenseValidationResult>;
  hasFeature: (feature: string) => Promise<boolean>;
  checkUsage: (metric: string, increment?: number) => Promise<{ allowed: boolean; remaining: number }>;
  trackEvent: (eventType: string, metadata?: Record<string, unknown>) => Promise<void>;
}

// Simple hash function to generate machine ID from browser/user-agent
async function generateMachineId(): Promise<string> {
  if (typeof window === "undefined") {
    // Node.js environment - use process info
    const data = `${process.platform}-${process.arch}-${Date.now()}-${Math.random()}`;
    // Use SubtleCrypto if available in Node 16+, otherwise simple hash
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const encoder = new TextEncoder();
      const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
      const array = Array.from(new Uint8Array(buffer));
      return array.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
    }
    // Fallback simple hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, "0");
  }

  // Browser environment - use available browser data
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ].join("-");

  // Use SubtleCrypto for better hashing
  if (crypto && crypto.subtle) {
    const encoder = new TextEncoder();
    const buffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
    const array = Array.from(new Uint8Array(buffer));
    return array.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
  }

  // Fallback simple hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, "0");
}

export async function createLicenseManager(
  client: BillingClient,
  options: LicenseOptions
): Promise<LicenseManager> {
  const machineId = options.machineId || await generateMachineId();
  let cachedResult: LicenseValidationResult | null = null;
  let cachedAt: number = 0;
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async function validate(): Promise<LicenseValidationResult> {
    // Return cached result if still valid
    if (cachedResult && Date.now() - cachedAt < CACHE_TTL) {
      return cachedResult;
    }

    try {
      const result = await client.request<LicenseValidationResult>("POST", "/license/verify", {
        licenseKey: options.licenseKey,
        machineId,
        eventType: "verify",
      });

      cachedResult = result;
      cachedAt = Date.now();

      return result;
    } catch (error) {
      if (error instanceof BillingError) {
        return {
          valid: false,
          error: error.message,
        };
      }

      return {
        valid: false,
        error: "License validation failed",
      };
    }
  }

  async function hasFeature(feature: string): Promise<boolean> {
    const result = await validate();
    if (!result.valid || !result.license) {
      return false;
    }

    return result.license.features.includes(feature);
  }

  async function checkUsage(
    metric: string,
    increment: number = 0
  ): Promise<{ allowed: boolean; remaining: number }> {
    const result = await validate();
    if (!result.valid || !result.license) {
      return { allowed: false, remaining: 0 };
    }

    const limit = result.license.usageLimits[metric];
    const current = result.license.currentUsage[metric] || 0;

    // -1 means unlimited
    if (limit === -1) {
      return { allowed: true, remaining: Infinity };
    }

    const remaining = limit - current - increment;
    return {
      allowed: remaining >= 0,
      remaining: Math.max(0, remaining),
    };
  }

  async function trackEvent(
    eventType: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      await client.request("POST", "/license/verify", {
        licenseKey: options.licenseKey,
        machineId,
        eventType,
        metadata,
      });
    } catch {
      // Silently fail - tracking is non-critical
    }
  }

  return {
    validate,
    hasFeature,
    checkUsage,
    trackEvent,
  };
}

import { BillingClientOptions, BillingError, BillingErrorCode } from "./types";

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateBackoff(attempt: number, config: RetryConfig): number {
  const exponentialDelay = config.baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 1000;
  return Math.min(exponentialDelay + jitter, config.maxDelay);
}

export class BillingClient {
  private baseUrl: string;
  private timeout: number;
  private retryConfig: RetryConfig;

  constructor(options: BillingClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.timeout = options.timeout || 30000; // Default 30s timeout
    this.retryConfig = options.retryConfig || DEFAULT_RETRY_CONFIG;
  }

  async request<T>(
    method: "GET" | "POST",
    endpoint: string,
    body?: unknown,
    options?: { skipRetry?: boolean }
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const maxRetries = options?.skipRetry ? 0 : this.retryConfig.maxRetries;

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const fetchOptions: RequestInit = {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        };

        if (body) {
          fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          
          // Build actionable error message
          const errorMessage = this.buildErrorMessage(
            errorData.error || `HTTP ${response.status}`,
            response.status,
            endpoint
          );
          
          // Create typed error
          const billingError = new BillingError(
            errorMessage,
            this.mapStatusToErrorCode(response.status),
            response.status,
            errorData.requestId
          );

          // Report error to telemetry if enabled
          try {
            const { telemetry } = await import("./telemetry");
            telemetry.reportError(billingError, endpoint);
          } catch {
            // Silently fail
          }

          // Only retry on 5xx errors or network errors
          if (response.status >= 500 && attempt < maxRetries) {
            lastError = billingError;
            const backoffMs = calculateBackoff(attempt, this.retryConfig);
            await delay(backoffMs);
            continue;
          }

          throw billingError;
        }

        return response.json();
      } catch (error) {
        if (error instanceof BillingError) {
          throw error;
        }

        // Handle timeout and network errors
        const isRetryable =
          error instanceof TypeError || // Network error
          (error instanceof DOMException && error.name === "AbortError"); // Timeout

        if (isRetryable && attempt < maxRetries) {
          lastError = error instanceof Error ? error : new Error(String(error));
          const backoffMs = calculateBackoff(attempt, this.retryConfig);
          await delay(backoffMs);
          continue;
        }

        // Create typed error for unknown errors
        if (error instanceof DOMException && error.name === "AbortError") {
          throw new BillingError(
            "Request timeout",
            BillingErrorCode.TIMEOUT,
            408
          );
        }

        throw new BillingError(
          error instanceof Error ? error.message : "Network error",
          BillingErrorCode.NETWORK_ERROR,
          0
        );
      }
    }

    // If we exhausted all retries
    throw new BillingError(
      lastError?.message || "Max retries exceeded",
      BillingErrorCode.MAX_RETRIES_EXCEEDED,
      0
    );
  }

  private mapStatusToErrorCode(status: number): BillingErrorCode {
    switch (status) {
      case 400:
        return BillingErrorCode.BAD_REQUEST;
      case 401:
        return BillingErrorCode.UNAUTHORIZED;
      case 404:
        return BillingErrorCode.NOT_FOUND;
      case 429:
        return BillingErrorCode.RATE_LIMITED;
      case 500:
        return BillingErrorCode.INTERNAL_ERROR;
      case 503:
        return BillingErrorCode.SERVICE_UNAVAILABLE;
      default:
        return BillingErrorCode.UNKNOWN;
    }
  }

  private buildErrorMessage(baseMessage: string, status: number, endpoint: string): string {
    const fixes: Record<number, string> = {
      400: "Check your request parameters. Run 'npx @drewsepsi/billing doctor' to verify setup.",
      401: "Authentication failed. Check STRIPE_SECRET_KEY in .env.local. Run: npx @drewsepsi/billing doctor",
      404: `API endpoint not found. Is your dev server running? Try: npm run dev`,
      429: "Rate limit exceeded. Wait a moment or upgrade your plan.",
      500: "Server error. Try sandbox mode: BILLING_SANDBOX_MODE=true npm run dev",
      503: "Service temporarily unavailable. Check status or try again later.",
    };

    const fix = fixes[status];
    if (fix) {
      return `${baseMessage}\n\n→ Fix: ${fix}`;
    }

    // Check for specific error patterns
    if (baseMessage.includes("STRIPE_SECRET_KEY")) {
      return `${baseMessage}\n\n→ Fix: Add STRIPE_SECRET_KEY to .env.local, then run: npx @drewsepsi/billing doctor`;
    }

    if (baseMessage.includes("webhook")) {
      return `${baseMessage}\n\n→ Fix: Start webhook listener: stripe listen --forward-to http://localhost:3000/api/stripe/webhook`;
    }

    if (baseMessage.includes("subscription")) {
      return `${baseMessage}\n\n→ Fix: Check subscription status at http://localhost:3000/dashboard or run: npx @drewsepsi/billing doctor`;
    }

    return baseMessage;
  }
}

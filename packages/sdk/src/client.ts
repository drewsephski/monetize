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
    this.timeout = options.timeout || 30000;
    this.retryConfig = options.retryConfig || DEFAULT_RETRY_CONFIG;
  }

  async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
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

          const billingError = new BillingError(
            errorData.error || `HTTP ${response.status}`,
            this.mapStatusToErrorCode(response.status),
            response.status,
            errorData.requestId
          );

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

        const isRetryable =
          error instanceof TypeError ||
          (error instanceof DOMException && error.name === "AbortError");

        if (isRetryable && attempt < maxRetries) {
          lastError = error instanceof Error ? error : new Error(String(error));
          const backoffMs = calculateBackoff(attempt, this.retryConfig);
          await delay(backoffMs);
          continue;
        }

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
}

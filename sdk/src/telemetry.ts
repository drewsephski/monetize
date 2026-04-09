/**
 * Telemetry Client for @drew/billing SDK
 * Anonymous, opt-in usage and error reporting
 */

import { BillingError, BillingErrorCode } from "./types";

export interface TelemetryOptions {
  enabled: boolean;
  endpoint?: string;
  projectId?: string;
  sdkVersion: string;
}

export interface TelemetryEvent {
  type: string;
  timestamp: string;
  sessionId: string;
  projectHash: string;
  sdkVersion: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorReport {
  errorType: BillingErrorCode;
  message: string;
  endpoint: string;
  sdkVersion: string;
  timestamp: string;
  projectHash: string;
  sessionId: string;
  stack?: string;
}

// Generate anonymous session ID
function generateSessionId(): string {
  return `sess_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
}

// Hash project identifier (no PII)
function hashProject(): string {
  // Use a combination of hostname + cwd hash (anonymized)
  const data = `${typeof window !== 'undefined' ? window.location.hostname : 'node'}_${Date.now()}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `proj_${Math.abs(hash).toString(36)}`;
}

class TelemetryClient {
  private enabled = false;
  private endpoint = "";
  private projectHash = "";
  private sessionId = "";
  private sdkVersion = "";
  private queue: TelemetryEvent[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;

  init(options: TelemetryOptions) {
    this.enabled = options.enabled;
    this.endpoint = options.endpoint || "";
    this.sdkVersion = options.sdkVersion;
    this.projectHash = options.projectId || hashProject();
    this.sessionId = generateSessionId();

    if (this.enabled && this.endpoint) {
      // Flush queue every 30 seconds
      this.flushInterval = setInterval(() => this.flush(), 30000);
      
      // Flush on page unload (browser only)
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => this.flush());
      }
    }
  }

  track(eventType: string, metadata?: Record<string, unknown>) {
    if (!this.enabled) return;

    const event: TelemetryEvent = {
      type: eventType,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      projectHash: this.projectHash,
      sdkVersion: this.sdkVersion,
      metadata,
    };

    this.queue.push(event);

    // Flush immediately if queue gets large
    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  reportError(error: BillingError, endpoint: string) {
    if (!this.enabled) return;

    const report: ErrorReport = {
      errorType: error.code,
      message: error.message,
      endpoint,
      sdkVersion: this.sdkVersion,
      timestamp: new Date().toISOString(),
      projectHash: this.projectHash,
      sessionId: this.sessionId,
    };

    // Send errors immediately (don't queue)
    this.sendError(report);
  }

  private async flush() {
    if (this.queue.length === 0 || !this.endpoint) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      await fetch(`${this.endpoint}/telemetry/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events }),
      });
    } catch {
      // Silently fail - don't break user experience
      // Put events back in queue for retry
      this.queue.unshift(...events);
    }
  }

  private async sendError(report: ErrorReport) {
    if (!this.endpoint) return;

    try {
      await fetch(`${this.endpoint}/telemetry/error`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });
    } catch {
      // Silently fail
    }
  }

  dispose() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush();
  }
}

// Singleton instance
export const telemetry = new TelemetryClient();

// Helper to enable telemetry with user consent
export function enableTelemetry(endpoint?: string): boolean {
  telemetry.init({
    enabled: true,
    endpoint: endpoint || "https://billing.drew.dev/api/internal",
    sdkVersion: "1.0.0",
  });
  return true;
}

// Helper to check if telemetry is enabled
export function isTelemetryEnabled(): boolean {
  return false; // Default to false until explicitly enabled
}

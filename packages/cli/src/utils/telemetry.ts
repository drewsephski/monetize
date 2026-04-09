/**
 * CLI Telemetry - Anonymous usage tracking
 */

import { createHash } from "crypto";
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import chalk from "chalk";

const TELEMETRY_DIR = join(homedir(), ".drew-billing");
const TELEMETRY_FILE = join(TELEMETRY_DIR, "telemetry.json");
const TELEMETRY_ENDPOINT = process.env.TELEMETRY_ENDPOINT || "https://billing.drew.dev/api/internal/telemetry";

export interface CLITelemetryConfig {
  enabled: boolean;
  machineId: string;
  optedInAt?: string;
}

interface TelemetryEvent {
  type: string;
  timestamp: string;
  machineId: string;
  sessionId: string;
  cliVersion: string;
  metadata?: Record<string, unknown>;
}

// Get or create machine ID (hashed, no PII)
function getMachineId(): string {
  const data = `${homedir()}_${process.platform}_${process.arch}`;
  return createHash("sha256").update(data).digest("hex").substring(0, 16);
}

// Load telemetry config
export function loadTelemetryConfig(): CLITelemetryConfig {
  try {
    if (existsSync(TELEMETRY_FILE)) {
      const data = JSON.parse(readFileSync(TELEMETRY_FILE, "utf-8"));
      return {
        enabled: data.enabled ?? false,
        machineId: data.machineId || getMachineId(),
        optedInAt: data.optedInAt,
      };
    }
  } catch {
    // Ignore errors
  }

  return {
    enabled: false,
    machineId: getMachineId(),
  };
}

// Save telemetry config
export function saveTelemetryConfig(config: CLITelemetryConfig) {
  try {
    if (!existsSync(TELEMETRY_DIR)) {
      mkdirSync(TELEMETRY_DIR, { recursive: true });
    }
    writeFileSync(TELEMETRY_FILE, JSON.stringify(config, null, 2));
  } catch {
    // Ignore errors
  }
}

// Enable telemetry
export function enableTelemetry(): void {
  const config = loadTelemetryConfig();
  config.enabled = true;
  config.optedInAt = new Date().toISOString();
  saveTelemetryConfig(config);
}

// Disable telemetry
export function disableTelemetry(): void {
  const config = loadTelemetryConfig();
  config.enabled = false;
  saveTelemetryConfig(config);
}

// Check if telemetry is enabled
export function isTelemetryEnabled(): boolean {
  return loadTelemetryConfig().enabled;
}

// Generate session ID
function generateSessionId(): string {
  return `cli_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
}

// Track event
export function trackEvent(type: string, metadata?: Record<string, unknown>): void {
  const config = loadTelemetryConfig();
  if (!config.enabled) return;

  const event: TelemetryEvent = {
    type,
    timestamp: new Date().toISOString(),
    machineId: config.machineId,
    sessionId: generateSessionId(),
    cliVersion: "1.0.0",
    metadata,
  };

  // Send async (fire and forget)
  sendEvent(event).catch(() => {
    // Silently fail
  });
}

// Track error
export function trackError(error: Error, context?: string): void {
  const config = loadTelemetryConfig();
  if (!config.enabled) return;

  trackEvent("cli_error", {
    error: error.message,
    stack: error.stack,
    context,
  });
}

// Track timing
export function trackTiming(event: string, durationMs: number, metadata?: Record<string, unknown>): void {
  trackEvent(event, { ...metadata, durationMs });
}

// Send event to endpoint
async function sendEvent(event: TelemetryEvent): Promise<void> {
  try {
    await fetch(TELEMETRY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
  } catch {
    // Silently fail - don't break CLI
  }
}

// Prompt for telemetry consent
export async function promptTelemetryConsent(): Promise<boolean> {
  const config = loadTelemetryConfig();
  
  // If already decided, respect the choice
  if (config.optedInAt) {
    return config.enabled;
  }

  console.log(chalk.blue("\n📊 Help improve @drew/billing"));
  console.log(chalk.gray("Anonymous telemetry helps us understand usage and fix issues faster."));
  console.log(chalk.gray("We collect: command types, timing, errors (no PII).\n"));

  // In a real CLI, you'd use inquirer here
  // For now, show the prompt message
  console.log(chalk.gray("To enable: npx @drew/billing telemetry --enable"));
  console.log(chalk.gray("To disable: npx @drew/billing telemetry --disable\n"));

  return false;
}

// Funnel tracking
export const FunnelStage = {
  CLI_INSTALL: "cli_install",
  INIT_STARTED: "init_started",
  INIT_COMPLETED: "init_completed",
  SANDBOX_STARTED: "sandbox_started",
  FIRST_CHECKOUT: "first_checkout",
  FIRST_SUBSCRIPTION: "first_subscription",
} as const;

export type FunnelStage = typeof FunnelStage[keyof typeof FunnelStage];

export function trackFunnel(stage: FunnelStage, metadata?: Record<string, unknown>): void {
  trackEvent(`funnel_${stage}`, metadata);
}

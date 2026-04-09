// Sandbox SDK - Test billing without real Stripe API calls
// Usage: Set BILLING_SANDBOX_MODE=true in your environment

import { shouldUseSandbox } from "./client.js";

export {
  SandboxStripeClient,
  createSandboxStripeClient,
} from "./client.js";
export { shouldUseSandbox };

export { sandboxStorage, getSandboxStorage } from "./storage.js";
export type {
  SandboxCheckoutSession,
  SandboxSubscription,
  SandboxCustomer,
  SandboxEvent,
} from "./storage.js";

export {
  simulateEvent,
  listAvailableEvents,
  eventSimulators,
} from "./events.js";
export type { SandboxEventType } from "./events.js";

// Convenience function to check sandbox status
export function isSandboxMode(): boolean {
  return shouldUseSandbox();
}

// Helper to log sandbox status
export function logSandboxStatus(): void {
  if (isSandboxMode()) {
    console.log("🔮 Sandbox mode enabled - no real charges will be processed");
  }
}

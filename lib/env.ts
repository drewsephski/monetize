// Environment variable configuration with safe defaults and lazy validation
// This prevents 500 errors on Vercel during cold starts or edge runtime

interface EnvConfig {
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  stripeLicenseWebhookSecret: string;
  stripePublishableKey?: string;
  databaseUrl: string;
  cronSecret?: string;
  betterAuthSecret: string;
  betterAuthUrl: string;
  nextPublicApiUrl?: string;
  nextPublicStripePricePro?: string;
  billingSandboxMode: boolean;
}

let cachedEnv: EnvConfig | null = null;
const warnedVars = new Set<string>();

function warnOnce(envVar: string) {
  if (!warnedVars.has(envVar)) {
    console.warn(`[ENV] ${envVar} is not set. Some features may not work correctly.`);
    warnedVars.add(envVar);
  }
}

function getEnvVar(name: string, required = false): string {
  const value = process.env[name];
  if (!value) {
    if (required) {
      // In production, return a placeholder instead of throwing
      // This prevents 500 errors while still logging the issue
      if (process.env.NODE_ENV === "production") {
        warnOnce(name);
        return `[MISSING_${name}]`;
      }
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return "";
  }
  return value;
}

function validateEnv(): EnvConfig {
  if (cachedEnv) return cachedEnv;

  const config: EnvConfig = {
    stripeSecretKey: getEnvVar("STRIPE_SECRET_KEY", true),
    stripeWebhookSecret: getEnvVar("STRIPE_WEBHOOK_SECRET", true),
    stripeLicenseWebhookSecret: getEnvVar("STRIPE_LICENSE_WEBHOOK_SECRET", true),
    databaseUrl: getEnvVar("DATABASE_URL", true),
    betterAuthSecret: getEnvVar("BETTER_AUTH_SECRET", true),
    betterAuthUrl: getEnvVar("BETTER_AUTH_URL", true),
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    cronSecret: process.env.CRON_SECRET,
    nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL,
    nextPublicStripePricePro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    billingSandboxMode: process.env.BILLING_SANDBOX_MODE === "true",
  };

  cachedEnv = config;
  return cachedEnv;
}

export const env = new Proxy({} as EnvConfig, {
  get(_target, prop) {
    return validateEnv()[prop as keyof EnvConfig];
  },
});

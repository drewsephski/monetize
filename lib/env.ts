import { config } from "dotenv";

config({ path: ".env" });

const requiredEnvVars = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_LICENSE_WEBHOOK_SECRET",
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
] as const;

type RequiredEnvVar = (typeof requiredEnvVars)[number];

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
}

function validateEnv(): EnvConfig {
  const missing: string[] = [];
  const config: Partial<EnvConfig> = {};

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (!value) {
      missing.push(envVar);
    } else {
      switch (envVar) {
        case "STRIPE_SECRET_KEY":
          config.stripeSecretKey = value;
          break;
        case "STRIPE_WEBHOOK_SECRET":
          config.stripeWebhookSecret = value;
          break;
        case "STRIPE_LICENSE_WEBHOOK_SECRET":
          config.stripeLicenseWebhookSecret = value;
          break;
        case "DATABASE_URL":
          config.databaseUrl = value;
          break;
        case "BETTER_AUTH_SECRET":
          config.betterAuthSecret = value;
          break;
        case "BETTER_AUTH_URL":
          config.betterAuthUrl = value;
          break;
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  config.stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  config.cronSecret = process.env.CRON_SECRET;
  config.nextPublicApiUrl = process.env.NEXT_PUBLIC_API_URL;
  config.nextPublicStripePricePro = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO;

  return config as EnvConfig;
}

export const env = validateEnv();

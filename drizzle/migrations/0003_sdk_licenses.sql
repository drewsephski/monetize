-- SDK License Monetization Tables
-- Created: $(date)

-- Create SDK licenses table
CREATE TABLE IF NOT EXISTS "sdk_licenses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "license_key" varchar(255) NOT NULL UNIQUE,
  "customer_email" varchar(255) NOT NULL,
  "stripe_customer_id" varchar(255),
  "stripe_subscription_id" varchar(255),
  "tier" varchar(50) NOT NULL DEFAULT 'free',
  "status" varchar(50) NOT NULL DEFAULT 'active',
  "features" jsonb DEFAULT '[]',
  "usage_limits" jsonb DEFAULT '{}',
  "current_usage" jsonb DEFAULT '{}',
  "expires_at" timestamp with time zone,
  "last_verified_at" timestamp with time zone,
  "last_verified_ip" varchar(255),
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create SDK license usage tracking table
CREATE TABLE IF NOT EXISTS "sdk_license_usage" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "license_id" uuid NOT NULL REFERENCES "sdk_licenses"("id") ON DELETE CASCADE,
  "machine_id" varchar(64) NOT NULL,
  "event_type" varchar(50) NOT NULL,
  "metadata" jsonb,
  "timestamp" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes for SDK licenses
CREATE INDEX IF NOT EXISTS "sdk_licenses_key_idx" ON "sdk_licenses"("license_key");
CREATE INDEX IF NOT EXISTS "sdk_licenses_email_idx" ON "sdk_licenses"("customer_email");
CREATE INDEX IF NOT EXISTS "sdk_licenses_status_idx" ON "sdk_licenses"("status");
CREATE INDEX IF NOT EXISTS "sdk_licenses_tier_idx" ON "sdk_licenses"("tier");
CREATE INDEX IF NOT EXISTS "sdk_licenses_expires_at_idx" ON "sdk_licenses"("expires_at");

-- Create indexes for SDK license usage
CREATE INDEX IF NOT EXISTS "sdk_license_usage_license_id_idx" ON "sdk_license_usage"("license_id");
CREATE INDEX IF NOT EXISTS "sdk_license_usage_machine_id_idx" ON "sdk_license_usage"("machine_id");
CREATE INDEX IF NOT EXISTS "sdk_license_usage_timestamp_idx" ON "sdk_license_usage"("timestamp");
CREATE INDEX IF NOT EXISTS "sdk_license_usage_event_type_idx" ON "sdk_license_usage"("event_type");

-- Add comments
COMMENT ON TABLE "sdk_licenses" IS 'SDK license keys for monetizing the @drew/billing SDK';
COMMENT ON TABLE "sdk_license_usage" IS 'Tracks SDK license validation and usage events';

CREATE TABLE "sdk_license_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"license_id" uuid NOT NULL,
	"machine_id" varchar(64) NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"metadata" jsonb,
	"timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sdk_licenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"license_key" varchar(255) NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"tier" varchar(50) DEFAULT 'free' NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb,
	"usage_limits" jsonb DEFAULT '{}'::jsonb,
	"current_usage" jsonb DEFAULT '{}'::jsonb,
	"expires_at" timestamp with time zone,
	"last_verified_at" timestamp with time zone,
	"last_verified_ip" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sdk_licenses_license_key_unique" UNIQUE("license_key")
);
--> statement-breakpoint
ALTER TABLE "sdk_license_usage" ADD CONSTRAINT "sdk_license_usage_license_id_sdk_licenses_id_fk" FOREIGN KEY ("license_id") REFERENCES "public"."sdk_licenses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sdk_license_usage_license_id_idx" ON "sdk_license_usage" USING btree ("license_id");--> statement-breakpoint
CREATE INDEX "sdk_license_usage_machine_id_idx" ON "sdk_license_usage" USING btree ("machine_id");--> statement-breakpoint
CREATE INDEX "sdk_license_usage_timestamp_idx" ON "sdk_license_usage" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "sdk_license_usage_event_type_idx" ON "sdk_license_usage" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "sdk_licenses_key_idx" ON "sdk_licenses" USING btree ("license_key");--> statement-breakpoint
CREATE INDEX "sdk_licenses_email_idx" ON "sdk_licenses" USING btree ("customer_email");--> statement-breakpoint
CREATE INDEX "sdk_licenses_status_idx" ON "sdk_licenses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sdk_licenses_tier_idx" ON "sdk_licenses" USING btree ("tier");--> statement-breakpoint
CREATE INDEX "sdk_licenses_expires_at_idx" ON "sdk_licenses" USING btree ("expires_at");
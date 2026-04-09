CREATE TABLE "api_key_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_key_id" uuid NOT NULL,
	"developer_account_id" uuid NOT NULL,
	"endpoint" varchar(100) NOT NULL,
	"method" varchar(10) NOT NULL,
	"status_code" integer,
	"response_time_ms" integer,
	"timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"developer_account_id" uuid NOT NULL,
	"key_hash" varchar(255) NOT NULL,
	"key_prefix" varchar(20) NOT NULL,
	"name" varchar(255),
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"last_used_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"rate_limit_per_minute" integer DEFAULT 60,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "billing_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metric_name" varchar(100) NOT NULL,
	"metric_value" integer NOT NULL,
	"dimensions" jsonb,
	"bucket_time" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "developer_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"billing_plan" varchar(50) DEFAULT 'free' NOT NULL,
	"monthly_quota" integer DEFAULT 1000,
	"current_month_usage" integer DEFAULT 0,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "developer_accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "dunning_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid,
	"org_subscription_id" uuid,
	"step" integer NOT NULL,
	"status" varchar(50) NOT NULL,
	"sent_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"error_message" varchar(500),
	"triggered_by_invoice_id" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entitlements_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"organization_id" uuid,
	"entitlements" jsonb NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_timeline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"stripe_event_id" varchar(255),
	"event_type" varchar(100) NOT NULL,
	"source" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"payload" jsonb,
	"processing_attempts" integer DEFAULT 0 NOT NULL,
	"last_error" varchar(1000),
	"processed_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(50) DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"stripe_subscription_id" varchar(255) NOT NULL,
	"stripe_status" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"plan_id" uuid,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"trial_start" timestamp with time zone,
	"trial_end" timestamp with time zone,
	"trial_active" boolean DEFAULT false,
	"canceled_at" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false,
	"failed_payment_count" integer DEFAULT 0,
	"past_due_since" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"stripe_customer_id" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "request_traces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" varchar(255) NOT NULL,
	"event_id" varchar(255),
	"customer_id" uuid,
	"user_id" uuid,
	"type" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"metadata" jsonb,
	"error_message" varchar(1000),
	"duration_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "request_traces_request_id_unique" UNIQUE("request_id")
);
--> statement-breakpoint
CREATE TABLE "usage_aggregates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"customer_id" uuid,
	"feature" varchar(100) NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"total_usage" integer NOT NULL,
	"stripe_subscription_item_id" varchar(255),
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"customer_id" uuid,
	"feature" varchar(100) NOT NULL,
	"quantity" integer NOT NULL,
	"stripe_usage_record_id" varchar(255),
	"synced_to_stripe" boolean DEFAULT false NOT NULL,
	"synced_at" timestamp with time zone,
	"error_message" varchar(500),
	"timestamp" timestamp with time zone NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stripe_event_id" varchar(255) NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 5 NOT NULL,
	"next_attempt_at" timestamp with time zone,
	"last_error" varchar(1000),
	"processed_at" timestamp with time zone,
	"dead_letter_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "webhook_queue_stripe_event_id_unique" UNIQUE("stripe_event_id")
);
--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "features" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "limits" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "trial_days" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "trial_active" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "failed_payment_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "past_due_since" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "api_key_usage" ADD CONSTRAINT "api_key_usage_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_key_usage" ADD CONSTRAINT "api_key_usage_developer_account_id_developer_accounts_id_fk" FOREIGN KEY ("developer_account_id") REFERENCES "public"."developer_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_developer_account_id_developer_accounts_id_fk" FOREIGN KEY ("developer_account_id") REFERENCES "public"."developer_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dunning_attempts" ADD CONSTRAINT "dunning_attempts_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dunning_attempts" ADD CONSTRAINT "dunning_attempts_org_subscription_id_organization_subscriptions_id_fk" FOREIGN KEY ("org_subscription_id") REFERENCES "public"."organization_subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlements_cache" ADD CONSTRAINT "entitlements_cache_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entitlements_cache" ADD CONSTRAINT "entitlements_cache_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_timeline" ADD CONSTRAINT "event_timeline_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD CONSTRAINT "organization_subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_subscriptions" ADD CONSTRAINT "organization_subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_traces" ADD CONSTRAINT "request_traces_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_traces" ADD CONSTRAINT "request_traces_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_aggregates" ADD CONSTRAINT "usage_aggregates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_aggregates" ADD CONSTRAINT "usage_aggregates_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "api_key_usage_api_key_id_idx" ON "api_key_usage" USING btree ("api_key_id");--> statement-breakpoint
CREATE INDEX "api_key_usage_developer_account_id_idx" ON "api_key_usage" USING btree ("developer_account_id");--> statement-breakpoint
CREATE INDEX "api_key_usage_timestamp_idx" ON "api_key_usage" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "api_key_usage_endpoint_idx" ON "api_key_usage" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "api_keys_developer_account_id_idx" ON "api_keys" USING btree ("developer_account_id");--> statement-breakpoint
CREATE INDEX "api_keys_key_hash_idx" ON "api_keys" USING btree ("key_hash");--> statement-breakpoint
CREATE INDEX "api_keys_status_idx" ON "api_keys" USING btree ("status");--> statement-breakpoint
CREATE INDEX "api_keys_prefix_idx" ON "api_keys" USING btree ("key_prefix");--> statement-breakpoint
CREATE INDEX "billing_metrics_name_bucket_idx" ON "billing_metrics" USING btree ("metric_name","bucket_time");--> statement-breakpoint
CREATE INDEX "billing_metrics_bucket_time_idx" ON "billing_metrics" USING btree ("bucket_time");--> statement-breakpoint
CREATE INDEX "developer_accounts_email_idx" ON "developer_accounts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "developer_accounts_status_idx" ON "developer_accounts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "developer_accounts_stripe_customer_id_idx" ON "developer_accounts" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "dunning_attempts_subscription_id_idx" ON "dunning_attempts" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "dunning_attempts_org_subscription_id_idx" ON "dunning_attempts" USING btree ("org_subscription_id");--> statement-breakpoint
CREATE INDEX "dunning_attempts_step_idx" ON "dunning_attempts" USING btree ("step");--> statement-breakpoint
CREATE INDEX "dunning_attempts_status_idx" ON "dunning_attempts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "dunning_attempts_created_at_idx" ON "dunning_attempts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "entitlements_cache_user_id_idx" ON "entitlements_cache" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "entitlements_cache_org_id_idx" ON "entitlements_cache" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "entitlements_cache_expires_at_idx" ON "entitlements_cache" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "event_timeline_customer_id_idx" ON "event_timeline" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "event_timeline_stripe_event_id_idx" ON "event_timeline" USING btree ("stripe_event_id");--> statement-breakpoint
CREATE INDEX "event_timeline_event_type_idx" ON "event_timeline" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "event_timeline_status_idx" ON "event_timeline" USING btree ("status");--> statement-breakpoint
CREATE INDEX "event_timeline_created_at_idx" ON "event_timeline" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "event_timeline_customer_created_at_idx" ON "event_timeline" USING btree ("customer_id","created_at");--> statement-breakpoint
CREATE INDEX "organization_members_org_id_idx" ON "organization_members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_members_user_id_idx" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "organization_members_org_user_unique_idx" ON "organization_members" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "org_subscriptions_org_id_idx" ON "organization_subscriptions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "org_subscriptions_status_idx" ON "organization_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "org_subscriptions_stripe_id_idx" ON "organization_subscriptions" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "organizations_stripe_customer_id_idx" ON "organizations" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "request_traces_request_id_idx" ON "request_traces" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "request_traces_event_id_idx" ON "request_traces" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "request_traces_customer_id_idx" ON "request_traces" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "request_traces_user_id_idx" ON "request_traces" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "request_traces_type_status_idx" ON "request_traces" USING btree ("type","status");--> statement-breakpoint
CREATE INDEX "request_traces_created_at_idx" ON "request_traces" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "usage_aggregates_user_id_idx" ON "usage_aggregates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "usage_aggregates_customer_id_idx" ON "usage_aggregates" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "usage_aggregates_feature_idx" ON "usage_aggregates" USING btree ("feature");--> statement-breakpoint
CREATE INDEX "usage_aggregates_period_idx" ON "usage_aggregates" USING btree ("period_start","period_end");--> statement-breakpoint
CREATE INDEX "usage_aggregates_user_feature_period_idx" ON "usage_aggregates" USING btree ("user_id","feature","period_start");--> statement-breakpoint
CREATE INDEX "usage_events_user_id_idx" ON "usage_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "usage_events_customer_id_idx" ON "usage_events" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "usage_events_feature_idx" ON "usage_events" USING btree ("feature");--> statement-breakpoint
CREATE INDEX "usage_events_timestamp_idx" ON "usage_events" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "usage_events_synced_to_stripe_idx" ON "usage_events" USING btree ("synced_to_stripe");--> statement-breakpoint
CREATE INDEX "usage_events_user_feature_time_idx" ON "usage_events" USING btree ("user_id","feature","timestamp");--> statement-breakpoint
CREATE INDEX "webhook_queue_stripe_event_id_idx" ON "webhook_queue" USING btree ("stripe_event_id");--> statement-breakpoint
CREATE INDEX "webhook_queue_status_idx" ON "webhook_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "webhook_queue_next_attempt_at_idx" ON "webhook_queue" USING btree ("next_attempt_at");--> statement-breakpoint
CREATE INDEX "webhook_queue_status_attempts_idx" ON "webhook_queue" USING btree ("status","attempts");--> statement-breakpoint
CREATE INDEX "subscriptions_trial_active_idx" ON "subscriptions" USING btree ("trial_active");
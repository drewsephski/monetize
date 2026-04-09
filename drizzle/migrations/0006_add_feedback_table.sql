CREATE TABLE "feedback_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"machine_id" varchar(32),
	"source" varchar(20) DEFAULT 'cli' NOT NULL,
	"rating" varchar(10),
	"feedback" varchar(2000),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"cli_version" varchar(20),
	"timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "funnel_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stage" varchar(50) NOT NULL,
	"machine_id" varchar(32) NOT NULL,
	"converted" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"date" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telemetry_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"machine_id" varchar(32),
	"session_id" varchar(32),
	"source" varchar(20) DEFAULT 'cli' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"cli_version" varchar(20),
	"timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "feedback_events_type_idx" ON "feedback_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "feedback_events_machine_id_idx" ON "feedback_events" USING btree ("machine_id");--> statement-breakpoint
CREATE INDEX "feedback_events_timestamp_idx" ON "feedback_events" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "feedback_events_source_idx" ON "feedback_events" USING btree ("source");--> statement-breakpoint
CREATE INDEX "funnel_metrics_stage_idx" ON "funnel_metrics" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "funnel_metrics_machine_id_idx" ON "funnel_metrics" USING btree ("machine_id");--> statement-breakpoint
CREATE INDEX "funnel_metrics_date_idx" ON "funnel_metrics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "funnel_metrics_stage_date_idx" ON "funnel_metrics" USING btree ("stage","date");--> statement-breakpoint
CREATE INDEX "telemetry_events_type_idx" ON "telemetry_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "telemetry_events_machine_id_idx" ON "telemetry_events" USING btree ("machine_id");--> statement-breakpoint
CREATE INDEX "telemetry_events_timestamp_idx" ON "telemetry_events" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "telemetry_events_source_idx" ON "telemetry_events" USING btree ("source");
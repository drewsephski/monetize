CREATE INDEX "customers_user_id_idx" ON "customers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "customers_stripe_customer_id_idx" ON "customers" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "plans_stripe_price_id_idx" ON "plans" USING btree ("stripe_price_id");--> statement-breakpoint
CREATE INDEX "stripe_events_processed_attempts_idx" ON "stripe_events" USING btree ("processed","attempts");--> statement-breakpoint
CREATE INDEX "stripe_events_type_idx" ON "stripe_events" USING btree ("type");--> statement-breakpoint
CREATE INDEX "stripe_events_created_at_idx" ON "stripe_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "subscriptions_customer_id_idx" ON "subscriptions" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subscriptions_stripe_subscription_id_idx" ON "subscriptions" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE INDEX "subscriptions_current_period_end_idx" ON "subscriptions" USING btree ("current_period_end");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");
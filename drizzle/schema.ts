import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  jsonb,
  integer,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: varchar("image", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
  })
);

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 })
      .notNull()
      .unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("customers_user_id_idx").on(table.userId),
    stripeCustomerIdIdx: index("customers_stripe_customer_id_idx").on(
      table.stripeCustomerId
    ),
  })
);

export const plans = pgTable(
  "plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    stripePriceId: varchar("stripe_price_id", { length: 255 })
      .notNull()
      .unique(),
    metadata: jsonb("metadata"),
    features: jsonb("features").default([]),
    limits: jsonb("limits").default({}),
    trialDays: integer("trial_days").default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    stripePriceIdIdx: index("plans_stripe_price_id_idx").on(
      table.stripePriceId
    ),
  })
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 })
      .notNull()
      .unique(),
    stripeStatus: varchar("stripe_status", { length: 50 }).notNull(),
    status: varchar("status", { length: 50 }).notNull(),
    planId: uuid("plan_id").references(() => plans.id, {
      onDelete: "set null",
    }),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    trialStart: timestamp("trial_start", { withTimezone: true }),
    trialEnd: timestamp("trial_end", { withTimezone: true }),
    trialActive: boolean("trial_active").default(false),
    canceledAt: timestamp("canceled_at", { withTimezone: true }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
    failedPaymentCount: integer("failed_payment_count").default(0),
    pastDueSince: timestamp("past_due_since", { withTimezone: true }),
    lastEventTimestamp: timestamp("last_event_timestamp", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    customerIdIdx: index("subscriptions_customer_id_idx").on(
      table.customerId
    ),
    statusIdx: index("subscriptions_status_idx").on(table.status),
    stripeSubscriptionIdIdx: index("subscriptions_stripe_subscription_id_idx").on(
      table.stripeSubscriptionId
    ),
    currentPeriodEndIdx: index("subscriptions_current_period_end_idx").on(
      table.currentPeriodEnd
    ),
    lastEventTimestampIdx: index("subscriptions_last_event_timestamp_idx").on(
      table.lastEventTimestamp
    ),
    trialActiveIdx: index("subscriptions_trial_active_idx").on(
      table.trialActive
    ),
  })
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stripeInvoiceId: varchar("stripe_invoice_id", { length: 255 })
      .notNull()
      .unique(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    subscriptionId: uuid("subscription_id").references(() => subscriptions.id, {
      onDelete: "set null",
    }),
    status: varchar("status", { length: 50 }).notNull(),
    amount: integer("amount").notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    hostedInvoiceUrl: varchar("hosted_invoice_url", { length: 500 }),
    pdfUrl: varchar("pdf_url", { length: 500 }),
    invoiceNumber: varchar("invoice_number", { length: 100 }),
    description: varchar("description", { length: 500 }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    stripeInvoiceIdIdx: index("invoices_stripe_invoice_id_idx").on(
      table.stripeInvoiceId
    ),
    customerIdIdx: index("invoices_customer_id_idx").on(table.customerId),
    subscriptionIdIdx: index("invoices_subscription_id_idx").on(
      table.subscriptionId
    ),
    statusIdx: index("invoices_status_idx").on(table.status),
    createdAtIdx: index("invoices_created_at_idx").on(table.createdAt),
  })
);

export const stripeEvents = pgTable(
  "stripe_events",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    type: varchar("type", { length: 255 }).notNull(),
    payload: jsonb("payload").notNull(),
    processed: boolean("processed").default(false).notNull(),
    attempts: integer("attempts").default(0).notNull(),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }),
    lastError: varchar("last_error", { length: 1000 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    processedAttemptsIdx: index("stripe_events_processed_attempts_idx").on(
      table.processed,
      table.attempts
    ),
    nextAttemptAtIdx: index("stripe_events_next_attempt_at_idx").on(
      table.nextAttemptAt
    ),
    typeIdx: index("stripe_events_type_idx").on(table.type),
    createdAtIdx: index("stripe_events_created_at_idx").on(table.createdAt),
  })
);

// Better Auth tables
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: varchar("ip_address", { length: 255 }),
    userAgent: varchar("user_agent", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
    expiresAtIdx: index("sessions_expires_at_idx").on(table.expiresAt),
    tokenIdx: index("sessions_token_idx").on(table.token),
  })
);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: varchar("account_id", { length: 255 }).notNull(),
    providerId: varchar("provider_id", { length: 255 }).notNull(),
    accessToken: varchar("access_token", { length: 255 }),
    refreshToken: varchar("refresh_token", { length: 255 }),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: varchar("scope", { length: 255 }),
    idToken: varchar("id_token"),
    password: varchar("password", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("accounts_user_id_idx").on(table.userId),
    providerAccountIdx: index("accounts_provider_account_idx").on(
      table.providerId,
      table.accountId
    ),
  })
);

export const verifications = pgTable(
  "verifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: varchar("value", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    identifierIdx: index("verifications_identifier_idx").on(table.identifier),
    expiresAtIdx: index("verifications_expires_at_idx").on(table.expiresAt),
  })
);

// ============================================================================
// PHASE 4: OBSERVABILITY & OPERATIONS
// ============================================================================

// Request tracing for correlation across the billing lifecycle
export const requestTraces = pgTable(
  "request_traces",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requestId: varchar("request_id", { length: 255 }).notNull().unique(),
    eventId: varchar("event_id", { length: 255 }),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(), // checkout, subscription_update, usage_track, etc.
    status: varchar("status", { length: 50 }).notNull(), // pending, success, error
    metadata: jsonb("metadata"),
    errorMessage: varchar("error_message", { length: 1000 }),
    durationMs: integer("duration_ms"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => ({
    requestIdIdx: index("request_traces_request_id_idx").on(table.requestId),
    eventIdIdx: index("request_traces_event_id_idx").on(table.eventId),
    customerIdIdx: index("request_traces_customer_id_idx").on(table.customerId),
    userIdIdx: index("request_traces_user_id_idx").on(table.userId),
    typeStatusIdx: index("request_traces_type_status_idx").on(table.type, table.status),
    createdAtIdx: index("request_traces_created_at_idx").on(table.createdAt),
  })
);

// Event timeline for debugging customer billing history
export const eventTimeline = pgTable(
  "event_timeline",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    stripeEventId: varchar("stripe_event_id", { length: 255 }),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    source: varchar("source", { length: 50 }).notNull(), // stripe, system, api
    status: varchar("status", { length: 50 }).notNull(), // pending, processing, completed, error
    payload: jsonb("payload"),
    processingAttempts: integer("processing_attempts").default(0).notNull(),
    lastError: varchar("last_error", { length: 1000 }),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    customerIdIdx: index("event_timeline_customer_id_idx").on(table.customerId),
    stripeEventIdIdx: index("event_timeline_stripe_event_id_idx").on(table.stripeEventId),
    eventTypeIdx: index("event_timeline_event_type_idx").on(table.eventType),
    statusIdx: index("event_timeline_status_idx").on(table.status),
    createdAtIdx: index("event_timeline_created_at_idx").on(table.createdAt),
    customerCreatedAtIdx: index("event_timeline_customer_created_at_idx").on(
      table.customerId,
      table.createdAt
    ),
  })
);

// Metrics aggregation table
export const billingMetrics = pgTable(
  "billing_metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    metricName: varchar("metric_name", { length: 100 }).notNull(),
    metricValue: integer("metric_value").notNull(),
    dimensions: jsonb("dimensions"), // { event_type, status, etc. }
    bucketTime: timestamp("bucket_time", { withTimezone: true }).notNull(), // 5-minute buckets
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    metricNameBucketIdx: index("billing_metrics_name_bucket_idx").on(
      table.metricName,
      table.bucketTime
    ),
    bucketTimeIdx: index("billing_metrics_bucket_time_idx").on(table.bucketTime),
  })
);

// ============================================================================
// PHASE 4: USAGE-BASED BILLING
// ============================================================================

// Usage events for metered billing
export const usageEvents = pgTable(
  "usage_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "cascade" }),
    feature: varchar("feature", { length: 100 }).notNull(),
    quantity: integer("quantity").notNull(),
    stripeUsageRecordId: varchar("stripe_usage_record_id", { length: 255 }),
    syncedToStripe: boolean("synced_to_stripe").default(false).notNull(),
    syncedAt: timestamp("synced_at", { withTimezone: true }),
    errorMessage: varchar("error_message", { length: 500 }),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("usage_events_user_id_idx").on(table.userId),
    customerIdIdx: index("usage_events_customer_id_idx").on(table.customerId),
    featureIdx: index("usage_events_feature_idx").on(table.feature),
    timestampIdx: index("usage_events_timestamp_idx").on(table.timestamp),
    syncedToStripeIdx: index("usage_events_synced_to_stripe_idx").on(table.syncedToStripe),
    userFeatureTimeIdx: index("usage_events_user_feature_time_idx").on(
      table.userId,
      table.feature,
      table.timestamp
    ),
  })
);

// Usage aggregates for fast queries
export const usageAggregates = pgTable(
  "usage_aggregates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    customerId: uuid("customer_id").references(() => customers.id, { onDelete: "cascade" }),
    feature: varchar("feature", { length: 100 }).notNull(),
    periodStart: timestamp("period_start", { withTimezone: true }).notNull(),
    periodEnd: timestamp("period_end", { withTimezone: true }).notNull(),
    totalUsage: integer("total_usage").notNull(),
    stripeSubscriptionItemId: varchar("stripe_subscription_item_id", { length: 255 }),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("usage_aggregates_user_id_idx").on(table.userId),
    customerIdIdx: index("usage_aggregates_customer_id_idx").on(table.customerId),
    featureIdx: index("usage_aggregates_feature_idx").on(table.feature),
    periodIdx: index("usage_aggregates_period_idx").on(table.periodStart, table.periodEnd),
    userFeaturePeriodIdx: index("usage_aggregates_user_feature_period_idx").on(
      table.userId,
      table.feature,
      table.periodStart
    ),
  })
);

// ============================================================================
// PHASE 4: MULTI-TENANT / TEAM BILLING
// ============================================================================

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugIdx: index("organizations_slug_idx").on(table.slug),
    stripeCustomerIdIdx: index("organizations_stripe_customer_id_idx").on(table.stripeCustomerId),
  })
);

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 50 }).notNull().default("member"), // owner, admin, member
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    organizationIdIdx: index("organization_members_org_id_idx").on(table.organizationId),
    userIdIdx: index("organization_members_user_id_idx").on(table.userId),
    orgUserUniqueIdx: index("organization_members_org_user_unique_idx").on(
      table.organizationId,
      table.userId
    ),
  })
);

export const organizationSubscriptions = pgTable(
  "organization_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 })
      .notNull()
      .unique(),
    stripeStatus: varchar("stripe_status", { length: 50 }).notNull(),
    status: varchar("status", { length: 50 }).notNull(),
    planId: uuid("plan_id").references(() => plans.id, { onDelete: "set null" }),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    trialStart: timestamp("trial_start", { withTimezone: true }),
    trialEnd: timestamp("trial_end", { withTimezone: true }),
    trialActive: boolean("trial_active").default(false),
    canceledAt: timestamp("canceled_at", { withTimezone: true }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
    failedPaymentCount: integer("failed_payment_count").default(0),
    pastDueSince: timestamp("past_due_since", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    organizationIdIdx: index("org_subscriptions_org_id_idx").on(table.organizationId),
    statusIdx: index("org_subscriptions_status_idx").on(table.status),
    stripeSubscriptionIdIdx: index("org_subscriptions_stripe_id_idx").on(
      table.stripeSubscriptionId
    ),
  })
);

// ============================================================================
// PHASE 4: DUNNING & REVENUE RECOVERY
// ============================================================================

export const dunningAttempts = pgTable(
  "dunning_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subscriptionId: uuid("subscription_id").references(() => subscriptions.id, {
      onDelete: "cascade",
    }),
    orgSubscriptionId: uuid("org_subscription_id").references(
      () => organizationSubscriptions.id,
      { onDelete: "cascade" }
    ),
    step: integer("step").notNull(), // 1: reminder, 2: warning, 3: restriction, 4: downgrade
    status: varchar("status", { length: 50 }).notNull(), // pending, sent, completed, failed
    sentAt: timestamp("sent_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    errorMessage: varchar("error_message", { length: 500 }),
    triggeredByInvoiceId: varchar("triggered_by_invoice_id", { length: 255 }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    subscriptionIdIdx: index("dunning_attempts_subscription_id_idx").on(table.subscriptionId),
    orgSubscriptionIdIdx: index("dunning_attempts_org_subscription_id_idx").on(
      table.orgSubscriptionId
    ),
    stepIdx: index("dunning_attempts_step_idx").on(table.step),
    statusIdx: index("dunning_attempts_status_idx").on(table.status),
    createdAtIdx: index("dunning_attempts_created_at_idx").on(table.createdAt),
  })
);

// ============================================================================
// PHASE 4: MONETIZATION LAYER (API KEYS & DEVELOPER BILLING)
// ============================================================================

export const developerAccounts = pgTable(
  "developer_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    status: varchar("status", { length: 50 }).notNull().default("active"), // active, suspended, cancelled
    billingPlan: varchar("billing_plan", { length: 50 }).notNull().default("free"), // free, pro, enterprise
    monthlyQuota: integer("monthly_quota").default(1000),
    currentMonthUsage: integer("current_month_usage").default(0),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    emailIdx: index("developer_accounts_email_idx").on(table.email),
    statusIdx: index("developer_accounts_status_idx").on(table.status),
    stripeCustomerIdIdx: index("developer_accounts_stripe_customer_id_idx").on(
      table.stripeCustomerId
    ),
  })
);

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    developerAccountId: uuid("developer_account_id")
      .notNull()
      .references(() => developerAccounts.id, { onDelete: "cascade" }),
    keyHash: varchar("key_hash", { length: 255 }).notNull().unique(),
    keyPrefix: varchar("key_prefix", { length: 20 }).notNull(), // First 8 chars for identification
    name: varchar("name", { length: 255 }),
    status: varchar("status", { length: 50 }).notNull().default("active"), // active, revoked
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    rateLimitPerMinute: integer("rate_limit_per_minute").default(60),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    developerAccountIdIdx: index("api_keys_developer_account_id_idx").on(
      table.developerAccountId
    ),
    keyHashIdx: index("api_keys_key_hash_idx").on(table.keyHash),
    statusIdx: index("api_keys_status_idx").on(table.status),
    prefixIdx: index("api_keys_prefix_idx").on(table.keyPrefix),
  })
);

export const apiKeyUsage = pgTable(
  "api_key_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    apiKeyId: uuid("api_key_id")
      .notNull()
      .references(() => apiKeys.id, { onDelete: "cascade" }),
    developerAccountId: uuid("developer_account_id")
      .notNull()
      .references(() => developerAccounts.id, { onDelete: "cascade" }),
    endpoint: varchar("endpoint", { length: 100 }).notNull(),
    method: varchar("method", { length: 10 }).notNull(),
    statusCode: integer("status_code"),
    responseTimeMs: integer("response_time_ms"),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    apiKeyIdIdx: index("api_key_usage_api_key_id_idx").on(table.apiKeyId),
    developerAccountIdIdx: index("api_key_usage_developer_account_id_idx").on(
      table.developerAccountId
    ),
    timestampIdx: index("api_key_usage_timestamp_idx").on(table.timestamp),
    endpointIdx: index("api_key_usage_endpoint_idx").on(table.endpoint),
  })
);

// ============================================================================
// PHASE 4: WEBHOOK QUEUE FALLBACK & DATA INTEGRITY
// ============================================================================

export const webhookQueue = pgTable(
  "webhook_queue",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stripeEventId: varchar("stripe_event_id", { length: 255 }).notNull().unique(),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    payload: jsonb("payload").notNull(),
    status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, processing, completed, failed, dead_letter
    attempts: integer("attempts").default(0).notNull(),
    maxAttempts: integer("max_attempts").default(5).notNull(),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }),
    lastError: varchar("last_error", { length: 1000 }),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    deadLetterAt: timestamp("dead_letter_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    stripeEventIdIdx: index("webhook_queue_stripe_event_id_idx").on(table.stripeEventId),
    statusIdx: index("webhook_queue_status_idx").on(table.status),
    nextAttemptAtIdx: index("webhook_queue_next_attempt_at_idx").on(table.nextAttemptAt),
    statusAttemptsIdx: index("webhook_queue_status_attempts_idx").on(
      table.status,
      table.attempts
    ),
  })
);

// ============================================================================
// PHASE 6B: TELEMETRY & FUNNEL TRACKING
// ============================================================================

export const telemetryEvents = pgTable(
  "telemetry_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    machineId: varchar("machine_id", { length: 32 }), // Hashed, no PII
    sessionId: varchar("session_id", { length: 32 }),
    source: varchar("source", { length: 20 }).notNull().default("cli"), // cli, sdk
    metadata: jsonb("metadata").default({}),
    cliVersion: varchar("cli_version", { length: 20 }),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    eventTypeIdx: index("telemetry_events_type_idx").on(table.eventType),
    machineIdIdx: index("telemetry_events_machine_id_idx").on(table.machineId),
    timestampIdx: index("telemetry_events_timestamp_idx").on(table.timestamp),
    sourceIdx: index("telemetry_events_source_idx").on(table.source),
  })
);

export const funnelMetrics = pgTable(
  "funnel_metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stage: varchar("stage", { length: 50 }).notNull(), // cli_install, init_started, etc.
    machineId: varchar("machine_id", { length: 32 }).notNull(),
    converted: boolean("converted").default(true).notNull(),
    metadata: jsonb("metadata").default({}),
    date: timestamp("date", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    stageIdx: index("funnel_metrics_stage_idx").on(table.stage),
    machineIdIdx: index("funnel_metrics_machine_id_idx").on(table.machineId),
    dateIdx: index("funnel_metrics_date_idx").on(table.date),
    stageDateIdx: index("funnel_metrics_stage_date_idx").on(table.stage, table.date),
  })
);

// ============================================================================
// PHASE 7: FEEDBACK COLLECTION
// ============================================================================

export const feedbackEvents = pgTable(
  "feedback_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventType: varchar("event_type", { length: 50 }).notNull(), // init_feedback, doctor_usage, etc.
    machineId: varchar("machine_id", { length: 32 }), // Hashed, no PII
    source: varchar("source", { length: 20 }).notNull().default("cli"), // cli, web
    rating: varchar("rating", { length: 10 }), // positive, negative, neutral
    feedback: varchar("feedback", { length: 2000 }), // Free text feedback
    metadata: jsonb("metadata").default({}),
    cliVersion: varchar("cli_version", { length: 20 }),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    eventTypeIdx: index("feedback_events_type_idx").on(table.eventType),
    machineIdIdx: index("feedback_events_machine_id_idx").on(table.machineId),
    timestampIdx: index("feedback_events_timestamp_idx").on(table.timestamp),
    sourceIdx: index("feedback_events_source_idx").on(table.source),
  })
);

// ============================================================================
// PHASE 4: ENTITLEMENTS CACHE
// ============================================================================

export const entitlementsCache = pgTable(
  "entitlements_cache",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    entitlements: jsonb("entitlements").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    version: integer("version").default(1).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("entitlements_cache_user_id_idx").on(table.userId),
    organizationIdIdx: index("entitlements_cache_org_id_idx").on(table.organizationId),
    expiresAtIdx: index("entitlements_cache_expires_at_idx").on(table.expiresAt),
  })
);

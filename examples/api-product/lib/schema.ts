/**
 * Database schema for API Product example
 * Simplified version for demo purposes
 */

import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

export const developerAccounts = pgTable("developer_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  billingPlan: varchar("billing_plan", { length: 50 }).notNull().default("free"),
  monthlyQuota: integer("monthly_quota").default(1000),
  currentMonthUsage: integer("current_month_usage").default(0),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  developerAccountId: uuid("developer_account_id")
    .notNull()
    .references(() => developerAccounts.id, { onDelete: "cascade" }),
  keyHash: varchar("key_hash", { length: 255 }).notNull().unique(),
  keyPrefix: varchar("key_prefix", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  lastUsedAt: timestamp("last_used_at"),
  rateLimitPerMinute: integer("rate_limit_per_minute").default(60),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const apiKeyUsage = pgTable("api_key_usage", {
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
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

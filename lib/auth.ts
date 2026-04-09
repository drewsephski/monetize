import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { bearer } from "better-auth/plugins";
import { db } from "./db";
import { users, sessions, accounts, verifications, customers } from "@/drizzle/schema";
import { env } from "./env";
import { logger } from "./logger";
import { getStripe } from "./billing/stripe";

export const auth = betterAuth({
  baseURL: env.betterAuthUrl,
  secret: env.betterAuthSecret,
  trustedOrigins: [
    env.betterAuthUrl,
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "https://monetize-two.vercel.app",
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  plugins: [bearer()],
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  user: {
    additionalFields: {
      stripeCustomerId: {
        type: "string",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false, // Allow immediate signin after signup
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    // Using cookie-only sessions to avoid database session storage issues
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const userLogger = logger.child({ userId: user.id, email: user.email });
          userLogger.info("User signed up, creating Stripe customer...");
          
          try {
            // Check if customer already exists (idempotency)
            const existingCustomer = await db.query.customers.findFirst({
              where: (c, { eq }) => eq(c.userId, user.id),
            });

            if (existingCustomer) {
              userLogger.info({ stripeCustomerId: existingCustomer.stripeCustomerId }, "Customer already exists");
              return;
            }

            // Create Stripe customer with idempotency key
            const stripeCustomer = await getStripe().customers.create(
              {
                email: user.email,
                name: user.name || undefined,
                metadata: {
                  userId: user.id,
                },
              },
              {
                idempotencyKey: `customer-create-${user.id}`,
              }
            );

            // Create customer record in database with conflict handling
            const [insertedCustomer] = await db.insert(customers)
              .values({
                userId: user.id,
                stripeCustomerId: stripeCustomer.id,
              })
              .onConflictDoNothing({ target: customers.stripeCustomerId })
              .returning();

            if (insertedCustomer) {
              userLogger.info({ stripeCustomerId: stripeCustomer.id, customerId: insertedCustomer.id }, "Stripe customer created");
            } else {
              userLogger.info({ stripeCustomerId: stripeCustomer.id }, "Customer already exists, using existing record");
            }
          } catch (error) {
            userLogger.error({ error }, "Failed to create Stripe customer");
            // Don't throw - we don't want to fail signup if Stripe is down
            // The customer can be created lazily on first checkout
          }
        },
      },
    },
  },
});

export type Auth = typeof auth;

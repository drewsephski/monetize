import Stripe from "stripe";
import { env } from "@/lib/env";

// Singleton Stripe client
export const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
});

import { Coins, CreditCard, Lock, Sparkles } from "lucide-react";
import type { SiteConfig } from "@/components/example-kit";

export const siteConfig: SiteConfig = {
  name: "AI Credits",
  eyebrow: "AI credits product",
  description: "An AI credits example with prepaid usage, plan messaging, top-up flow, and a sandbox-friendly onboarding loop.",
  docsUrl: "https://billing.drew.dev/docs",
  githubUrl: "https://github.com/drewsephski/monetize",
  examplesUrl: "https://github.com/drewsephski/monetize/tree/main/examples/ai-credits",
  routes: [
    {
      href: "/",
      label: "Overview",
      description: "Explain the credits model, routes, and recommended first-run path.",
      nav: true,
    },
    {
      href: "/pricing",
      label: "Pricing",
      description: "Compare monthly plans and credit bundles, then test checkout.",
      nav: true,
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      description: "Review remaining credits, status, and next actions.",
      nav: true,
    },
    {
      href: "/usage",
      label: "Usage",
      description: "Spend credits, hit the low-balance state, and test top-ups.",
    },
  ],
};

export const featureItems = [
  {
    title: "Subscriptions",
    description: "Monthly plans give the app a clear recurring billing lane for teams.",
    icon: CreditCard,
    tag: "plans",
  },
  {
    title: "Usage billing",
    description: "Every generation spends credits, so usage is visible as a product event instead of an abstract counter.",
    icon: Coins,
    tag: "credits",
  },
  {
    title: "Entitlements",
    description: "Plan tiers change refill pace, prompt depth, and workflow access in concrete terms.",
    icon: Lock,
    tag: "gating",
  },
  {
    title: "Sandbox mode",
    description: "Top-ups can be exercised locally without leaving the product or wiring Stripe first.",
    icon: Sparkles,
    tag: "local-first",
  },
];

export const flowSteps = [
  {
    title: "Choose a credit plan",
    description: "Pricing explains the recurring plan and what that means for baseline monthly credits.",
  },
  {
    title: "Spend credits on usage",
    description: "Usage page consumes credits visibly so the low-balance and empty states can be evaluated quickly.",
  },
  {
    title: "Top up without friction",
    description: "Sandbox checkout moves the developer back into the dashboard with more credits and a changed state.",
  },
];

export const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    cadence: "For evaluation",
    summary: "A small starter pool for validating prompts, paywalls, and empty-state copy.",
    cta: "Start free workspace",
    mostPopular: false,
    highlights: ["25 credits", "Basic generations", "Starter entitlements", "Community support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    cadence: "Per month",
    summary: "The main lane for teams shipping AI features with predictable credit usage.",
    cta: "Start Pro checkout",
    mostPopular: true,
    highlights: ["500 monthly credits", "Priority prompts", "Usage dashboard", "Top-up support"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$99",
    cadence: "Per month",
    summary: "For heavier generation workloads and more aggressive top-up behavior.",
    cta: "Test Enterprise checkout",
    mostPopular: false,
    highlights: ["2,000 monthly credits", "Advanced workflows", "Larger bursts", "Priority support"],
  },
];

export const comparisonRows = [
  ["Monthly included credits", "25", "500", "2,000"],
  ["Generation depth", "Basic", "Extended", "Advanced"],
  ["Top-up support", "Manual", "Fast", "Priority"],
  ["Workspace access", "Solo", "Team", "Scaled team"],
];

// Map plan IDs to Stripe price IDs from environment variables
export const priceIdMap: Record<string, string> = {
  starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || "",
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "",
  enterprise: process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || "",
};

export const topUpPacks = [
  { id: "pack-100", label: "100 credits", price: "$10", credits: 100 },
  { id: "pack-500", label: "500 credits", price: "$40", credits: 500 },
  { id: "pack-2000", label: "2,000 credits", price: "$120", credits: 2000 },
];

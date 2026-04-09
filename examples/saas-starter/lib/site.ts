import { CreditCard, Lock, Rocket, Shield } from "lucide-react";
import type { SiteConfig } from "@/components/example-kit";

export const siteConfig: SiteConfig = {
  name: "SaaS Starter",
  eyebrow: "Subscription product",
  description: "A polished SaaS billing starter with subscription plans, entitlements, and a zero-friction sandbox flow.",
  docsUrl: "https://billing.drew.dev/docs",
  githubUrl: "https://github.com/drewsephski/monetize",
  examplesUrl: "https://github.com/drewsephski/monetize/tree/main/examples/saas-starter",
  routes: [
    {
      href: "/",
      label: "Overview",
      description: "See the product story, billing flow, and major routes.",
      nav: true,
    },
    {
      href: "/pricing",
      label: "Pricing",
      description: "Compare plans, test checkout, and inspect upgrade paths.",
      nav: true,
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      description: "Review subscription state, usage, and next actions.",
      nav: true,
    },
  ],
};

export const featureItems = [
  {
    title: "Subscriptions",
    description: "Three clean plan tiers with a most-popular treatment and fast checkout path.",
    icon: CreditCard,
    tag: "core",
  },
  {
    title: "Entitlements",
    description: "Feature access is explained in product language so developers immediately see what each plan unlocks.",
    icon: Lock,
    tag: "gating",
  },
  {
    title: "Sandbox mode",
    description: "Checkout stays explorable locally, without hidden setup steps or dead-end redirects.",
    icon: Shield,
    tag: "local-first",
  },
  {
    title: "Launch-ready shell",
    description: "Overview, pricing, and dashboard stay coherent enough to feel like a real developer product, not a scaffold page.",
    icon: Rocket,
    tag: "premium",
  },
];

export const flowSteps = [
  {
    title: "Start from pricing",
    description: "Pick a plan, inspect the included entitlements, and trigger a checkout flow from a page that looks ready to ship.",
  },
  {
    title: "Complete sandbox checkout",
    description: "Local mode redirects into the dashboard so you can validate the paid state without leaving the app.",
  },
  {
    title: "Inspect the account state",
    description: "Dashboard cards, usage bars, and action buttons explain what the subscription unlocked and what to do next.",
  },
];

export const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    priceId: "free",
    cadence: "For early validation",
    summary: "Build the first customer-facing billing path without adding operational weight.",
    cta: "Start with Starter",
    mostPopular: false,
    highlights: ["1 seat", "Basic billing history", "Starter entitlements", "Community support"],
  },
  {
    id: "growth",
    name: "Growth",
    price: "$24",
    priceId: "price_placeholder_pro",
    cadence: "Per month",
    summary: "The default paid lane for teams that need clear subscriptions and upgrade controls.",
    cta: "Start Growth checkout",
    mostPopular: true,
    highlights: ["5 seats", "Priority support", "Advanced entitlements", "Customer portal access"],
  },
  {
    id: "scale",
    name: "Scale",
    price: "$79",
    priceId: "price_placeholder_enterprise",
    cadence: "Per month",
    summary: "For higher-touch accounts that need expanded limits and guided onboarding.",
    cta: "Test Scale checkout",
    mostPopular: false,
    highlights: ["Unlimited seats", "Dedicated onboarding", "Custom billing terms", "Premium entitlements"],
  },
];

export const comparisonRows = [
  ["Seats included", "1", "5", "Unlimited"],
  ["Feature entitlements", "Starter", "Advanced", "Custom"],
  ["Billing controls", "Basic", "Portal + invoices", "Portal + contracts"],
  ["Support lane", "Community", "Priority", "Dedicated"],
];

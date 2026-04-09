import { Activity, CreditCard, KeyRound, Shield, Sparkles } from "lucide-react";
import type { SiteConfig } from "@/components/example-kit";

export const siteConfig: SiteConfig = {
  name: "API Product",
  eyebrow: "Usage-based API",
  description: "An API billing example with sandbox-friendly checkout, API key creation, protected endpoints, and usage reporting.",
  docsUrl: "/docs",
  githubUrl: "https://github.com/drewsephski/monetize",
  examplesUrl: "https://github.com/drewsephski/monetize/tree/main/examples/api-product",
  routes: [
    {
      href: "/",
      label: "Overview",
      description: "Explain the API billing model, routes, and first-run flow.",
      nav: true,
    },
    {
      href: "/pricing",
      label: "Pricing",
      description: "Pick a plan and test checkout into the product workspace.",
      nav: true,
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      description: "Review quota, request status, and the recommended next steps.",
      nav: true,
    },
    {
      href: "/api-keys",
      label: "API Keys",
      description: "Create a sample key, copy a curl command, and learn the auth pattern.",
    },
    {
      href: "/usage",
      label: "Usage",
      description: "Inspect per-endpoint usage and rate-limit messaging.",
    },
  ],
};

export const featureItems = [
  {
    title: "Subscriptions",
    description: "Tiered plans change quotas and rate limits without hiding the API billing story.",
    icon: CreditCard,
    tag: "plans",
  },
  {
    title: "Usage billing",
    description: "Protected routes report current usage and remaining capacity in a developer-readable way.",
    icon: Activity,
    tag: "metered",
  },
  {
    title: "Entitlements",
    description: "Plan tiers map to concrete API behaviors like throughput and key capacity.",
    icon: Shield,
    tag: "limits",
  },
  {
    title: "Sandbox mode",
    description: "Generated keys and checkout flows stay local so the app works before production plumbing exists.",
    icon: Sparkles,
    tag: "local-first",
  },
];

export const flowSteps = [
  {
    title: "Choose a plan",
    description: "Pricing tells the developer how quotas and request rates change as the product moves up-market.",
  },
  {
    title: "Create a sandbox key",
    description: "API key flow teaches the header contract and gives a real request to copy immediately.",
  },
  {
    title: "Inspect live usage",
    description: "Usage route shows how billing-adjacent telemetry appears after authenticated requests land.",
  },
];

export const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "For exploration",
    summary: "Inspect the product and protected routes with a low, explicit limit.",
    cta: "Start Free workspace",
    mostPopular: false,
    highlights: ["100 calls / month", "10 req / min", "1 API key", "Community support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    cadence: "Per month",
    summary: "The default paid lane for teams shipping against the API.",
    cta: "Start Pro checkout",
    mostPopular: true,
    highlights: ["10,000 calls / month", "100 req / min", "5 API keys", "Usage analytics"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$99",
    cadence: "Per month",
    summary: "For higher-volume products that need more throughput and support.",
    cta: "Test Enterprise checkout",
    mostPopular: false,
    highlights: ["100,000 calls / month", "1,000 req / min", "Unlimited keys", "Priority support"],
  },
];

export const comparisonRows = [
  ["Monthly included calls", "100", "10,000", "100,000"],
  ["Rate limit", "10/min", "100/min", "1,000/min"],
  ["API key count", "1", "5", "Unlimited"],
  ["Usage analytics", "Basic", "Detailed", "Detailed + support"],
];

export function createSandboxKey(plan: string) {
  const suffix = Math.random().toString(36).slice(2, 10);
  return `sandbox_key_${plan}_${suffix}`;
}

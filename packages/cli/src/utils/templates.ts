import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { addCommand } from "../commands/add.js";

/**
 * Robustly write a file with logging and error handling
 */
async function writeTemplateFile(
  filePath: string,
  content: string,
  description: string
): Promise<void> {
  try {
    // Ensure parent directory exists
    await fs.ensureDir(path.dirname(filePath));

    // Write file
    await fs.writeFile(filePath, content, "utf-8");

    // Verify file was written
    const exists = await fs.pathExists(filePath);
    if (!exists) {
      throw new Error(`Verification failed: ${filePath} was not created`);
    }

    const stats = await fs.stat(filePath);
    console.log(chalk.gray(`  ✓ ${description} (${stats.size} bytes)`));
  } catch (error) {
    console.error(chalk.red(`  ✗ Failed to write ${description}:`));
    console.error(chalk.red(`    ${filePath}`));
    if (error instanceof Error) {
      console.error(chalk.red(`    ${error.message}`));
    }
    throw error;
  }
}

export async function installTemplates(
  templateType: string,
  products: Array<{ id: string; name: string; priceId: string }>,
  projectCwd?: string
): Promise<void> {
  const cwd = projectCwd || process.cwd();

  switch (templateType) {
    case "saas":
      await installSaasTemplate(cwd, products);
      break;
    case "api":
      await installApiTemplate(cwd, products);
      break;
    case "usage":
      await installUsageTemplate(cwd, products);
      break;
    case "minimal":
      // Just SDK, no pages
      break;
    default:
      throw new Error(`Unknown template: ${templateType}`);
  }
}

async function installSaasTemplate(
  cwd: string,
  products: Array<{ id: string; name: string; priceId: string }>
): Promise<void> {
  console.log(chalk.blue("\n📄 Creating SaaS template pages..."));

  // First, install all billing components
  await addCommand("all", { path: "components/billing", cwd });

  // Get price IDs for plans
  const proProduct = products.find(p => p.name === "Pro");
  const enterpriseProduct = products.find(p => p.name === "Enterprise");

  const proPriceId = proProduct?.priceId || "price_placeholder_pro";
  const enterprisePriceId = enterpriseProduct?.priceId || "price_placeholder_enterprise";

  // Create enhanced main page with setup guide
  const mainPage = `"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  CreditCard, 
  Settings, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle,
  Terminal,
  Database,
  Webhook,
  Sparkles,
  LayoutGrid,
  FileCode,
  ExternalLink
} from "lucide-react";

const steps = [
  {
    id: "env",
    title: "Configure Environment",
    description: "Add your Stripe keys to .env.local",
    icon: Settings,
    check: () => typeof process !== 'undefined' && !!process.env.STRIPE_SECRET_KEY,
    action: {
      label: "View .env.example",
      href: "/api/env-help",
    }
  },
  {
    id: "webhook",
    title: "Start Webhook Listener",
    description: "Run the Stripe CLI to receive webhooks locally",
    icon: Webhook,
    check: () => false,
    action: {
      label: "Copy Command",
      command: "stripe listen --forward-to localhost:3000/api/stripe/webhook",
    }
  },
  {
    id: "database",
    title: "Setup Database",
    description: "Run migrations to create the billing tables",
    icon: Database,
    check: () => false,
    action: {
      label: "Run Migration",
      command: "npx drizzle-kit push",
    }
  },
  {
    id: "stripe",
    title: "Configure Stripe",
    description: "Create products and set up your Stripe dashboard",
    icon: CreditCard,
    check: () => false,
    action: {
      label: "Open Stripe Dashboard",
      href: "https://dashboard.stripe.com",
      external: true,
    }
  },
];

const pages = [
  {
    title: "Pricing Page",
    description: "Showcase your subscription plans with a beautiful, conversion-optimized design",
    href: "/pricing",
    icon: CreditCard,
    color: "bg-[#b8860b]/10 text-[#b8860b]",
  },
  {
    title: "Billing Dashboard",
    description: "Let customers manage their subscription, payment methods, and billing history",
    href: "/billing",
    icon: Settings,
    color: "bg-[#1c1917]/10 text-[#1c1917]",
  },
  {
    title: "Usage Demo",
    description: "Interactive demo showing usage tracking and upgrade flows in action",
    href: "/demo",
    icon: Zap,
    color: "bg-[#22c55e]/10 text-[#15803d]",
  },
];

export default function HomePage() {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(text);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  return (
    <main className="min-h-screen bg-[#fafaf9]">
      {/* Header */}
      <header className="border-b border-[#e7e5e4] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1c1917]">
                <Sparkles className="h-4 w-4 text-[#b8860b]" />
              </div>
              <span className="font-semibold text-[#1c1917]">@drew/billing</span>
            </div>
            <a 
              href="https://github.com/drewsephski/monetize"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#78716c] hover:text-[#1c1917] transition-colors"
            >
              <FileCode className="h-4 w-4" />
              Documentation
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#22c55e]/10 px-3 py-1 text-xs font-medium text-[#15803d] mb-4">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Setup Complete
          </div>
          <h1 className="text-3xl font-bold text-[#1c1917] tracking-tight mb-3">
            Welcome to your billing system
          </h1>
          <p className="text-lg text-[#78716c] max-w-2xl">
            Your Next.js app now has a complete Stripe integration. Follow the steps below to finish the configuration and start accepting payments.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Setup Steps */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-semibold text-[#1c1917] flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#b8860b]" />
              Setup Checklist
            </h2>
            
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isComplete = step.check();
                
                return (
                  <div 
                    key={step.id}
                    className={\`
                      relative rounded-2xl border p-5 transition-all duration-200
                      \${isComplete 
                        ? "border-[#22c55e]/30 bg-[#22c55e]/5" 
                        : "border-[#e7e5e4] bg-white hover:border-[#b8860b]/30"
                      }
                    \`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={\`
                        flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                        \${isComplete ? "bg-[#22c55e]/20" : "bg-[#fafaf9] border border-[#e7e5e4]"}
                      \`}>
                        {isComplete ? (
                          <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />
                        ) : (
                          <Icon className="h-5 w-5 text-[#a8a29e]" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={\`font-medium \${isComplete ? "text-[#15803d]" : "text-[#1c1917]"}\`}>
                            {step.title}
                          </h3>
                          <span className="text-xs text-[#a8a29e]">Step {index + 1}</span>
                        </div>
                        <p className="text-sm text-[#78716c] mb-3">
                          {step.description}
                        </p>
                        
                        {step.action.command ? (
                          <button
                            onClick={() => copyToClipboard(step.action.command!)}
                            className="inline-flex items-center gap-2 rounded-lg border border-[#e7e5e4] bg-[#fafaf9] px-3 py-2 text-sm font-mono text-[#57534e] hover:border-[#b8860b]/50 hover:bg-[#fafaf9] transition-all"
                          >
                            <Terminal className="h-3.5 w-3.5 text-[#a8a29e]" />
                            <span className="truncate max-w-[200px]">{step.action.command}</span>
                            {copiedCommand === step.action.command ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e]" />
                            ) : (
                              <span className="text-xs text-[#a8a29e]">Click to copy</span>
                            )}
                          </button>
                        ) : (
                          <a
                            href={step.action.href}
                            target={step.action.external ? "_blank" : undefined}
                            rel={step.action.external ? "noopener noreferrer" : undefined}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#1c1917] px-4 py-2 text-sm font-medium text-white hover:bg-[#292524] transition-colors"
                          >
                            {step.action.label}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Help Box */}
            <div className="rounded-2xl border border-[#e7e5e4] bg-white p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3b82f6]/10">
                  <AlertCircle className="h-5 w-5 text-[#3b82f6]" />
                </div>
                <div>
                  <h3 className="font-medium text-[#1c1917] mb-1">Need help?</h3>
                  <p className="text-sm text-[#78716c] mb-3">
                    Run the diagnostic command to check your setup and get personalized guidance.
                  </p>
                  <button
                    onClick={() => copyToClipboard("npx drew-billing-cli doctor")}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#e7e5e4] bg-[#fafaf9] px-3 py-2 text-sm font-mono text-[#57534e] hover:border-[#b8860b]/50 transition-all"
                  >
                    <Terminal className="h-3.5 w-3.5 text-[#a8a29e]" />
                    npx drew-billing-cli doctor
                    {copiedCommand === "npx drew-billing-cli doctor" && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e] ml-2" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pages Navigation */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#1c1917] flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-[#b8860b]" />
              Your Pages
            </h2>
            
            <div className="space-y-3">
              {pages.map((page) => {
                const Icon = page.icon;
                return (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="group block rounded-2xl border border-[#e7e5e4] bg-white p-5 transition-all duration-200 hover:border-[#b8860b]/30 hover:shadow-lg hover:shadow-[#b8860b]/5"
                  >
                    <div className="flex items-start gap-4">
                      <div className={\`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl \${page.color}\`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-[#1c1917]">{page.title}</h3>
                          <ArrowRight className="h-3.5 w-3.5 text-[#a8a29e] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </div>
                        <p className="text-sm text-[#78716c] leading-relaxed">
                          {page.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Quick Stats */}
            <div className="rounded-2xl border border-[#e7e5e4] bg-[#fafaf9] p-5">
              <h3 className="text-sm font-medium text-[#1c1917] mb-4">Template Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#78716c]">Components</span>
                  <span className="font-medium text-[#1c1917]">6 pre-built</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#78716c]">Pages</span>
                  <span className="font-medium text-[#1c1917]">3 created</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#78716c]">API Routes</span>
                  <span className="font-medium text-[#1c1917]">2 ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
`;

  await writeTemplateFile(
    path.join(cwd, "app/page.tsx"),
    mainPage,
    "Main landing page with setup guide"
  );

  // Create enhanced pricing page
  const pricingPage = `"use client";

import { PricingTable } from "@/components/billing";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for getting started",
    price: 0,
    priceLabel: "Free",
    currency: "usd",
    interval: "month" as const,
    features: ["1,000 API calls/mo", "1 project", "Community support", "Basic analytics"],
    cta: "Get Started",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing businesses",
    price: 2900,
    currency: "usd",
    interval: "month" as const,
    features: [
      "10,000 API calls/mo",
      "Unlimited projects",
      "Priority support",
      "Advanced analytics",
      "Custom domains",
    ],
    cta: "Upgrade to Pro",
    popular: true,
    priceId: "${proPriceId}",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations",
    price: 9900,
    currency: "usd",
    interval: "month" as const,
    features: [
      "Unlimited API calls",
      "Custom integrations",
      "SLA guarantee",
      "Dedicated support",
      "SSO & advanced security",
    ],
    cta: "Contact Sales",
    popular: false,
    priceId: "${enterprisePriceId}",
  },
];

export default function PricingPage() {
  const [userId] = useState("user_" + Math.random().toString(36).slice(2));
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (planId: string, priceId?: string) => {
    if (!priceId) {
      // Free plan - no checkout needed
      console.log("Selected free plan:", planId);
      return;
    }
    
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <main className="min-h-screen bg-[#fafaf9]">
      {/* Header */}
      <header className="border-b border-[#e7e5e4] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-sm text-[#78716c] hover:text-[#1c1917] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#b8860b]/10 px-3 py-1 text-xs font-medium text-[#b8860b] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl font-bold text-[#1c1917] tracking-tight mb-4">
            Choose your plan
          </h1>
          <p className="text-lg text-[#78716c] max-w-2xl mx-auto">
            Start free and scale as you grow. All plans include core features with no hidden fees.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/5 p-4 text-[#dc2626]">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        
        {/* Pricing Table */}
        <PricingTable
          plans={plans}
          userId={userId}
          onSubscribe={handleSubscribe}
        />

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <p className="text-sm text-[#a8a29e]">
            Secure payment processing by Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </main>
  );
}
`;

  await writeTemplateFile(
    path.join(cwd, "app/pricing/page.tsx"),
    pricingPage,
    "Pricing page"
  );

  // Create enhanced billing settings page
  const billingPage = `"use client";

import { BillingPortalButton, CurrentPlanBadge, UsageMeter } from "@/components/billing";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Receipt, BarChart3 } from "lucide-react";

export default function BillingPage() {
  const [userId] = useState("user_" + Math.random().toString(36).slice(2));

  const handleOpenPortal = async (userId: string, returnUrl?: string) => {
    const response = await fetch("/api/billing/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, returnUrl }),
    });

    if (!response.ok) {
      throw new Error("Failed to create portal session");
    }

    const { url } = await response.json();
    return url;
  };

  return (
    <main className="min-h-screen bg-[#fafaf9]">
      {/* Header */}
      <header className="border-b border-[#e7e5e4] bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-sm text-[#78716c] hover:text-[#1c1917] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1c1917] tracking-tight mb-2">
            Billing & Subscription
          </h1>
          <p className="text-[#78716c]">
            Manage your plan, payment methods, and billing history
          </p>
        </div>
        
        <div className="grid gap-6">
          {/* Current Plan */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#b8860b]/10">
                <CreditCard className="h-4 w-4 text-[#b8860b]" />
              </div>
              <h2 className="font-semibold text-[#1c1917]">Current Plan</h2>
            </div>
            <CurrentPlanBadge 
              plan="free"
              status="active"
              features={["1,000 API calls/mo", "1 project", "Community support", "Basic analytics"]}
            />
          </section>

          {/* Usage */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22c55e]/10">
                <BarChart3 className="h-4 w-4 text-[#15803d]" />
              </div>
              <h2 className="font-semibold text-[#1c1917]">Usage This Month</h2>
            </div>
            <UsageMeter 
              userId={userId}
              feature="api_calls"
              limit={1000}
              current={245}
              label="API Calls"
            />
          </section>

          {/* Payment Method */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1c1917]/10">
                <Receipt className="h-4 w-4 text-[#1c1917]" />
              </div>
              <h2 className="font-semibold text-[#1c1917]">Billing Portal</h2>
            </div>
            <div className="rounded-2xl border border-[#e7e5e4] bg-white p-6">
              <p className="text-sm text-[#78716c] mb-4">
                Manage your payment methods, view invoices, and update billing information through Stripe&apos;s secure customer portal.
              </p>
              <BillingPortalButton 
                userId={userId}
                onOpenPortal={handleOpenPortal}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
`;

  await writeTemplateFile(
    path.join(cwd, "app/billing/page.tsx"),
    billingPage,
    "Billing dashboard page"
  );

  // Create enhanced demo page
  const demoPage = `"use client";

import { useState } from "react";
import { UsageMeter, UpgradeButton, CurrentPlanBadge, TrialBanner, SubscriptionGate } from "@/components/billing";
import Link from "next/link";
import { ArrowLeft, Play, Sparkles, Lock, TrendingUp } from "lucide-react";

export default function DemoPage() {
  const [userId] = useState("demo-user-" + Math.random().toString(36).slice(2));
  const [apiCalls, setApiCalls] = useState(750);
  const [hasSubscription, setHasSubscription] = useState(false);

  const handleUpgrade = async (targetPlan: string) => {
    console.log("Upgrading to", targetPlan);
    // Simulate upgrade
    setTimeout(() => setHasSubscription(true), 1000);
  };

  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 5);

  return (
    <main className="min-h-screen bg-[#fafaf9]">
      {/* Header */}
      <header className="border-b border-[#e7e5e4] bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-sm text-[#78716c] hover:text-[#1c1917] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#3b82f6]/10 px-3 py-1 text-xs font-medium text-[#2563eb] mb-4">
            <Play className="h-3.5 w-3.5" />
            Interactive Demo
          </div>
          <h1 className="text-3xl font-bold text-[#1c1917] tracking-tight mb-2">
            Billing Components Playground
          </h1>
          <p className="text-[#78716c]">
            Explore all the billing components and see how they work together
          </p>
        </div>
        
        <div className="grid gap-6">
          {/* Trial Banner Demo */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f59e0b]/10">
                <Sparkles className="h-4 w-4 text-[#d97706]" />
              </div>
              <h2 className="font-semibold text-[#1c1917]">Trial Banner</h2>
            </div>
            <TrialBanner 
              trialEndsAt={trialEndDate.toISOString()}
              onUpgrade={() => console.log("Upgrade clicked")}
              onDismiss={() => console.log("Dismissed")}
            />
          </section>

          {/* Usage Meter Demo */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22c55e]/10">
                <TrendingUp className="h-4 w-4 text-[#15803d]" />
              </div>
              <h2 className="font-semibold text-[#1c1917]">Usage Meter (Interactive)</h2>
            </div>
            <UsageMeter 
              userId={userId} 
              feature="api_calls" 
              limit={1000}
              current={apiCalls}
              label="API Calls this month"
            />
            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => setApiCalls(c => Math.min(c + 50, 1000))}
                className="inline-flex items-center gap-2 rounded-lg border border-[#e7e5e4] bg-white px-4 py-2 text-sm font-medium text-[#57534e] hover:border-[#b8860b]/50 hover:bg-[#fafaf9] transition-all"
              >
                +50 calls
              </button>
              <button 
                onClick={() => setApiCalls(c => Math.max(c - 50, 0))}
                className="inline-flex items-center gap-2 rounded-lg border border-[#e7e5e4] bg-white px-4 py-2 text-sm font-medium text-[#57534e] hover:border-[#b8860b]/50 hover:bg-[#fafaf9] transition-all"
              >
                -50 calls
              </button>
              <button 
                onClick={() => setApiCalls(950)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#e7e5e4] bg-white px-4 py-2 text-sm font-medium text-[#57534e] hover:border-[#f59e0b]/50 hover:bg-[#f59e0b]/5 transition-all"
              >
                Near limit (95%)
              </button>
            </div>
          </section>

          {/* Current Plan & Upgrade */}
          <div className="grid gap-6 md:grid-cols-2">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#b8860b]/10">
                  <Sparkles className="h-4 w-4 text-[#b8860b]" />
                </div>
                <h2 className="font-semibold text-[#1c1917]">Current Plan</h2>
              </div>
              <CurrentPlanBadge 
                plan={hasSubscription ? "pro" : "free"}
                status="active"
                features={[
                  "1,000 API calls/mo", 
                  "1 project", 
                  "Community support",
                  hasSubscription && "Priority support",
                  hasSubscription && "Advanced analytics",
                ].filter(Boolean)}
              />
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1c1917]/10">
                  <TrendingUp className="h-4 w-4 text-[#1c1917]" />
                </div>
                <h2 className="font-semibold text-[#1c1917]">Upgrade Options</h2>
              </div>
              <div className="rounded-2xl border border-[#e7e5e4] bg-white p-6 space-y-3">
                <UpgradeButton 
                  userId={userId}
                  currentPlan={hasSubscription ? "pro" : "free"}
                  targetPlan="pro"
                  onUpgrade={handleUpgrade}
                  className="w-full"
                />
                <UpgradeButton 
                  userId={userId}
                  currentPlan={hasSubscription ? "pro" : "free"}
                  targetPlan="enterprise"
                  onUpgrade={handleUpgrade}
                  className="w-full"
                />
              </div>
            </section>
          </div>

          {/* Subscription Gate Demo */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ef4444]/10">
                <Lock className="h-4 w-4 text-[#dc2626]" />
              </div>
              <h2 className="font-semibold text-[#1c1917]">Subscription Gate</h2>
            </div>
            <SubscriptionGate
              hasSubscription={hasSubscription}
              requiredPlan="Pro"
              onUpgrade={() => handleUpgrade("pro")}
            >
              <div className="rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/5 p-6">
                <p className="text-sm text-[#15803d] font-medium">
                  This is premium content only visible to subscribers!
                </p>
                <p className="text-sm text-[#57534e] mt-1">
                  You have access to this feature because you have an active subscription.
                </p>
              </div>
            </SubscriptionGate>
          </section>
        </div>
      </div>
    </main>
  );
}
`;

  await writeTemplateFile(
    path.join(cwd, "app/demo/page.tsx"),
    demoPage,
    "Demo/playground page"
  );

  console.log(chalk.green("✅ SaaS template files created successfully\n"));
}

async function createApiRoutes(cwd: string): Promise<void> {
  // Checkout API route
  const checkoutRoute = `import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { priceId, userId } = await req.json();

    if (!priceId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Implement your Stripe checkout session creation
    // This is a placeholder that redirects to Stripe directly
    // You'll need to implement this using the Stripe SDK

    return NextResponse.json({ 
      url: \`https://checkout.stripe.com/pay/placeholder?price=\${priceId}\` 
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
`;

  await writeTemplateFile(
    path.join(cwd, "app/api/billing/checkout/route.ts"),
    checkoutRoute,
    "Checkout API route"
  );

  // Portal API route
  const portalRoute = `import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, returnUrl } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    // TODO: Implement your Stripe customer portal session creation
    // This is a placeholder
    // You'll need to implement this using the Stripe SDK

    return NextResponse.json({ 
      url: \`https://billing.stripe.com/p/session/placeholder?return=\${encodeURIComponent(returnUrl || "/billing")}\` 
    });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
`;

  await writeTemplateFile(
    path.join(cwd, "app/api/billing/portal/route.ts"),
    portalRoute,
    "Billing portal API route"
  );
}

async function installApiTemplate(
  cwd: string,
  _products: Array<{ id: string; name: string; priceId: string }>
): Promise<void> {
  console.log(chalk.blue("\n📄 Creating API template pages..."));

  // Install usage meter component
  await addCommand("usage-meter", { path: "components/billing", cwd });

  // Create API-focused main page
  const mainPage = `"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  ArrowRight, 
  Terminal,
  Code2,
  Key,
  Shield,
  Zap,
  ExternalLink,
  LayoutGrid
} from "lucide-react";

const steps = [
  {
    id: "api-keys",
    title: "Generate API Keys",
    description: "Create API keys for your users in your dashboard",
    icon: Key,
  },
  {
    id: "middleware",
    title: "Add Middleware",
    description: "We've created middleware.ts to protect your API routes",
    icon: Shield,
  },
  {
    id: "usage",
    title: "Track Usage",
    description: "Record API calls and enforce limits per subscription tier",
    icon: Zap,
  },
];

export default function HomePage() {
  const [apiCalls, setApiCalls] = useState(245);

  return (
    <main className="min-h-screen bg-[#fafaf9]">
      {/* Header */}
      <header className="border-b border-[#e7e5e4] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1c1917]">
                <Code2 className="h-4 w-4 text-[#b8860b]" />
              </div>
              <span className="font-semibold text-[#1c1917]">API Billing Setup</span>
            </div>
            <a 
              href="/api/example"
              className="flex items-center gap-2 text-sm text-[#78716c] hover:text-[#1c1917] transition-colors"
            >
              <Terminal className="h-4 w-4" />
              Test API
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#22c55e]/10 px-3 py-1 text-xs font-medium text-[#15803d] mb-4">
            <CheckCircle2 className="h-3.5 w-3.5" />
            API Template Installed
          </div>
          <h1 className="text-3xl font-bold text-[#1c1917] tracking-tight mb-3">
            Usage-based API billing
          </h1>
          <p className="text-lg text-[#78716c] max-w-2xl">
            Your API is now configured with usage tracking and billing. Follow the steps below to complete the setup.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Setup Steps */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-semibold text-[#1c1917] flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#b8860b]" />
              Implementation Guide
            </h2>
            
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                
                return (
                  <div 
                    key={step.id}
                    className="relative rounded-2xl border border-[#e7e5e4] bg-white p-5 transition-all duration-200 hover:border-[#b8860b]/30"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fafaf9] border border-[#e7e5e4]">
                        <Icon className="h-5 w-5 text-[#a8a29e]" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-[#1c1917]">
                            {step.title}
                          </h3>
                          <span className="text-xs text-[#a8a29e]">Step {index + 1}</span>
                        </div>
                        <p className="text-sm text-[#78716c]">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Code Example */}
            <div className="rounded-2xl border border-[#e7e5e4] bg-[#1c1917] p-5 overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="h-4 w-4 text-[#b8860b]" />
                <span className="text-sm font-medium text-white">Example API Route</span>
              </div>
              <pre className="text-sm text-[#a8a29e] overflow-x-auto">
                <code>{\`// app/api/protected/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1. Authenticate user
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // 2. Check subscription & usage
  const { withinLimit } = await checkUsage(userId);
  if (!withinLimit) {
    return NextResponse.json(
      { error: "Usage limit exceeded" },
      { status: 429 }
    );
  }

  // 3. Track usage
  await recordUsage(userId, "api_call");

  // 4. Process request
  return NextResponse.json({ success: true });
}\`}</code>
              </pre>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#1c1917] flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-[#b8860b]" />
              Resources
            </h2>
            
            <div className="space-y-3">
              {[
                {
                  title: "Middleware Config",
                  description: "Protect your API routes",
                  href: "/middleware.ts",
                  icon: Shield,
                },
                {
                  title: "Example Route",
                  description: "Sample API implementation",
                  href: "/api/example",
                  icon: Code2,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group block rounded-2xl border border-[#e7e5e4] bg-white p-5 transition-all duration-200 hover:border-[#b8860b]/30 hover:shadow-lg hover:shadow-[#b8860b]/5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1c1917]/10 text-[#1c1917]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-[#1c1917]">{item.title}</h3>
                          <ArrowRight className="h-3.5 w-3.5 text-[#a8a29e] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </div>
                        <p className="text-sm text-[#78716c] leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Stats */}
            <div className="rounded-2xl border border-[#e7e5e4] bg-[#fafaf9] p-5">
              <h3 className="text-sm font-medium text-[#1c1917] mb-4">Template Features</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#78716c]">Rate Limiting</span>
                  <span className="font-medium text-[#1c1917]">Ready</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#78716c]">Usage Tracking</span>
                  <span className="font-medium text-[#1c1917]">Included</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#78716c]">Middleware</span>
                  <span className="font-medium text-[#1c1917]">Configured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
`;

  await writeTemplateFile(
    path.join(cwd, "app/page.tsx"),
    mainPage,
    "Main page with setup guide"
  );

  // API-focused template with usage tracking
  const apiRoute = `import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Track API usage
  // Implement your usage tracking here

  // Your API logic here
  return NextResponse.json({ success: true });
}
`;

  await writeTemplateFile(
    path.join(cwd, "app/api/example/route.ts"),
    apiRoute,
    "Example API route"
  );

  // Middleware for subscription checks
  const middleware = `import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Check subscription status
  // Implement your subscription check here
  // if (!hasActiveSubscription) {
  //   return NextResponse.json({ error: "Subscription required" }, { status: 403 });
  // }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/protected/:path*",
};
`;

  await writeTemplateFile(
    path.join(cwd, "middleware.ts"),
    middleware,
    "API middleware"
  );

  console.log(chalk.green("✅ API template files created successfully\n"));
}

async function installUsageTemplate(
  cwd: string,
  _products: Array<{ id: string; name: string; priceId: string }>
): Promise<void> {
  console.log(chalk.blue("\n📄 Creating Usage template pages..."));

  // Install required components
  await addCommand("usage-meter", { path: "components/billing", cwd });
  await addCommand("upgrade-button", { path: "components/billing", cwd });

  // Create enhanced main page with setup guide
  const mainPage = `"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  ArrowRight, 
  Terminal,
  BarChart3,
  TrendingUp,
  Zap,
  ExternalLink,
  LayoutGrid,
  Sparkles
} from "lucide-react";
import { UsageMeter, UpgradeButton } from "@/components/billing";

const steps = [
  {
    id: "connect",
    title: "Connect Your Database",
    description: "Usage records are stored in your database",
    icon: Zap,
  },
  {
    id: "track",
    title: "Implement Usage Tracking",
    description: "Call the usage API when users consume resources",
    icon: BarChart3,
  },
  {
    id: "tiers",
    title: "Define Usage Tiers",
    description: "Set limits for each subscription plan",
    icon: TrendingUp,
  },
];

export default function HomePage() {
  const [userId] = useState("user_" + Math.random().toString(36).slice(2));
  const [apiCalls, setApiCalls] = useState(750);
  const [storage, setStorage] = useState(45);

  const handleUpgrade = async (targetPlan: string) => {
    console.log("Upgrading to", targetPlan);
  };

  return (
    <main className="min-h-screen bg-[#fafaf9]">
      {/* Header */}
      <header className="border-b border-[#e7e5e4] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1c1917]">
                <TrendingUp className="h-4 w-4 text-[#b8860b]" />
              </div>
              <span className="font-semibold text-[#1c1917]">Usage Billing</span>
            </div>
            <a 
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-[#78716c] hover:text-[#1c1917] transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#22c55e]/10 px-3 py-1 text-xs font-medium text-[#15803d] mb-4">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Usage Template Installed
          </div>
          <h1 className="text-3xl font-bold text-[#1c1917] tracking-tight mb-3">
            Metered billing system
          </h1>
          <p className="text-lg text-[#78716c] max-w-2xl">
            Track resource consumption and bill customers based on actual usage. Perfect for API credits, storage, or compute.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Setup Steps */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-semibold text-[#1c1917] flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#b8860b]" />
              Setup Checklist
            </h2>
            
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                
                return (
                  <div 
                    key={step.id}
                    className="relative rounded-2xl border border-[#e7e5e4] bg-white p-5 transition-all duration-200 hover:border-[#b8860b]/30"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fafaf9] border border-[#e7e5e4]">
                        <Icon className="h-5 w-5 text-[#a8a29e]" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-[#1c1917]">
                            {step.title}
                          </h3>
                          <span className="text-xs text-[#a8a29e]">Step {index + 1}</span>
                        </div>
                        <p className="text-sm text-[#78716c]">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Demo */}
            <div className="rounded-2xl border border-[#e7e5e4] bg-white p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#b8860b]/10">
                  <Sparkles className="h-4 w-4 text-[#b8860b]" />
                </div>
                <h2 className="font-semibold text-[#1c1917]">Live Usage Demo</h2>
              </div>
              
              <div className="space-y-4 mb-6">
                <UsageMeter 
                  userId={userId}
                  feature="api_calls"
                  limit={1000}
                  current={apiCalls}
                  label="API Calls this month"
                />
                <UsageMeter 
                  userId={userId}
                  feature="storage"
                  limit={100}
                  current={storage}
                  label="Storage (GB)"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setApiCalls(c => Math.min(c + 50, 1000))}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#e7e5e4] bg-[#fafaf9] px-4 py-2 text-sm font-medium text-[#57534e] hover:border-[#b8860b]/50 hover:bg-[#fafaf9] transition-all"
                >
                  +50 API calls
                </button>
                <button 
                  onClick={() => setStorage(c => Math.min(c + 5, 100))}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#e7e5e4] bg-[#fafaf9] px-4 py-2 text-sm font-medium text-[#57534e] hover:border-[#b8860b]/50 hover:bg-[#fafaf9] transition-all"
                >
                  +5 GB storage
                </button>
                <button 
                  onClick={() => { setApiCalls(950); setStorage(95); }}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#e7e5e4] bg-[#fafaf9] px-4 py-2 text-sm font-medium text-[#57534e] hover:border-[#f59e0b]/50 hover:bg-[#f59e0b]/5 transition-all"
                >
                  Near limits
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#1c1917] flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-[#b8860b]" />
              Actions
            </h2>
            
            <div className="rounded-2xl border border-[#e7e5e4] bg-white p-6 space-y-3">
              <h3 className="text-sm font-medium text-[#1c1917] mb-3">Upgrade Plan</h3>
              <UpgradeButton 
                userId={userId}
                currentPlan="free"
                targetPlan="pro"
                onUpgrade={handleUpgrade}
                className="w-full"
              />
              <UpgradeButton 
                userId={userId}
                currentPlan="free"
                targetPlan="enterprise"
                onUpgrade={handleUpgrade}
                className="w-full"
              />
            </div>

            {/* Resources */}
            <div className="space-y-3">
              {[
                {
                  title: "Dashboard",
                  description: "View full usage dashboard",
                  href: "/dashboard",
                  icon: BarChart3,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group block rounded-2xl border border-[#e7e5e4] bg-white p-5 transition-all duration-200 hover:border-[#b8860b]/30 hover:shadow-lg hover:shadow-[#b8860b]/5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#22c55e]/10 text-[#15803d]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-[#1c1917]">{item.title}</h3>
                          <ArrowRight className="h-3.5 w-3.5 text-[#a8a29e] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </div>
                        <p className="text-sm text-[#78716c] leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Stats */}
            <div className="rounded-2xl border border-[#e7e5e4] bg-[#fafaf9] p-5">
              <h3 className="text-sm font-medium text-[#1c1917] mb-4">Template Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#78716c]">Components</span>
                  <span className="font-medium text-[#1c1917]">2 installed</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#78716c]">Pages</span>
                  <span className="font-medium text-[#1c1917]">2 created</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#78716c]">Meter Types</span>
                  <span className="font-medium text-[#1c1917]">Unlimited</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
`;

  await writeTemplateFile(
    path.join(cwd, "app/page.tsx"),
    mainPage,
    "Main page with usage setup guide"
  );

  // Usage-based billing focused dashboard page
  const dashboardPage = `"use client";

import { useState } from "react";
import Link from "next/link";
import { UsageMeter, UpgradeButton } from "@/components/billing";
import { ArrowLeft, BarChart3, Zap, TrendingUp } from "lucide-react";

export default function UsageDashboard() {
  const [usage, setUsage] = useState({
    apiCalls: 5000,
    storage: 45,
    compute: 230,
  });
  const [userId] = useState("user_" + Math.random().toString(36).slice(2));

  const handleUpgrade = async (targetPlan: string) => {
    console.log("Upgrading to", targetPlan);
  };

  return (
    <main className="min-h-screen bg-[#fafaf9]">
      {/* Header */}
      <header className="border-b border-[#e7e5e4] bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-sm text-[#78716c] hover:text-[#1c1917] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#22c55e]/10 px-3 py-1 text-xs font-medium text-[#15803d] mb-4">
            <BarChart3 className="h-3.5 w-3.5" />
            Usage Dashboard
          </div>
          <h1 className="text-3xl font-bold text-[#1c1917] tracking-tight mb-2">
            Resource Usage
          </h1>
          <p className="text-[#78716c]">
            Monitor your consumption and upgrade when needed
          </p>
        </div>
        
        <div className="grid gap-6">
          {/* Usage Meters */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#b8860b]/10">
                <TrendingUp className="h-4 w-4 text-[#b8860b]" />
              </div>
              <h2 className="font-semibold text-[#1c1917]">Current Usage</h2>
            </div>
            <div className="grid gap-4">
              <UsageMeter 
                userId={userId}
                feature="api_calls"
                limit={10000}
                current={usage.apiCalls}
                label="API Calls"
              />
              <UsageMeter
                userId={userId}
                feature="storage"
                limit={100}
                current={usage.storage}
                label="Storage (GB)"
              />
              <UsageMeter
                userId={userId}
                feature="compute"
                limit={500}
                current={usage.compute}
                label="Compute Hours"
              />
            </div>
          </section>

          {/* Upgrade Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1c1917]/10">
                <Zap className="h-4 w-4 text-[#1c1917]" />
              </div>
              <h2 className="font-semibold text-[#1c1917]">Upgrade Plan</h2>
            </div>
            <div className="rounded-2xl border border-[#e7e5e4] bg-white p-6">
              <p className="text-sm text-[#78716c] mb-4">
                Need more resources? Upgrade your plan to increase your limits and access additional features.
              </p>
              <div className="flex flex-wrap gap-3">
                <UpgradeButton
                  userId={userId}
                  currentPlan="free"
                  targetPlan="pro"
                  onUpgrade={handleUpgrade}
                />
                <UpgradeButton
                  userId={userId}
                  currentPlan="free"
                  targetPlan="enterprise"
                  onUpgrade={handleUpgrade}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
`;

  await writeTemplateFile(
    path.join(cwd, "app/dashboard/page.tsx"),
    dashboardPage,
    "Usage dashboard page"
  );

  console.log(chalk.green("✅ Usage template files created successfully\n"));
}

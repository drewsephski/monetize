import fs from "fs-extra";
import path from "path";
import { addCommand } from "../commands/add.js";

export async function installTemplates(
  templateType: string,
  products: Array<{ id: string; name: string; priceId: string }>
): Promise<void> {
  const cwd = process.cwd();

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
  // First, install all billing components
  await addCommand("all", { path: "components/billing" });

  // Get price IDs for plans
  const proProduct = products.find(p => p.name === "Pro");
  const enterpriseProduct = products.find(p => p.name === "Enterprise");

  const proPriceId = proProduct?.priceId || "price_placeholder_pro";
  const enterprisePriceId = enterpriseProduct?.priceId || "price_placeholder_enterprise";

  // Create pricing page with proper imports
  const pricingPage = `"use client";

import { PricingTable } from "@/components/billing";
import { useState } from "react";

const plans = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for getting started",
    price: 0,
    priceLabel: "Free",
    currency: "usd",
    interval: "month" as const,
    features: ["1,000 API calls/mo", "1 project", "Community support"],
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
    if (!priceId) return;
    
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
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold text-center mb-4">
        Simple, transparent pricing
      </h1>
      <p className="text-center text-gray-600 mb-12">
        Choose the plan that works for you
      </p>
      
      {error && (
        <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      
      <PricingTable
        plans={plans}
        userId={userId}
        onSubscribe={handleSubscribe}
      />
    </div>
  );
}
`;

  await fs.ensureDir(path.join(cwd, "app/pricing"));
  await fs.writeFile(path.join(cwd, "app/pricing/page.tsx"), pricingPage);

  // Create billing settings page
  const billingPage = `"use client";

import { BillingPortalButton, CurrentPlanBadge } from "@/components/billing";
import { useState } from "react";

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
    <div className="container mx-auto py-8 max-w-2xl px-4">
      <h1 className="text-2xl font-bold mb-8">Billing</h1>
      
      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Current Plan</h2>
          <CurrentPlanBadge 
            plan="free"
            status="active"
            features={["1,000 API calls/mo", "1 project", "Community support"]}
          />
        </div>
        
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
          <BillingPortalButton 
            userId={userId}
            onOpenPortal={handleOpenPortal}
          />
        </div>
      </div>
    </div>
  );
}
`;

  await fs.ensureDir(path.join(cwd, "app/billing"));
  await fs.writeFile(path.join(cwd, "app/billing/page.tsx"), billingPage);

  // Create demo page
  const demoPage = `"use client";

import { useState } from "react";
import { UsageMeter, UpgradeButton } from "@/components/billing";

export default function DemoPage() {
  const [userId] = useState("demo-user-" + Math.random().toString(36).slice(2));
  const [apiCalls, setApiCalls] = useState(750);

  const handleUpgrade = async (targetPlan: string) => {
    // Implement your upgrade logic here
    console.log("Upgrading to", targetPlan);
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl px-4">
      <h1 className="text-3xl font-bold mb-8">Billing Demo</h1>
      
      <div className="grid gap-6">
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Usage Tracking</h2>
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
              className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
            >
              +50 calls
            </button>
            <button 
              onClick={() => setApiCalls(c => Math.max(c - 50, 0))}
              className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
            >
              -50 calls
            </button>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Upgrade</h2>
          <div className="flex gap-4">
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
      </div>
    </div>
  );
}
`;

  await fs.writeFile(path.join(cwd, "app/demo/page.tsx"), demoPage);

  // Create API routes for checkout and portal
  await createApiRoutes(cwd);
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
    // Replace with your actual implementation using @drew/billing-sdk

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

  await fs.ensureDir(path.join(cwd, "app/api/billing/checkout"));
  await fs.writeFile(path.join(cwd, "app/api/billing/checkout/route.ts"), checkoutRoute);

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
    // Replace with your actual implementation using @drew/billing-sdk

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

  await fs.ensureDir(path.join(cwd, "app/api/billing/portal"));
  await fs.writeFile(path.join(cwd, "app/api/billing/portal/route.ts"), portalRoute);
}

async function installApiTemplate(
  cwd: string,
  _products: Array<{ id: string; name: string; priceId: string }>
): Promise<void> {
  // Install usage meter component
  await addCommand("usage-meter", { path: "components/billing" });

  // API-focused template with usage tracking
  const apiRoute = `import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Track API usage with @drew/billing-sdk
  // await billing.trackUsage({ userId, feature: "api_calls", quantity: 1 });

  // Your API logic here
  return NextResponse.json({ success: true });
}
`;

  await fs.ensureDir(path.join(cwd, "app/api/example"));
  await fs.writeFile(path.join(cwd, "app/api/example/route.ts"), apiRoute);

  // Middleware for subscription checks
  const middleware = `import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: Check subscription with @drew/billing-sdk
  // const hasSub = await billing.hasActiveSubscription(userId);
  // if (!hasSub) {
  //   return NextResponse.json({ error: "Subscription required" }, { status: 403 });
  // }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/protected/:path*",
};
`;

  await fs.writeFile(path.join(cwd, "middleware.ts"), middleware);
}

async function installUsageTemplate(
  cwd: string,
  _products: Array<{ id: string; name: string; priceId: string }>
): Promise<void> {
  // Install required components
  await addCommand("usage-meter", { path: "components/billing" });
  await addCommand("upgrade-button", { path: "components/billing" });

  // Usage-based billing focused template
  const dashboardPage = `"use client";

import { useEffect, useState } from "react";
import { UsageMeter, UpgradeButton } from "@/components/billing";

export default function UsageDashboard() {
  const [usage, setUsage] = useState({
    apiCalls: 5000,
    storage: 45,
  });
  const [userId] = useState("user_" + Math.random().toString(36).slice(2));

  const handleUpgrade = async (targetPlan: string) => {
    console.log("Upgrading to", targetPlan);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Usage Dashboard</h1>
      
      <div className="grid gap-6 max-w-2xl">
        <div className="border border-gray-200 rounded-lg p-6">
          <UsageMeter 
            userId={userId}
            feature="api_calls"
            limit={10000}
            current={usage.apiCalls}
            label="API Calls"
          />
        </div>
        <div className="border border-gray-200 rounded-lg p-6">
          <UsageMeter
            userId={userId}
            feature="storage"
            limit={100}
            current={usage.storage}
            label="Storage (GB)"
          />
        </div>
        <div className="flex gap-4">
          <UpgradeButton
            userId={userId}
            currentPlan="free"
            targetPlan="pro"
            onUpgrade={handleUpgrade}
          />
        </div>
      </div>
    </div>
  );
}
`;

  await fs.ensureDir(path.join(cwd, "app/dashboard"));
  await fs.writeFile(path.join(cwd, "app/dashboard/page.tsx"), dashboardPage);
}

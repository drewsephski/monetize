import fs from "fs-extra";
import path from "path";

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
  // Create pricing page
  const pricingPage = `import { PricingTable } from "@/components/billing/pricing-table";

export default function PricingPage() {
  return (
    <div className="container mx-auto py-16">
      <h1 className="text-4xl font-bold text-center mb-4">
        Simple, transparent pricing
      </h1>
      <p className="text-center text-muted-foreground mb-12">
        Choose the plan that works for you
      </p>
      <PricingTable />
    </div>
  );
}
`;

  await fs.ensureDir(path.join(cwd, "app/pricing"));
  await fs.writeFile(path.join(cwd, "app/pricing/page.tsx"), pricingPage);

  // Create billing settings page
  const billingPage = `import { BillingPortalButton } from "@/components/billing/billing-portal-button";
import { CurrentPlanBadge } from "@/components/billing/current-plan";

export default function BillingPage() {
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Billing</h1>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Current Plan</h2>
          <CurrentPlanBadge />
        </div>
        
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
          <BillingPortalButton />
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
import { UsageMeter } from "@/components/billing/usage-meter";
import { UpgradeButton } from "@/components/billing/upgrade-button";

export default function DemoPage() {
  const [userId] = useState("demo-user-" + Math.random().toString(36).slice(2));

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Billing Demo</h1>
      
      <div className="grid gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Usage Tracking</h2>
          <UsageMeter 
            userId={userId} 
            feature="api_calls" 
            limit={1000}
            label="API Calls this month"
          />
        </div>
        
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Upgrade</h2>
          <UpgradeButton 
            userId={userId}
            currentPlan="free"
            targetPlan="pro"
          />
        </div>
      </div>
    </div>
  );
}
`;

  await fs.writeFile(path.join(cwd, "app/demo/page.tsx"), demoPage);
}

async function installApiTemplate(
  cwd: string,
  products: Array<{ id: string; name: string; priceId: string }>
): Promise<void> {
  // API-focused template with usage tracking
  const apiRoute = `import { NextRequest, NextResponse } from "next/server";
import { BillingSDK } from "@drew/billing-sdk";

const billing = new BillingSDK({
  baseUrl: process.env.NEXT_PUBLIC_BILLING_API_URL!,
});

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Track API usage
  await billing.trackUsage({
    userId,
    feature: "api_calls",
    quantity: 1,
  });

  // Your API logic here
  return NextResponse.json({ success: true });
}
`;

  await fs.ensureDir(path.join(cwd, "app/api/example"));
  await fs.writeFile(path.join(cwd, "app/api/example/route.ts"), apiRoute);

  // Middleware for rate limiting and subscription checks
  const middleware = `import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BillingSDK } from "@drew/billing-sdk";

const billing = new BillingSDK({
  baseUrl: process.env.NEXT_PUBLIC_BILLING_API_URL!,
});

export async function middleware(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check subscription
  const hasSub = await billing.hasActiveSubscription(userId);
  
  if (!hasSub) {
    return NextResponse.json(
      { error: "Subscription required" },
      { status: 403 }
    );
  }

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
  products: Array<{ id: string; name: string; priceId: string }>
): Promise<void> {
  // Usage-based billing focused template
  const dashboardPage = `"use client";

import { useEffect, useState } from "react";
import { BillingSDK } from "@drew/billing-sdk";
import { UsageMeter } from "@/components/billing/usage-meter";

const billing = new BillingSDK({
  baseUrl: process.env.NEXT_PUBLIC_BILLING_API_URL!,
});

export default function UsageDashboard() {
  const [usage, setUsage] = useState<{
    total: number;
    byFeature: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      const result = await billing.getUsage({
        userId: "current-user", // Get from auth
      });
      setUsage({
        total: result.totalUsage,
        byFeature: result.byFeature,
      });
    }

    fetchUsage();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Usage Dashboard</h1>
      
      <div className="grid gap-4">
        <UsageMeter 
          userId="current-user"
          feature="api_calls"
          limit={10000}
          label="API Calls"
        />
        <UsageMeter
          userId="current-user"
          feature="storage"
          limit={100}
          label="Storage (GB)"
        />
      </div>
    </div>
  );
}
`;

  await fs.ensureDir(path.join(cwd, "app/dashboard"));
  await fs.writeFile(path.join(cwd, "app/dashboard/page.tsx"), dashboardPage);
}

#!/usr/bin/env node

// src/index.ts
import { Command } from "commander";
import chalk11 from "chalk";

// src/commands/init.ts
import chalk5 from "chalk";
import inquirer2 from "inquirer";
import ora2 from "ora";
import fs6 from "fs-extra";
import path6 from "path";
import { execa as execa2 } from "execa";

// src/utils/detect.ts
import fs from "fs-extra";
import path from "path";
async function detectFramework() {
  const cwd = process.cwd();
  const packageJsonPath = path.join(cwd, "package.json");
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    if (deps.next) {
      const hasAppDir = await fs.pathExists(path.join(cwd, "app"));
      const hasPagesDir = await fs.pathExists(path.join(cwd, "pages"));
      return {
        name: "nextjs",
        version: deps.next,
        type: hasAppDir ? "app" : hasPagesDir ? "pages" : "app"
      };
    }
    if (deps.react) {
      return { name: "react", version: deps.react };
    }
    if (deps.vue || deps["@vue/core"]) {
      return { name: "vue", version: deps.vue || deps["@vue/core"] };
    }
    if (deps.express) {
      return { name: "express", version: deps.express };
    }
  }
  if (await fs.pathExists(path.join(cwd, "next.config.js")) || await fs.pathExists(path.join(cwd, "next.config.ts")) || await fs.pathExists(path.join(cwd, "next.config.mjs"))) {
    return { name: "nextjs", type: "app" };
  }
  if (await fs.pathExists(path.join(cwd, "vite.config.ts"))) {
    return { name: "react" };
  }
  return { name: "unknown" };
}

// src/utils/stripe.ts
import Stripe from "stripe";
async function findOrCreatePrice(stripe, productData, priceData) {
  try {
    const existingPrices = await stripe.prices.search({
      query: `lookup_key:"${priceData.lookup_key}"`
    });
    if (existingPrices.data.length > 0) {
      const existingPrice = existingPrices.data[0];
      const product2 = await stripe.products.retrieve(
        typeof existingPrice.product === "string" ? existingPrice.product : existingPrice.product.id
      );
      return {
        productId: product2.id,
        priceId: existingPrice.id,
        name: product2.name
      };
    }
  } catch {
  }
  const product = await stripe.products.create(productData);
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: priceData.unit_amount,
    currency: priceData.currency,
    recurring: priceData.recurring,
    lookup_key: priceData.lookup_key
  });
  return { productId: product.id, priceId: price.id, name: product.name };
}
async function createStripeProducts(apiKey) {
  const stripe = new Stripe(apiKey, {
    apiVersion: "2023-10-16"
  });
  const products = [];
  try {
    const pro = await findOrCreatePrice(
      stripe,
      {
        name: "Pro",
        description: "For growing businesses",
        metadata: {
          tier: "pro",
          features: JSON.stringify([
            "10,000 API calls/mo",
            "Unlimited projects",
            "Priority support",
            "Advanced analytics"
          ])
        }
      },
      {
        unit_amount: 2900,
        currency: "usd",
        recurring: { interval: "month" },
        lookup_key: `pro_monthly_${Date.now()}`
        // Unique lookup key
      }
    );
    products.push({ id: pro.productId, name: pro.name, priceId: pro.priceId });
  } catch (error) {
    console.warn("Failed to create Pro plan:", error instanceof Error ? error.message : String(error));
  }
  try {
    const enterprise = await findOrCreatePrice(
      stripe,
      {
        name: "Enterprise",
        description: "For large organizations",
        metadata: {
          tier: "enterprise",
          features: JSON.stringify([
            "Unlimited API calls",
            "Custom integrations",
            "SLA guarantee",
            "Dedicated support"
          ])
        }
      },
      {
        unit_amount: 9900,
        currency: "usd",
        recurring: { interval: "month" },
        lookup_key: `enterprise_monthly_${Date.now()}`
        // Unique lookup key
      }
    );
    products.push({
      id: enterprise.productId,
      name: enterprise.name,
      priceId: enterprise.priceId
    });
  } catch (error) {
    console.warn("Failed to create Enterprise plan:", error instanceof Error ? error.message : String(error));
  }
  try {
    const usage = await findOrCreatePrice(
      stripe,
      {
        name: "API Calls",
        description: "Per-call pricing for API usage",
        metadata: {
          type: "usage",
          unit: "api_call"
        }
      },
      {
        unit_amount: 1,
        // $0.01 per call
        currency: "usd",
        recurring: {
          interval: "month",
          usage_type: "metered"
        },
        lookup_key: `api_calls_${Date.now()}`
        // Unique lookup key
      }
    );
    products.push({
      id: usage.productId,
      name: "API Calls (Usage)",
      priceId: usage.priceId
    });
  } catch (error) {
    console.warn("Failed to create Usage plan:", error instanceof Error ? error.message : String(error));
  }
  if (products.length === 0) {
    throw new Error("Failed to create any Stripe products. Check your API key and try again.");
  }
  return products;
}

// src/utils/templates.ts
import fs3 from "fs-extra";
import path3 from "path";
import chalk2 from "chalk";

// src/commands/add.ts
import chalk from "chalk";
import ora from "ora";
import fs2 from "fs-extra";
import path2 from "path";
var COMPONENTS = {
  "pricing-table": {
    name: "PricingTable",
    description: "Beautiful pricing table with Stripe checkout integration",
    files: ["pricing-table.tsx"]
  },
  "upgrade-button": {
    name: "UpgradeButton",
    description: "Smart upgrade button with plan comparison",
    files: ["upgrade-button.tsx"]
  },
  "usage-meter": {
    name: "UsageMeter",
    description: "Real-time usage visualization with limits",
    files: ["usage-meter.tsx"]
  },
  "current-plan": {
    name: "CurrentPlanBadge",
    description: "Shows current plan with upgrade CTA",
    files: ["current-plan.tsx"]
  },
  "billing-portal": {
    name: "BillingPortalButton",
    description: "Opens Stripe customer portal",
    files: ["billing-portal-button.tsx"]
  },
  "subscription-gate": {
    name: "SubscriptionGate",
    description: "Blocks content based on subscription status",
    files: ["subscription-gate.tsx"]
  },
  "trial-banner": {
    name: "TrialBanner",
    description: "Shows trial status and countdown",
    files: ["trial-banner.tsx"]
  },
  "all": {
    name: "All Components",
    description: "Install all billing components",
    files: [
      "pricing-table.tsx",
      "upgrade-button.tsx",
      "usage-meter.tsx",
      "current-plan.tsx",
      "billing-portal-button.tsx",
      "subscription-gate.tsx",
      "trial-banner.tsx",
      "index.ts"
    ]
  }
};
async function addCommand(component, options) {
  console.log(chalk.blue.bold("\n\u{1F4E6} @drew/billing add\n"));
  const validComponents = Object.keys(COMPONENTS);
  if (!validComponents.includes(component)) {
    console.log(chalk.red(`Invalid component: ${component}
`));
    console.log(chalk.gray("Available components:"));
    validComponents.forEach((c) => {
      if (c === "all") return;
      const info = COMPONENTS[c];
      console.log(chalk.gray(`  \u2022 ${c}`) + ` - ${info.description}`);
    });
    console.log(chalk.gray(`  \u2022 all - Install all components`));
    console.log();
    process.exit(1);
  }
  const componentInfo = COMPONENTS[component];
  const installPath = options.path || "components/billing";
  const cwd = options.cwd || process.cwd();
  const fullPath = path2.join(cwd, installPath);
  console.log(chalk.gray(`Installing ${componentInfo.name}...
`));
  await fs2.ensureDir(fullPath);
  const spinner = ora("Creating components...").start();
  try {
    for (const file of componentInfo.files) {
      const content = getComponentTemplate(file);
      await fs2.writeFile(path2.join(fullPath, file), content);
    }
    spinner.succeed(`Installed ${componentInfo.name} to ${installPath}/`);
  } catch (error) {
    spinner.fail("Failed to install component");
    console.error(error);
    process.exit(1);
  }
  console.log(chalk.green.bold("\n\u2705 Component installed!\n"));
  console.log(chalk.gray("Usage:"));
  if (component === "all") {
    console.log(chalk.cyan(`import { PricingTable, UpgradeButton } from "${installPath}";`));
  } else {
    console.log(chalk.cyan(`import { ${componentInfo.name} } from "${installPath}/${component.replace("billing-portal", "billing-portal-button")}";`));
  }
  console.log();
  console.log(chalk.gray("Documentation:"), chalk.underline("https://github.com/drewsephski/monetize/tree/main/packages/cli#readme"));
  console.log();
}
function getComponentTemplate(filename) {
  const templates = {
    "pricing-table.tsx": getPricingTableTemplate(),
    "upgrade-button.tsx": getUpgradeButtonTemplate(),
    "usage-meter.tsx": getUsageMeterTemplate(),
    "current-plan.tsx": getCurrentPlanTemplate(),
    "billing-portal-button.tsx": getBillingPortalTemplate(),
    "subscription-gate.tsx": getSubscriptionGateTemplate(),
    "trial-banner.tsx": getTrialBannerTemplate(),
    "index.ts": getIndexTemplate()
  };
  return templates[filename] || `// ${filename} - Component template
export function Placeholder() { return null; }`;
}
function getPricingTableTemplate() {
  return `"use client";

import { useState } from "react";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceLabel?: string;
  currency: string;
  interval: "month" | "year";
  features: string[];
  cta: string;
  popular?: boolean;
  disabled?: boolean;
  priceId?: string;
}

interface PricingTableProps {
  plans: Plan[];
  currentPlanId?: string;
  userId: string;
  onSubscribe: (planId: string, priceId?: string) => Promise<void>;
  className?: string;
}

export function PricingTable({
  plans,
  currentPlanId,
  userId,
  onSubscribe,
  className,
}: PricingTableProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: Plan) => {
    if (plan.id === "free" || !plan.priceId) return;
    
    setLoadingPlan(plan.id);
    try {
      await onSubscribe(plan.id, plan.priceId);
    } finally {
      setLoadingPlan(null);
    }
  };

  const formatPrice = (price: number, currency: string, interval: string) => {
    if (price === 0) return "Free";
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
    });
    return \`\${formatter.format(price / 100)}/\${interval}\`;
  };

  return (
    <div className={\`grid gap-6 lg:grid-cols-3 \${className || ""}\`}>
      {plans.map((plan) => {
        const isCurrentPlan = currentPlanId === plan.id;
        const isLoading = loadingPlan === plan.id;
        const isPopular = plan.popular;

        return (
          <div
            key={plan.id}
            className={\`relative flex flex-col rounded-lg border p-6 \${
              isPopular ? "border-blue-500 shadow-lg scale-105" : "border-gray-200"
            }\`}
          >
            {isPopular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white">
                Most Popular
              </span>
            )}

            <div className="mb-4">
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-sm text-gray-600">{plan.description}</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold">
                {plan.priceLabel || formatPrice(plan.price, plan.currency, plan.interval)}
              </span>
            </div>

            <ul className="mb-6 flex-1 space-y-3">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <svg className="h-5 w-5 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={\`w-full rounded-lg px-4 py-2 font-medium transition-colors \${
                isPopular
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border border-gray-300 hover:bg-gray-50"
              } \${isCurrentPlan || isLoading ? "opacity-60 cursor-not-allowed" : ""}\`}
              disabled={isCurrentPlan || isLoading || plan.disabled}
              onClick={() => handleSubscribe(plan)}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </span>
              ) : isCurrentPlan ? (
                "Current Plan"
              ) : (
                plan.cta
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
`;
}
function getUpgradeButtonTemplate() {
  return `"use client";

import { useState } from "react";

interface UpgradeButtonProps {
  userId: string;
  currentPlan: string;
  targetPlan: "pro" | "enterprise";
  onUpgrade: (targetPlan: string) => Promise<void>;
  showCurrentLabel?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function UpgradeButton({
  userId,
  currentPlan,
  targetPlan,
  onUpgrade,
  showCurrentLabel = true,
  children,
  className,
}: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isCurrent = currentPlan === targetPlan;

  const handleUpgrade = async () => {
    if (isCurrent) return;

    setIsLoading(true);
    try {
      await onUpgrade(targetPlan);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCurrent && showCurrentLabel) {
    return (
      <button
        disabled
        className={\`rounded-lg border border-gray-300 px-4 py-2 opacity-60 \${className || ""}\`}
      >
        Current Plan
      </button>
    );
  }

  return (
    <button
      disabled={isLoading || isCurrent}
      onClick={handleUpgrade}
      className={\`rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60 \${className || ""}\`}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        children || \`Upgrade to \${targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)}\`
      )}
    </button>
  );
}
`;
}
function getUsageMeterTemplate() {
  return `"use client";

import { useEffect, useState } from "react";

interface UsageMeterProps {
  userId: string;
  feature: string;
  limit: number;
  current?: number;
  label?: string;
  onFetchUsage?: (userId: string, feature: string) => Promise<number>;
  refreshInterval?: number;
  className?: string;
}

export function UsageMeter({
  userId,
  feature,
  limit,
  current: initialCurrent,
  label,
  onFetchUsage,
  refreshInterval = 30000,
  className,
}: UsageMeterProps) {
  const [current, setCurrent] = useState(initialCurrent || 0);
  const [isLoading, setIsLoading] = useState(!initialCurrent && !!onFetchUsage);

  useEffect(() => {
    if (!onFetchUsage || initialCurrent !== undefined) {
      return;
    }

    const fetchUsage = async () => {
      try {
        const usage = await onFetchUsage(userId, feature);
        setCurrent(usage);
      } catch (error) {
        console.error("Failed to fetch usage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsage();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchUsage, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [userId, feature, onFetchUsage, refreshInterval, initialCurrent]);

  const percentage = Math.min((current / limit) * 100, 100);
  const isNearLimit = percentage >= 80 && percentage < 100;
  const isOverLimit = percentage >= 100;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return \`\${(num / 1000000).toFixed(1)}M\`;
    if (num >= 1000) return \`\${(num / 1000).toFixed(1)}K\`;
    return num.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className={\`space-y-2 \${className || ""}\`}>
        <div className="h-2 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  return (
    <div className={\`space-y-2 \${className || ""}\`}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label || feature}</span>
        <span className="text-gray-600">
          {formatNumber(current)} / {formatNumber(limit)}
        </span>
      </div>

      <div className="relative">
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className={\`h-2 rounded-full transition-all \${
              isOverLimit ? "bg-red-500" : isNearLimit ? "bg-amber-500" : "bg-blue-600"
            }\`}
            style={{ width: \`\${percentage}%\` }}
          />
        </div>
        {(isNearLimit || isOverLimit) && (
          <div className="absolute -right-1 -top-1">
            <svg
              className={\`h-4 w-4 \${isOverLimit ? "text-red-500" : "text-amber-500"}\`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {isNearLimit && !isOverLimit && (
        <p className="text-xs text-amber-600">
          Approaching limit - consider upgrading
        </p>
      )}
      {isOverLimit && (
        <p className="text-xs text-red-600">
          Limit exceeded - upgrade required
        </p>
      )}
    </div>
  );
}
`;
}
function getCurrentPlanTemplate() {
  return `"use client";

interface CurrentPlanProps {
  plan: string;
  status?: "active" | "trialing" | "canceled" | "past_due";
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  features?: string[];
  className?: string;
}

const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-700",
  pro: "bg-blue-100 text-blue-700",
  enterprise: "bg-amber-100 text-amber-700",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  trialing: "bg-blue-100 text-blue-700",
  canceled: "bg-red-100 text-red-700",
  past_due: "bg-amber-100 text-amber-700",
};

export function CurrentPlanBadge({
  plan,
  status = "active",
  trialEndsAt,
  currentPeriodEnd,
  features,
  className,
}: CurrentPlanProps) {
  const planLower = plan.toLowerCase();
  const isTrial = status === "trialing";

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className={\`rounded-lg border border-gray-200 overflow-hidden \${className || ""}\`}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={\`flex h-12 w-12 items-center justify-center rounded-lg \${
                PLAN_COLORS[planLower] || PLAN_COLORS.free
              }\`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg capitalize">{plan}</h3>
              <span className={\`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium \${
                STATUS_COLORS[status]
              }\`}>
                {isTrial ? "Trial" : status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {isTrial && trialEndsAt && (
          <p className="mt-4 text-sm text-gray-600">
            Trial ends on <strong>{formatDate(trialEndsAt)}</strong>
          </p>
        )}

        {!isTrial && currentPeriodEnd && (
          <p className="mt-4 text-sm text-gray-600">
            Renews on <strong>{formatDate(currentPeriodEnd)}</strong>
          </p>
        )}

        {features && features.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-medium">Included features:</h4>
            <ul className="space-y-1">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
`;
}
function getBillingPortalTemplate() {
  return `"use client";

import { useState } from "react";

interface BillingPortalButtonProps {
  userId: string;
  returnUrl?: string;
  onOpenPortal: (userId: string, returnUrl?: string) => Promise<string>;
  children?: React.ReactNode;
  className?: string;
}

export function BillingPortalButton({
  userId,
  returnUrl,
  onOpenPortal,
  children,
  className,
}: BillingPortalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const url = await onOpenPortal(userId, returnUrl || window.location.href);
      window.location.href = url;
    } catch (error) {
      console.error("Failed to open billing portal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={\`inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-medium transition-colors hover:bg-gray-50 disabled:opacity-60 \${className || ""}\`}
    >
      {isLoading ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          {children || "Manage Billing"}
        </>
      )}
    </button>
  );
}
`;
}
function getSubscriptionGateTemplate() {
  return `"use client";

interface SubscriptionGateProps {
  hasSubscription: boolean;
  isLoading?: boolean;
  requiredPlan?: string;
  children: React.ReactNode;
  onUpgrade?: () => void;
}

export function SubscriptionGate({
  hasSubscription,
  isLoading,
  requiredPlan = "paid",
  children,
  onUpgrade,
}: SubscriptionGateProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (hasSubscription) {
    return <>{children}</>;
  }

  return (
    <div className="rounded-lg border-2 border-dashed border-gray-300 p-8">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold">Premium Feature</h3>
        <p className="mt-2 text-sm text-gray-600">
          This feature requires a {requiredPlan} subscription
        </p>
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Upgrade to Unlock
          </button>
        )}
        <p className="mt-4 text-xs text-gray-500">
          Get access to all premium features and priority support
        </p>
      </div>
    </div>
  );
}
`;
}
function getTrialBannerTemplate() {
  return `"use client";

import { useState } from "react";

interface TrialBannerProps {
  trialEndsAt: string;
  onUpgrade: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function TrialBanner({
  trialEndsAt,
  onUpgrade,
  onDismiss,
  className,
}: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const endDate = new Date(trialEndsAt);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  if (dismissed || daysLeft <= 0) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const isUrgent = daysLeft <= 3;

  return (
    <div
      className={\`relative rounded-lg border p-4 \${
        isUrgent
          ? "border-amber-400 bg-amber-50"
          : "border-blue-200 bg-blue-50"
      } \${className || ""}\`}
    >
      <div className="flex items-start gap-3">
        <svg
          className={\`h-5 w-5 shrink-0 \${isUrgent ? "text-amber-600" : "text-blue-600"}\`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <h4 className={\`font-medium \${isUrgent ? "text-amber-900" : "text-blue-900"}\`}>
            {daysLeft === 1
              ? "Trial ends tomorrow"
              : \`Trial ends in \${daysLeft} days\`}
          </h4>
          <p className={\`mt-1 text-sm \${isUrgent ? "text-amber-800" : "text-blue-800"}\`}>
            {isUrgent
              ? "Don't lose access to premium features. Upgrade now to keep your subscription active."
              : "You're on a trial. Upgrade anytime to continue using all features."}
          </p>
          <button
            onClick={onUpgrade}
            className={\`mt-3 inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium \${
              isUrgent
                ? "bg-amber-600 text-white hover:bg-amber-700"
                : "bg-white text-blue-700 border border-blue-300 hover:bg-blue-50"
            }\`}
          >
            Upgrade Now
          </button>
        </div>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="rounded p-1 opacity-70 transition-opacity hover:opacity-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
`;
}
function getIndexTemplate() {
  return `export { PricingTable } from "./pricing-table";
export { UpgradeButton } from "./upgrade-button";
export { UsageMeter } from "./usage-meter";
export { CurrentPlanBadge } from "./current-plan";
export { BillingPortalButton } from "./billing-portal-button";
export { SubscriptionGate } from "./subscription-gate";
export { TrialBanner } from "./trial-banner";
`;
}

// src/utils/templates.ts
async function writeTemplateFile(filePath, content, description) {
  try {
    await fs3.ensureDir(path3.dirname(filePath));
    await fs3.writeFile(filePath, content, "utf-8");
    const exists = await fs3.pathExists(filePath);
    if (!exists) {
      throw new Error(`Verification failed: ${filePath} was not created`);
    }
    const stats = await fs3.stat(filePath);
    console.log(chalk2.gray(`  \u2713 ${description} (${stats.size} bytes)`));
  } catch (error) {
    console.error(chalk2.red(`  \u2717 Failed to write ${description}:`));
    console.error(chalk2.red(`    ${filePath}`));
    if (error instanceof Error) {
      console.error(chalk2.red(`    ${error.message}`));
    }
    throw error;
  }
}
async function installTemplates(templateType, products, projectCwd) {
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
      break;
    default:
      throw new Error(`Unknown template: ${templateType}`);
  }
}
async function installSaasTemplate(cwd, products) {
  console.log(chalk2.blue("\n\u{1F4C4} Creating SaaS template pages..."));
  await addCommand("all", { path: "components/billing", cwd });
  const proProduct = products.find((p) => p.name === "Pro");
  const enterpriseProduct = products.find((p) => p.name === "Enterprise");
  const proPriceId = proProduct?.priceId || "price_placeholder_pro";
  const enterprisePriceId = enterpriseProduct?.priceId || "price_placeholder_enterprise";
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
                    onClick={() => copyToClipboard("npx @drew/billing doctor")}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#e7e5e4] bg-[#fafaf9] px-3 py-2 text-sm font-mono text-[#57534e] hover:border-[#b8860b]/50 transition-all"
                  >
                    <Terminal className="h-3.5 w-3.5 text-[#a8a29e]" />
                    npx @drew/billing doctor
                    {copiedCommand === "npx @drew/billing doctor" && (
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
    path3.join(cwd, "app/page.tsx"),
    mainPage,
    "Main landing page with setup guide"
  );
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
    path3.join(cwd, "app/pricing/page.tsx"),
    pricingPage,
    "Pricing page"
  );
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
    path3.join(cwd, "app/billing/page.tsx"),
    billingPage,
    "Billing dashboard page"
  );
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
    path3.join(cwd, "app/demo/page.tsx"),
    demoPage,
    "Demo/playground page"
  );
  console.log(chalk2.green("\u2705 SaaS template files created successfully\n"));
}
async function installApiTemplate(cwd, _products) {
  console.log(chalk2.blue("\n\u{1F4C4} Creating API template pages..."));
  await addCommand("usage-meter", { path: "components/billing", cwd });
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
    path3.join(cwd, "app/page.tsx"),
    mainPage,
    "Main page with setup guide"
  );
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
    path3.join(cwd, "app/api/example/route.ts"),
    apiRoute,
    "Example API route"
  );
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
    path3.join(cwd, "middleware.ts"),
    middleware,
    "API middleware"
  );
  console.log(chalk2.green("\u2705 API template files created successfully\n"));
}
async function installUsageTemplate(cwd, _products) {
  console.log(chalk2.blue("\n\u{1F4C4} Creating Usage template pages..."));
  await addCommand("usage-meter", { path: "components/billing", cwd });
  await addCommand("upgrade-button", { path: "components/billing", cwd });
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
    path3.join(cwd, "app/page.tsx"),
    mainPage,
    "Main page with usage setup guide"
  );
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
    path3.join(cwd, "app/dashboard/page.tsx"),
    dashboardPage,
    "Usage dashboard page"
  );
  console.log(chalk2.green("\u2705 Usage template files created successfully\n"));
}

// src/utils/env.ts
import fs4 from "fs-extra";
import path4 from "path";
async function updateEnvFile(vars) {
  const envPath = path4.join(process.cwd(), ".env.local");
  let content = "";
  try {
    content = await fs4.readFile(envPath, "utf-8");
  } catch {
  }
  for (const [key, value] of Object.entries(vars)) {
    const line = `${key}=${value}`;
    if (content.includes(`${key}=`)) {
      content = content.replace(new RegExp(`${key}=.*`), line);
    } else {
      content += content.endsWith("\n") ? "" : "\n";
      content += `${line}
`;
    }
  }
  await fs4.writeFile(envPath, content);
}

// src/utils/package-manager.ts
import fs5 from "fs-extra";
import path5 from "path";
import { execa } from "execa";
async function detectPackageManager() {
  const cwd = process.cwd();
  if (await fs5.pathExists(path5.join(cwd, "bun.lockb")) || await fs5.pathExists(path5.join(cwd, "bun.lock"))) {
    return "bun";
  }
  if (await fs5.pathExists(path5.join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm";
  }
  if (await fs5.pathExists(path5.join(cwd, "yarn.lock"))) {
    return "yarn";
  }
  return "npm";
}

// src/utils/telemetry.ts
import { createHash } from "crypto";
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import chalk3 from "chalk";
var TELEMETRY_DIR = join(homedir(), ".drew-billing");
var TELEMETRY_FILE = join(TELEMETRY_DIR, "telemetry.json");
var TELEMETRY_ENDPOINT = process.env.TELEMETRY_ENDPOINT || "";
function getMachineId() {
  const data = `${homedir()}_${process.platform}_${process.arch}`;
  return createHash("sha256").update(data).digest("hex").substring(0, 16);
}
function loadTelemetryConfig() {
  try {
    if (existsSync(TELEMETRY_FILE)) {
      const data = JSON.parse(readFileSync(TELEMETRY_FILE, "utf-8"));
      return {
        enabled: data.enabled ?? false,
        machineId: data.machineId || getMachineId(),
        optedInAt: data.optedInAt
      };
    }
  } catch {
  }
  return {
    enabled: false,
    machineId: getMachineId()
  };
}
function saveTelemetryConfig(config) {
  try {
    if (!existsSync(TELEMETRY_DIR)) {
      mkdirSync(TELEMETRY_DIR, { recursive: true });
    }
    writeFileSync(TELEMETRY_FILE, JSON.stringify(config, null, 2));
  } catch {
  }
}
function enableTelemetry() {
  const config = loadTelemetryConfig();
  config.enabled = true;
  config.optedInAt = (/* @__PURE__ */ new Date()).toISOString();
  saveTelemetryConfig(config);
}
function disableTelemetry() {
  const config = loadTelemetryConfig();
  config.enabled = false;
  saveTelemetryConfig(config);
}
function generateSessionId() {
  return `cli_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
}
function trackEvent(type, metadata) {
  const config = loadTelemetryConfig();
  if (!config.enabled) return;
  const event = {
    type,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    machineId: config.machineId,
    sessionId: generateSessionId(),
    cliVersion: "1.0.0",
    metadata
  };
  sendEvent(event).catch(() => {
  });
}
function trackTiming(event, durationMs, metadata) {
  trackEvent(event, { ...metadata, durationMs });
}
async function sendEvent(event) {
  if (!TELEMETRY_ENDPOINT) {
    if (process.env.DEBUG === "true") {
      console.log("[Telemetry]", event);
    }
    return;
  }
  try {
    await fetch(TELEMETRY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event)
    });
  } catch {
  }
}
var FunnelStage = {
  CLI_INSTALL: "cli_install",
  INIT_STARTED: "init_started",
  INIT_COMPLETED: "init_completed",
  SANDBOX_STARTED: "sandbox_started",
  FIRST_CHECKOUT: "first_checkout",
  FIRST_SUBSCRIPTION: "first_subscription"
};
function trackFunnel(stage, metadata) {
  trackEvent(`funnel_${stage}`, metadata);
}

// src/utils/feedback.ts
import chalk4 from "chalk";
import inquirer from "inquirer";
async function promptForFeedback(eventType, metadata) {
  console.log();
  console.log(chalk4.blue.bold("\u{1F4E3} Quick Feedback"));
  console.log(chalk4.gray("Your feedback helps us improve."));
  console.log();
  try {
    const { wasEasy } = await inquirer.prompt([
      {
        type: "confirm",
        name: "wasEasy",
        message: "Was this easy to set up?",
        default: true
      }
    ]);
    let feedbackText;
    if (!wasEasy) {
      const { feedback } = await inquirer.prompt([
        {
          type: "input",
          name: "feedback",
          message: "What was difficult? (optional, 1 sentence)"
        }
      ]);
      feedbackText = feedback;
    }
    trackEvent("feedback_collected", {
      eventType,
      rating: wasEasy ? "positive" : "negative",
      feedback: feedbackText,
      ...metadata
    });
    console.log();
    if (wasEasy) {
      console.log(chalk4.green("\u2728 Thanks! Glad it went smoothly."));
    } else {
      console.log(chalk4.yellow("\u{1F4DD} Thanks for the feedback \u2014 we'll use it to improve."));
    }
    console.log();
  } catch {
  }
}

// src/commands/init.ts
async function initCommand(options) {
  console.log(chalk5.blue.bold("\n\u26A1 @drew/billing init\n"));
  trackFunnel(FunnelStage.INIT_STARTED, { template: options.template });
  const initStartTime = Date.now();
  const cwd = process.cwd();
  const isEmptyDir = await isDirectoryEmpty(cwd);
  const hasPackageJson = await fs6.pathExists(path6.join(cwd, "package.json"));
  console.log(chalk5.gray(`Debug: cwd=${cwd}, isEmptyDir=${isEmptyDir}, hasPackageJson=${hasPackageJson}`));
  let pkgManager = "npm";
  let projectName = path6.basename(cwd);
  let detectedFramework = { name: "nextjs" };
  let projectScaffolded = false;
  if (isEmptyDir || !hasPackageJson) {
    console.log(chalk5.yellow("\u{1F4C1} No existing project detected."));
    let shouldScaffold = options.yes;
    if (!options.yes) {
      const answer = await inquirer2.prompt([
        {
          type: "confirm",
          name: "shouldScaffold",
          message: "Create a new Next.js project here?",
          default: true
        }
      ]);
      shouldScaffold = answer.shouldScaffold;
    }
    if (!shouldScaffold) {
      console.log(chalk5.gray("\nAborted. Please run this in an existing Next.js project directory.\n"));
      process.exit(0);
    }
    const scaffoldResult = await scaffoldNextJsProject(cwd, options.yes);
    if (!scaffoldResult.success) {
      console.log(chalk5.red("\n\u274C Failed to scaffold Next.js project."));
      console.log(chalk5.gray("Please try manually: npx create-next-app@latest .\n"));
      process.exit(1);
    }
    pkgManager = scaffoldResult.pkgManager;
    projectName = scaffoldResult.projectName;
    projectScaffolded = true;
    detectedFramework = { name: "nextjs", version: "latest" };
    console.log(chalk5.green(`
\u2705 Created Next.js project: ${projectName}
`));
    const hasPackageJsonAfter = await fs6.pathExists(path6.join(cwd, "package.json"));
    if (!hasPackageJsonAfter) {
      console.log(chalk5.red("\n\u274C Scaffolded project missing package.json"));
      process.exit(1);
    }
  } else {
    const spinner = ora2("Detecting framework...").start();
    const framework = await detectFramework();
    detectedFramework = { name: framework.name, version: framework.version };
    if (framework.name !== "nextjs") {
      spinner.warn(`Detected: ${framework.name} (limited support)`);
      console.log(chalk5.yellow("\n\u26A0\uFE0F  Currently only Next.js is fully supported."));
      console.log(chalk5.gray("Other frameworks coming soon: React, Vue, Svelte, Express\n"));
      const { continueAnyway } = await inquirer2.prompt([
        {
          type: "confirm",
          name: "continueAnyway",
          message: "Continue with manual setup?",
          default: false
        }
      ]);
      if (!continueAnyway) {
        console.log(chalk5.gray("\nAborted.\n"));
        process.exit(0);
      }
    } else {
      spinner.succeed(`Detected: ${chalk5.green("Next.js")} ${framework.version || ""}`);
    }
    pkgManager = await detectPackageManager();
  }
  console.log(chalk5.gray(`Using package manager: ${pkgManager}
`));
  let config;
  if (options.yes) {
    config = {
      stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
      stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
      databaseUrl: process.env.DATABASE_URL || "",
      template: options.template || "saas",
      createProducts: !options.skipStripe
    };
  } else {
    const answers = await inquirer2.prompt([
      {
        type: "input",
        name: "stripeSecretKey",
        message: "Stripe Secret Key (sk_test_...):",
        default: process.env.STRIPE_SECRET_KEY,
        validate: (input) => input.startsWith("sk_test_") || input.startsWith("sk_live_") ? true : "Must start with sk_test_ or sk_live_"
      },
      {
        type: "input",
        name: "stripePublishableKey",
        message: "Stripe Publishable Key (pk_test_...):",
        default: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        validate: (input) => input.startsWith("pk_test_") || input.startsWith("pk_live_") ? true : "Must start with pk_test_ or pk_live_"
      },
      {
        type: "input",
        name: "databaseUrl",
        message: "Database URL (postgresql://...):",
        default: process.env.DATABASE_URL,
        validate: (input) => {
          if (!input || input.trim() === "") {
            return "Database URL is required (use your Neon or local Postgres URL)";
          }
          if (!input.startsWith("postgresql://") && !input.startsWith("postgres://")) {
            return "Must start with postgresql:// or postgres://";
          }
          return true;
        }
      },
      {
        type: "list",
        name: "template",
        message: "Choose your template:",
        choices: [
          { name: "SaaS Starter (pricing page + auth + dashboard)", value: "saas" },
          { name: "API Billing (usage-based pricing)", value: "api" },
          { name: "Simple Usage (metered billing)", value: "usage" },
          { name: "Minimal (just the SDK)", value: "minimal" }
        ],
        default: options.template || "saas"
      },
      {
        type: "confirm",
        name: "createProducts",
        message: "Create Stripe products automatically?",
        default: !options.skipStripe
      }
    ]);
    config = { ...answers, webhookSecret: "" };
  }
  console.log(chalk5.blue.bold("\n\u{1F4E6} Setting up @drew/billing...\n"));
  const results = {
    projectScaffolded,
    dependencies: false,
    stripeProducts: false,
    database: false,
    templates: false,
    env: false
  };
  const errors = [];
  const depsSpinner = ora2("Installing core dependencies...").start();
  try {
    await installWithRetry(["stripe"], pkgManager, depsSpinner, false, 2, cwd);
    depsSpinner.succeed("Core dependencies installed");
    results.dependencies = true;
  } catch (error) {
    depsSpinner.fail("Failed to install core dependencies");
    const errorMsg = error instanceof Error ? error.message : String(error);
    errors.push(`Dependencies: ${errorMsg}`);
    console.log(chalk5.gray(`Run manually: ${pkgManager} ${pkgManager === "npm" ? "install" : "add"} stripe`));
  }
  const dbDepsSpinner = ora2("Installing database dependencies...").start();
  try {
    await installWithRetry(
      ["drizzle-orm", "@neondatabase/serverless", "drizzle-kit"],
      pkgManager,
      dbDepsSpinner,
      false,
      2,
      cwd
    );
    dbDepsSpinner.succeed("Database dependencies installed");
  } catch (error) {
    dbDepsSpinner.fail("Failed to install database dependencies");
    const errorMsg = error instanceof Error ? error.message : String(error);
    errors.push(`DB Dependencies: ${errorMsg}`);
    console.log(chalk5.gray(`Run manually: ${pkgManager} ${pkgManager === "npm" ? "install" : "add"} drizzle-orm @neondatabase/serverless drizzle-kit`));
  }
  const devDepsSpinner = ora2("Installing dev dependencies...").start();
  try {
    await installWithRetry(["@types/node", "typescript"], pkgManager, devDepsSpinner, true, 2, cwd);
    devDepsSpinner.succeed("Dev dependencies installed");
  } catch {
    devDepsSpinner.warn("Some dev dependencies may need manual installation");
  }
  console.log(chalk5.gray("\nNote: @drew/billing-sdk will be available when published. For now, the CLI provides all needed components.\n"));
  let products = [];
  if (config.createProducts && config.stripeSecretKey) {
    const productSpinner = ora2("Creating Stripe products...").start();
    try {
      if (!config.stripeSecretKey.startsWith("sk_test_") && !config.stripeSecretKey.startsWith("sk_live_")) {
        throw new Error("Invalid Stripe secret key format");
      }
      products = await createStripeProducts(config.stripeSecretKey);
      productSpinner.succeed(`Created ${products.length} Stripe products`);
      results.stripeProducts = true;
    } catch (error) {
      productSpinner.fail("Failed to create Stripe products");
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(`Stripe products: ${errorMsg}`);
      console.log(chalk5.gray("You can create them manually in the Stripe Dashboard"));
      console.log(chalk5.gray("Then update the price IDs in your code"));
      products = [
        { id: "prod_fallback", name: "Pro", priceId: "price_fallback_pro" },
        { id: "prod_fallback_2", name: "Enterprise", priceId: "price_fallback_enterprise" }
      ];
    }
  }
  const dbSpinner = ora2("Setting up database...").start();
  try {
    await ensureDrizzleConfig(cwd);
    await setupDatabaseWithFallback(cwd, pkgManager, dbSpinner);
    dbSpinner.succeed("Database configured");
    results.database = true;
  } catch (error) {
    dbSpinner.fail("Database setup failed");
    const errorMsg = error instanceof Error ? error.message : String(error);
    errors.push(`Database: ${errorMsg}`);
    console.log(chalk5.gray("You can set up the database later by running:"));
    console.log(chalk5.gray("  npx drizzle-kit push"));
    console.log(chalk5.gray("\nMake sure to set DATABASE_URL in your .env.local file"));
  }
  const templateSpinner = ora2(`Installing ${config.template} template...`).start();
  try {
    await fs6.ensureDir(path6.join(cwd, "app"));
    await fs6.ensureDir(path6.join(cwd, "components"));
    await installTemplates(config.template, products, cwd);
    templateSpinner.succeed(`Template installed`);
    results.templates = true;
  } catch (error) {
    templateSpinner.fail("Template installation failed");
    const errorMsg = error instanceof Error ? error.message : String(error);
    errors.push(`Templates: ${errorMsg}`);
    console.log(chalk5.gray("Try running:"));
    console.log(chalk5.gray("  npx @drew/billing add all"));
  }
  const envSpinner = ora2("Updating environment variables...").start();
  try {
    const envVars = {
      STRIPE_SECRET_KEY: config.stripeSecretKey,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: config.stripePublishableKey,
      STRIPE_WEBHOOK_SECRET: config.webhookSecret || "whsec_... (run: stripe listen --forward-to localhost:3000/api/webhooks/stripe)",
      DATABASE_URL: config.databaseUrl || "postgresql://username:password@localhost:5432/database_name",
      BILLING_API_URL: "http://localhost:3000"
    };
    await updateEnvFile(envVars);
    envSpinner.succeed("Environment variables configured");
    results.env = true;
  } catch (error) {
    envSpinner.fail("Failed to update .env");
    const errorMsg = error instanceof Error ? error.message : String(error);
    errors.push(`Environment: ${errorMsg}`);
  }
  const initDuration = Date.now() - initStartTime;
  trackFunnel(FunnelStage.INIT_COMPLETED, {
    template: config.template,
    durationMs: initDuration,
    framework: detectedFramework.name,
    success: Object.values(results).every((r) => r)
  });
  trackTiming("init_complete", initDuration);
  console.log(chalk5.green.bold("\n\u2705 Setup complete!\n"));
  if (errors.length > 0) {
    console.log(chalk5.yellow("\u26A0\uFE0F  Some steps failed:"));
    errors.forEach((err) => console.log(chalk5.gray(`  \u2022 ${err}`)));
    console.log();
  }
  console.log(chalk5.white("Next steps:\n"));
  if (results.projectScaffolded) {
    console.log(chalk5.gray("1."), "Navigate to your project:", chalk5.cyan(`cd ${projectName}`));
    console.log(chalk5.gray("2."), "Start your dev server:", chalk5.cyan(`${pkgManager === "npm" ? "npm run" : pkgManager} dev`));
    console.log(chalk5.gray("3."), "Start Stripe webhook listener:", chalk5.cyan("stripe listen --forward-to http://localhost:3000/api/stripe/webhook"));
  } else {
    console.log(chalk5.gray("1."), "Start your dev server:", chalk5.cyan(`${pkgManager === "npm" ? "npm run" : pkgManager} dev`));
    console.log(chalk5.gray("2."), "Start Stripe webhook listener:", chalk5.cyan("stripe listen --forward-to http://localhost:3000/api/stripe/webhook"));
  }
  if (results.templates) {
    const stepNum = results.projectScaffolded ? "4" : "3";
    console.log(chalk5.gray(`${stepNum}.`), "Visit", chalk5.cyan("http://localhost:3000/pricing"));
  }
  if (!results.database) {
    console.log(chalk5.gray("\n\u26A0\uFE0F  Database not configured. Add DATABASE_URL to .env.local and run:"));
    console.log(chalk5.gray("   npx drizzle-kit push"));
  }
  console.log();
  console.log(chalk5.gray("Documentation:"), chalk5.underline("https://github.com/drewsephski/monetize/tree/main/packages/cli#readme"));
  console.log(chalk5.gray("Diagnostics:"), chalk5.cyan("npx drew-billing-cli doctor"));
  console.log(chalk5.gray("Support:"), chalk5.underline("https://github.com/drewsephski/monetize/issues"));
  console.log();
  if (products.length > 0 && results.stripeProducts) {
    console.log(chalk5.gray("Created Stripe products:"));
    products.forEach((p) => {
      console.log(chalk5.gray(`  \u2022 ${p.name}: ${p.priceId}`));
    });
    console.log();
  } else if (products.length > 0) {
    console.log(chalk5.gray("Placeholder product IDs (update these in your code):"));
    products.forEach((p) => {
      console.log(chalk5.gray(`  \u2022 ${p.name}: ${p.priceId}`));
    });
    console.log();
  }
  console.log(chalk5.blue("\u{1F4CA} Help improve @drew/billing"));
  console.log(chalk5.gray("Enable anonymous telemetry to help us fix bugs faster."));
  console.log(chalk5.gray("Run: npx @drew/billing telemetry --enable\n"));
  await promptForFeedback("init_completed", {
    template: config.template,
    framework: detectedFramework.name,
    durationMs: initDuration,
    results
  });
}
async function isDirectoryEmpty(dir) {
  try {
    const files = await fs6.readdir(dir);
    const relevantFiles = files.filter((f) => !f.startsWith(".") && f !== "node_modules");
    return relevantFiles.length === 0;
  } catch {
    return true;
  }
}
async function scaffoldNextJsProject(cwd, yesMode = false) {
  const projectName = path6.basename(cwd);
  let pkgManager = "npm";
  try {
    await execa2("bun", ["--version"], { stdio: "pipe" });
    pkgManager = "bun";
  } catch {
    try {
      await execa2("pnpm", ["--version"], { stdio: "pipe" });
      pkgManager = "pnpm";
    } catch {
      try {
        await execa2("yarn", ["--version"], { stdio: "pipe" });
        pkgManager = "yarn";
      } catch {
      }
    }
  }
  const spinner = ora2(`Creating Next.js project with ${pkgManager}...`).start();
  try {
    const createNextAppCmd = pkgManager === "npm" ? "npx" : pkgManager;
    const args = [
      ...pkgManager === "npm" ? ["create-next-app@latest"] : ["create", "next-app"],
      ".",
      // Use current directory, not a subdirectory
      "--typescript",
      "--tailwind",
      "--eslint",
      "--app",
      "--src-dir=false",
      "--import-alias",
      "@/*",
      ...yesMode ? ["--yes"] : []
    ];
    await execa2(createNextAppCmd, args, {
      cwd,
      stdio: "pipe",
      timeout: 3e5
      // 5 minute timeout
    });
    spinner.succeed("Next.js project created");
    return { success: true, pkgManager, projectName };
  } catch {
    spinner.fail("Failed to create Next.js project");
    if (pkgManager !== "npm") {
      spinner.text = "Retrying with npm...";
      spinner.start();
      try {
        await execa2("npx", [
          "create-next-app@latest",
          ".",
          // Use current directory
          "--typescript",
          "--tailwind",
          "--eslint",
          "--app",
          "--src-dir=false",
          "--import-alias",
          "@/*",
          ...yesMode ? ["--yes"] : []
        ], {
          cwd,
          stdio: "pipe",
          timeout: 3e5
        });
        spinner.succeed("Next.js project created with npm");
        return { success: true, pkgManager: "npm", projectName };
      } catch {
        spinner.fail("All attempts failed");
        return { success: false, pkgManager: "npm", projectName };
      }
    }
    return { success: false, pkgManager, projectName };
  }
}
async function installWithRetry(packages, pkgManager, spinner, dev = false, maxRetries = 2, projectCwd) {
  const installCmd = pkgManager === "npm" ? "install" : "add";
  const devFlag = dev ? pkgManager === "npm" ? "--save-dev" : "-D" : "";
  const args = [installCmd, ...packages, ...devFlag ? [devFlag] : []];
  const cwd = projectCwd || process.cwd();
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      spinner.text = `Installing dependencies (attempt ${attempt}/${maxRetries})...`;
      await execa2(pkgManager, args, {
        cwd,
        stdio: "pipe",
        timeout: 12e4
        // 2 minute timeout
      });
      return;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(chalk5.gray(`  Install attempt ${attempt} failed: ${errorMsg.substring(0, 100)}`));
      if (attempt === maxRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 2e3));
    }
  }
}
async function ensureDrizzleConfig(cwd) {
  const drizzleConfigPath = path6.join(cwd, "drizzle.config.ts");
  if (await fs6.pathExists(drizzleConfigPath)) {
    return;
  }
  if (await fs6.pathExists(path6.join(cwd, "drizzle.config.js"))) {
    return;
  }
  const configContent = `import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
`;
  await fs6.writeFile(drizzleConfigPath, configContent);
  const schemaDir = path6.join(cwd, "drizzle");
  await fs6.ensureDir(schemaDir);
  const schemaContent = `import { pgTable, serial, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("inactive"),
  plan: varchar("plan", { length: 50 }).notNull().default("free"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usageRecords = pgTable("usage_records", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  feature: varchar("feature", { length: 100 }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  recordedAt: timestamp("recorded_at").defaultNow(),
  metadata: jsonb("metadata"),
});
`;
  await fs6.writeFile(path6.join(schemaDir, "schema.ts"), schemaContent);
}
async function setupDatabaseWithFallback(cwd, _pkgManager, spinner) {
  try {
    spinner.text = "Running database migrations...";
    await execa2("npx", ["drizzle-kit", "push", "--force"], {
      cwd,
      stdio: "pipe",
      timeout: 6e4,
      env: { ...process.env, SKIP_ENV_VALIDATION: "true" }
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (errorMsg.includes("DATABASE_URL") || errorMsg.includes("database")) {
      throw new Error("DATABASE_URL not configured. Please add it to .env.local");
    }
    throw error;
  }
}

// src/commands/verify.ts
import chalk6 from "chalk";
import ora3 from "ora";
import fs7 from "fs-extra";
import path7 from "path";
async function verifyCommand() {
  console.log(chalk6.blue.bold("\n\u{1F50D} @drew/billing verify\n"));
  console.log(chalk6.gray("Checking your billing setup...\n"));
  const results = [];
  const envSpinner = ora3("Checking environment variables...").start();
  try {
    const envPath = path7.join(process.cwd(), ".env.local");
    const envExists = await fs7.pathExists(envPath);
    if (!envExists) {
      results.push({
        name: "Environment File",
        status: "fail",
        message: ".env.local not found"
      });
      envSpinner.fail();
    } else {
      const envContent = await fs7.readFile(envPath, "utf-8");
      const requiredVars = [
        "STRIPE_SECRET_KEY",
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
      ];
      const missing = requiredVars.filter((v) => !envContent.includes(v));
      if (missing.length > 0) {
        results.push({
          name: "Environment Variables",
          status: "fail",
          message: `Missing: ${missing.join(", ")}`
        });
        envSpinner.fail();
      } else {
        results.push({
          name: "Environment Variables",
          status: "pass",
          message: "All required variables present"
        });
        envSpinner.succeed();
      }
    }
  } catch {
    results.push({
      name: "Environment Variables",
      status: "fail",
      message: "Could not read .env file"
    });
    envSpinner.fail();
  }
  const stripeSpinner = ora3("Checking Stripe connection...").start();
  try {
    const Stripe2 = (await import("stripe")).default;
    const stripe = new Stripe2(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16"
    });
    const account = await stripe.accounts.retrieve();
    results.push({
      name: "Stripe API",
      status: "pass",
      message: `Connected to ${account.settings?.dashboard?.display_name || "Stripe account"}`
    });
    stripeSpinner.succeed();
  } catch {
    results.push({
      name: "Stripe API",
      status: "fail",
      message: "Could not connect to Stripe API"
    });
    stripeSpinner.fail();
  }
  const dbSpinner = ora3("Checking database...").start();
  try {
    const hasDrizzleConfig = await fs7.pathExists(
      path7.join(process.cwd(), "drizzle.config.ts")
    );
    const hasSchema = await fs7.pathExists(
      path7.join(process.cwd(), "drizzle/schema.ts")
    );
    if (hasDrizzleConfig && hasSchema) {
      results.push({
        name: "Database Setup",
        status: "pass",
        message: "Drizzle ORM configured"
      });
      dbSpinner.succeed();
    } else {
      results.push({
        name: "Database Setup",
        status: "warn",
        message: "Database configuration not detected"
      });
      dbSpinner.warn();
    }
  } catch {
    results.push({
      name: "Database Setup",
      status: "warn",
      message: "Could not verify database setup"
    });
    dbSpinner.warn();
  }
  const apiSpinner = ora3("Checking API routes...").start();
  try {
    const requiredRoutes = [
      "api/checkout/route.ts",
      "api/webhooks/stripe/route.ts",
      "api/entitlements/[userId]/route.ts"
    ];
    const appDir = path7.join(process.cwd(), "app");
    const missingRoutes = [];
    for (const route of requiredRoutes) {
      const fullPath = path7.join(appDir, route);
      if (!await fs7.pathExists(fullPath)) {
        missingRoutes.push(route);
      }
    }
    if (missingRoutes.length > 0) {
      results.push({
        name: "API Routes",
        status: "warn",
        message: `Missing routes: ${missingRoutes.length}`
      });
      apiSpinner.warn();
    } else {
      results.push({
        name: "API Routes",
        status: "pass",
        message: "All required routes present"
      });
      apiSpinner.succeed();
    }
  } catch {
    results.push({
      name: "API Routes",
      status: "warn",
      message: "Could not verify API routes"
    });
    apiSpinner.warn();
  }
  const sdkSpinner = ora3("Checking SDK...").start();
  try {
    const packageJson = await fs7.readJson(path7.join(process.cwd(), "package.json"));
    const hasStripe = packageJson.dependencies?.["stripe"] || packageJson.devDependencies?.["stripe"];
    if (hasStripe) {
      results.push({
        name: "Stripe SDK",
        status: "pass",
        message: "stripe SDK installed"
      });
      sdkSpinner.succeed();
    } else {
      results.push({
        name: "Stripe SDK",
        status: "fail",
        message: "Stripe SDK not found in dependencies"
      });
      sdkSpinner.fail();
    }
  } catch {
    results.push({
      name: "SDK Installation",
      status: "fail",
      message: "Could not check package.json"
    });
    sdkSpinner.fail();
  }
  console.log(chalk6.blue.bold("\n\u{1F4CA} Summary\n"));
  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  results.forEach((result) => {
    const icon = result.status === "pass" ? chalk6.green("\u2713") : result.status === "fail" ? chalk6.red("\u2717") : chalk6.yellow("\u26A0");
    const color = result.status === "pass" ? chalk6.green : result.status === "fail" ? chalk6.red : chalk6.yellow;
    console.log(`${icon} ${color(result.name)}`);
    console.log(chalk6.gray(`  ${result.message}`));
  });
  console.log();
  if (failed === 0) {
    console.log(chalk6.green.bold("\u2705 All checks passed!"));
    console.log(chalk6.gray("Your billing setup looks good."));
  } else if (failed > 0 && passed > 0) {
    console.log(chalk6.yellow.bold("\u26A0\uFE0F  Some checks failed"));
    console.log(chalk6.gray("Review the issues above to complete your setup."));
  } else {
    console.log(chalk6.red.bold("\u274C Setup incomplete"));
    console.log(chalk6.gray("Run: npx @drew/billing init"));
  }
  console.log();
  console.log(chalk6.gray("Next steps:"));
  console.log(chalk6.gray("  \u2022 Start dev server: npm run dev"));
  console.log(chalk6.gray("  \u2022 Start webhook listener: stripe listen --forward-to localhost:3000/api/webhooks/stripe"));
  console.log(chalk6.gray("  \u2022 View docs: https://github.com/drewsephski/monetize/tree/main/packages/cli#readme"));
  console.log();
}

// src/commands/sandbox.ts
import chalk7 from "chalk";
import ora4 from "ora";
import fs8 from "fs-extra";
import path8 from "path";
async function sandboxCommand(options) {
  console.log(chalk7.blue.bold("\n\u{1F3D6}\uFE0F  @drew/billing sandbox\n"));
  const envPath = path8.join(process.cwd(), ".env.local");
  let envContent = "";
  try {
    envContent = await fs8.readFile(envPath, "utf-8");
  } catch (error) {
  }
  let newSandboxState;
  if (options.enable) {
    newSandboxState = true;
  } else if (options.disable) {
    newSandboxState = false;
  } else {
    const currentMatch = envContent.match(/BILLING_SANDBOX_MODE=(true|false)/);
    const currentState = currentMatch ? currentMatch[1] === "true" : false;
    newSandboxState = !currentState;
  }
  const spinner = ora4(
    newSandboxState ? "Enabling sandbox mode..." : "Disabling sandbox mode..."
  ).start();
  try {
    if (envContent.includes("BILLING_SANDBOX_MODE=")) {
      envContent = envContent.replace(
        /BILLING_SANDBOX_MODE=(true|false)/,
        `BILLING_SANDBOX_MODE=${newSandboxState}`
      );
    } else {
      envContent += `
# Sandbox mode - no real charges
BILLING_SANDBOX_MODE=${newSandboxState}
`;
    }
    await fs8.writeFile(envPath, envContent);
    spinner.succeed();
  } catch (error) {
    spinner.fail("Failed to update sandbox mode");
    console.log(error);
    process.exit(1);
  }
  if (newSandboxState) {
    console.log(chalk7.green.bold("\n\u2705 Sandbox mode ENABLED\n"));
    console.log(chalk7.gray("What this means:"));
    console.log(chalk7.gray("  \u2022 No real charges will be processed"));
    console.log(chalk7.gray("  \u2022 Stripe test mode API keys used"));
    console.log(chalk7.gray("  \u2022 Webhooks simulated locally"));
    console.log(chalk7.gray("  \u2022 Usage tracked but not billed"));
    console.log();
    console.log(chalk7.yellow("Perfect for development and testing!"));
  } else {
    console.log(chalk7.yellow.bold("\n\u26A0\uFE0F  Sandbox mode DISABLED\n"));
    console.log(chalk7.gray("What this means:"));
    console.log(chalk7.gray("  \u2022 Real charges will be processed"));
    console.log(chalk7.gray("  \u2022 Stripe live mode API keys required"));
    console.log(chalk7.gray("  \u2022 Production webhooks active"));
    console.log();
    console.log(chalk7.red("Make sure you have live Stripe keys configured!"));
  }
  console.log();
  console.log(chalk7.gray("Switch back anytime:"));
  console.log(chalk7.cyan(`  npx @drew/billing sandbox`));
  console.log();
}

// src/commands/whoami.ts
import chalk8 from "chalk";
import fs9 from "fs-extra";
import path9 from "path";
async function whoamiCommand() {
  console.log(chalk8.blue.bold("\n\u{1F464} @drew/billing whoami\n"));
  try {
    const packageJson = await fs9.readJson(path9.join(process.cwd(), "package.json"));
    console.log(chalk8.gray("Project:"), chalk8.white(packageJson.name || "Unknown"));
    console.log(chalk8.gray("Version:"), chalk8.white(packageJson.version || "Unknown"));
  } catch (error) {
    console.log(chalk8.gray("Project:"), chalk8.yellow("Could not read package.json"));
  }
  const envPath = path9.join(process.cwd(), ".env.local");
  const envVars = {};
  try {
    const envContent = await fs9.readFile(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^([A-Z_]+)=(.+)$/);
      if (match) {
        envVars[match[1]] = match[2].replace(/^["']/, "").replace(/["']$/, "");
      }
    });
  } catch (error) {
  }
  console.log();
  console.log(chalk8.gray("Environment:"));
  const stripeKey = envVars.STRIPE_SECRET_KEY || "";
  const isTestMode = stripeKey.startsWith("sk_test_");
  const isLiveMode = stripeKey.startsWith("sk_live_");
  if (isTestMode) {
    console.log(chalk8.gray("  Stripe:"), chalk8.yellow("TEST MODE"));
  } else if (isLiveMode) {
    console.log(chalk8.gray("  Stripe:"), chalk8.green("LIVE MODE \u26A0\uFE0F"));
  } else {
    console.log(chalk8.gray("  Stripe:"), chalk8.red("Not configured"));
  }
  const sandboxMode = envVars.BILLING_SANDBOX_MODE === "true";
  console.log(
    chalk8.gray("  Sandbox:"),
    sandboxMode ? chalk8.green("Enabled") : chalk8.gray("Disabled")
  );
  const apiUrl = envVars.NEXT_PUBLIC_BILLING_API_URL || envVars.BILLING_API_URL;
  console.log(chalk8.gray("  API URL:"), apiUrl || chalk8.red("Not set"));
  try {
    const packageJson = await fs9.readJson(path9.join(process.cwd(), "package.json"));
    const sdkVersion = packageJson.dependencies?.["@drew/billing-sdk"] || packageJson.devDependencies?.["@drew/billing-sdk"];
    if (sdkVersion) {
      console.log(chalk8.gray("  SDK:"), sdkVersion);
    } else {
      console.log(chalk8.gray("  SDK:"), chalk8.red("Not installed"));
    }
  } catch (error) {
  }
  console.log();
  const componentsPath = path9.join(process.cwd(), "components/billing");
  try {
    const components = await fs9.readdir(componentsPath);
    const componentFiles = components.filter((f) => f.endsWith(".tsx"));
    if (componentFiles.length > 0) {
      console.log(chalk8.gray("Installed Components:"));
      componentFiles.forEach((file) => {
        console.log(chalk8.gray("  \u2022"), file.replace(".tsx", ""));
      });
    } else {
      console.log(chalk8.gray("Components:"), chalk8.yellow("None installed"));
      console.log(chalk8.gray("  Install with: npx @drew/billing add <component>"));
    }
  } catch (error) {
    console.log(chalk8.gray("Components:"), chalk8.yellow("None installed"));
  }
  console.log();
  const hasDrizzleConfig = await fs9.pathExists(
    path9.join(process.cwd(), "drizzle.config.ts")
  );
  console.log(
    chalk8.gray("Database:"),
    hasDrizzleConfig ? chalk8.green("Configured") : chalk8.yellow("Not configured")
  );
  const apiDir = path9.join(process.cwd(), "app/api");
  const hasCheckout = await fs9.pathExists(path9.join(apiDir, "checkout/route.ts"));
  const hasWebhooks = await fs9.pathExists(path9.join(apiDir, "webhooks/stripe/route.ts"));
  console.log(chalk8.gray("API Routes:"));
  console.log(chalk8.gray("  /api/checkout"), hasCheckout ? chalk8.green("\u2713") : chalk8.red("\u2717"));
  console.log(chalk8.gray("  /api/webhooks/stripe"), hasWebhooks ? chalk8.green("\u2713") : chalk8.red("\u2717"));
  console.log();
  console.log(chalk8.gray("Commands:"));
  console.log(chalk8.gray("  init       Initialize billing"));
  console.log(chalk8.gray("  add        Add UI components"));
  console.log(chalk8.gray("  verify     Verify setup"));
  console.log(chalk8.gray("  sandbox    Toggle sandbox mode"));
  console.log();
}

// src/commands/telemetry.ts
import chalk9 from "chalk";
async function telemetryCommand(options) {
  console.log(chalk9.blue.bold("\n\u{1F4CA} Telemetry Settings\n"));
  const config = loadTelemetryConfig();
  if (options.enable) {
    enableTelemetry();
    console.log(chalk9.green("\u2705 Anonymous telemetry enabled"));
    console.log(chalk9.gray("\nWe collect:"));
    console.log(chalk9.gray("  \u2022 Command usage (init, add, verify, etc.)"));
    console.log(chalk9.gray("  \u2022 Performance metrics (timing)"));
    console.log(chalk9.gray("  \u2022 Error reports (no stack traces with PII)"));
    console.log(chalk9.gray("\nWe NEVER collect:"));
    console.log(chalk9.gray("  \u2022 Personal information"));
    console.log(chalk9.gray("  \u2022 Stripe keys or API credentials"));
    console.log(chalk9.gray("  \u2022 Code or project details"));
    console.log(chalk9.gray("  \u2022 IP addresses"));
    trackEvent("telemetry_enabled");
    return;
  }
  if (options.disable) {
    disableTelemetry();
    console.log(chalk9.yellow("\u274C Anonymous telemetry disabled"));
    console.log(chalk9.gray("You can re-enable anytime with: npx @drew/billing telemetry --enable"));
    return;
  }
  console.log(chalk9.white("Current status:"));
  console.log(`  Enabled: ${config.enabled ? chalk9.green("Yes") : chalk9.red("No")}`);
  if (config.machineId) {
    console.log(`  Machine ID: ${chalk9.gray(config.machineId)}`);
  }
  if (config.optedInAt) {
    console.log(`  Decision date: ${chalk9.gray(config.optedInAt)}`);
  }
  console.log(chalk9.gray("\nUsage:"));
  console.log(chalk9.gray("  npx @drew/billing telemetry --enable   # Enable telemetry"));
  console.log(chalk9.gray("  npx @drew/billing telemetry --disable  # Disable telemetry"));
  console.log(chalk9.gray("  npx @drew/billing telemetry            # Show status\n"));
  if (!config.optedInAt) {
    console.log(chalk9.blue("\u{1F4A1} Why enable telemetry?"));
    console.log(chalk9.gray("Anonymous data helps us improve the CLI and catch bugs faster."));
    console.log(chalk9.gray("No personal information is ever collected.\n"));
  }
}

// src/commands/doctor.ts
import chalk10 from "chalk";
import { readFileSync as readFileSync2, existsSync as existsSync2 } from "fs";
import { join as join2 } from "path";
import { execa as execa3 } from "execa";
async function doctorCommand() {
  console.log(chalk10.blue.bold("\n\u{1F50D} @drew/billing doctor\n"));
  console.log(chalk10.gray("Running diagnostics...\n"));
  const checks = [];
  checks.push(await checkEnvironmentVariables());
  checks.push(await checkApiConnectivity());
  checks.push(await checkWebhookConfig());
  checks.push(await checkDatabaseConnection());
  checks.push(await checkStripeConfig());
  checks.push(await checkDependencies());
  checks.push(await checkFramework());
  displayResults(checks);
}
async function checkEnvironmentVariables() {
  const envPath = join2(process.cwd(), ".env.local");
  const envExamplePath = join2(process.cwd(), ".env.example");
  let envContent = "";
  if (existsSync2(envPath)) {
    envContent = readFileSync2(envPath, "utf-8");
  } else if (existsSync2(join2(process.cwd(), ".env"))) {
    envContent = readFileSync2(join2(process.cwd(), ".env"), "utf-8");
  }
  const requiredVars = [
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET"
  ];
  const missingVars = requiredVars.filter((v) => !envContent.includes(v));
  if (missingVars.length === 0) {
    return {
      name: "Environment Variables",
      status: "pass",
      message: "All required variables configured"
    };
  }
  const hasExample = existsSync2(envExamplePath);
  return {
    name: "Environment Variables",
    status: "fail",
    message: `Missing: ${missingVars.join(", ")}`,
    fix: hasExample ? `cp .env.example .env.local && edit with your Stripe keys` : `Create .env.local with:
${requiredVars.map((v) => `${v}=...`).join("\n")}`
  };
}
async function checkApiConnectivity() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2e3);
    const response = await fetch("http://localhost:3000/api/health", {
      signal: controller.signal
    }).catch(() => null);
    clearTimeout(timeoutId);
    if (response?.ok) {
      return {
        name: "API Connectivity",
        status: "pass",
        message: "Billing API responding at localhost:3000"
      };
    }
    return {
      name: "API Connectivity",
      status: "warn",
      message: "Dev server not running or API not accessible",
      fix: "Start dev server: npm run dev"
    };
  } catch {
    return {
      name: "API Connectivity",
      status: "warn",
      message: "Could not connect to localhost:3000",
      fix: "Start dev server: npm run dev"
    };
  }
}
async function checkWebhookConfig() {
  const envPath = join2(process.cwd(), ".env.local");
  let webhookSecret = "";
  if (existsSync2(envPath)) {
    const content = readFileSync2(envPath, "utf-8");
    const match = content.match(/STRIPE_WEBHOOK_SECRET=(.+)/);
    if (match) webhookSecret = match[1].trim();
  }
  if (!webhookSecret || webhookSecret === "whsec_...") {
    return {
      name: "Webhook Configuration",
      status: "fail",
      message: "Webhook secret not configured",
      fix: "1. Run: stripe listen --forward-to http://localhost:3000/api/stripe/webhook\n2. Copy webhook secret to .env.local"
    };
  }
  if (webhookSecret.startsWith("whsec_")) {
    return {
      name: "Webhook Configuration",
      status: "pass",
      message: "Webhook secret configured"
    };
  }
  return {
    name: "Webhook Configuration",
    status: "warn",
    message: "Webhook secret format looks unusual",
    fix: "Verify STRIPE_WEBHOOK_SECRET starts with 'whsec_'"
  };
}
async function checkDatabaseConnection() {
  try {
    const hasDrizzleConfig = existsSync2(join2(process.cwd(), "drizzle.config.ts"));
    if (!hasDrizzleConfig) {
      return {
        name: "Database Connection",
        status: "fail",
        message: "No Drizzle config found",
        fix: "Run: npx @drew/billing init to set up database"
      };
    }
    try {
      await execa3("npx", ["drizzle-kit", "check"], {
        cwd: process.cwd(),
        timeout: 1e4,
        reject: false
      });
      return {
        name: "Database Connection",
        status: "pass",
        message: "Database configuration found"
      };
    } catch {
      return {
        name: "Database Connection",
        status: "warn",
        message: "Database config exists but connection not verified",
        fix: "Run: npx drizzle-kit push to sync schema"
      };
    }
  } catch {
    return {
      name: "Database Connection",
      status: "warn",
      message: "Could not verify database connection"
    };
  }
}
async function checkStripeConfig() {
  const envPath = join2(process.cwd(), ".env.local");
  let stripeKey = "";
  if (existsSync2(envPath)) {
    const content = readFileSync2(envPath, "utf-8");
    const match = content.match(/STRIPE_SECRET_KEY=(.+)/);
    if (match) stripeKey = match[1].trim();
  }
  if (!stripeKey) {
    return {
      name: "Stripe Configuration",
      status: "fail",
      message: "STRIPE_SECRET_KEY not found",
      fix: "Add STRIPE_SECRET_KEY=sk_test_... to .env.local"
    };
  }
  if (stripeKey.startsWith("sk_test_")) {
    return {
      name: "Stripe Configuration",
      status: "pass",
      message: "Test mode Stripe key configured"
    };
  }
  if (stripeKey.startsWith("sk_live_")) {
    return {
      name: "Stripe Configuration",
      status: "warn",
      message: "\u26A0\uFE0F Live Stripe key detected",
      fix: "Use test keys for development: https://dashboard.stripe.com/test/apikeys"
    };
  }
  return {
    name: "Stripe Configuration",
    status: "fail",
    message: "Invalid Stripe key format",
    fix: "Key should start with sk_test_ or sk_live_"
  };
}
async function checkDependencies() {
  const packagePath = join2(process.cwd(), "package.json");
  if (!existsSync2(packagePath)) {
    return {
      name: "Dependencies",
      status: "fail",
      message: "No package.json found",
      fix: "Run: npm init"
    };
  }
  try {
    const pkg = JSON.parse(readFileSync2(packagePath, "utf-8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const required = ["stripe", "drizzle-orm"];
    const missing = required.filter((d) => !deps[d]);
    if (missing.length === 0) {
      return {
        name: "Dependencies",
        status: "pass",
        message: "All required packages installed"
      };
    }
    return {
      name: "Dependencies",
      status: "fail",
      message: `Missing: ${missing.join(", ")}`,
      fix: `npm install ${missing.join(" ")}`
    };
  } catch {
    return {
      name: "Dependencies",
      status: "warn",
      message: "Could not parse package.json"
    };
  }
}
async function checkFramework() {
  const framework = await detectFramework();
  if (framework.name === "nextjs") {
    return {
      name: "Framework Support",
      status: "pass",
      message: `Next.js ${framework.version || ""} detected`
    };
  }
  return {
    name: "Framework Support",
    status: "warn",
    message: `${framework.name} detected (limited support)`,
    fix: "Next.js is fully supported. Other frameworks have basic support."
  };
}
function displayResults(checks) {
  const passed = checks.filter((c) => c.status === "pass").length;
  const failed = checks.filter((c) => c.status === "fail").length;
  const warnings = checks.filter((c) => c.status === "warn").length;
  console.log(chalk10.white.bold("Results:\n"));
  for (const check of checks) {
    const icon = check.status === "pass" ? chalk10.green("\u2713") : check.status === "fail" ? chalk10.red("\u2717") : chalk10.yellow("\u26A0");
    console.log(`${icon} ${chalk10.white(check.name)}`);
    console.log(`  ${chalk10.gray(check.message)}`);
    if (check.fix) {
      console.log(`  ${chalk10.cyan("Fix:")} ${check.fix}`);
    }
    console.log();
  }
  console.log(chalk10.white.bold("Summary:"));
  console.log(`  ${chalk10.green(`${passed} passing`)}`);
  if (failed > 0) console.log(`  ${chalk10.red(`${failed} failing`)}`);
  if (warnings > 0) console.log(`  ${chalk10.yellow(`${warnings} warnings`)}`);
  if (failed === 0 && warnings === 0) {
    console.log(chalk10.green.bold("\n\u2705 All checks passed! Your billing setup looks good.\n"));
  } else if (failed === 0) {
    console.log(chalk10.yellow("\n\u26A0\uFE0F  Some warnings - review above.\n"));
  } else {
    console.log(chalk10.red(`
\u274C ${failed} issue(s) need attention. Run the suggested fixes above.
`));
    console.log(chalk10.gray("Need help? https://github.com/drewsephski/monetize/issues\n"));
  }
}

// src/index.ts
var program = new Command();
program.name("@drew/billing").description("CLI for @drew/billing - Add subscriptions to your app in 10 minutes").version("1.0.0");
program.command("init").description("Initialize @drew/billing in your Next.js project").option("--skip-stripe", "Skip Stripe product creation").option("--template <type>", "Template type (saas, api, usage)", "saas").option("--yes", "Skip prompts and use defaults").action(initCommand);
program.command("add <component>").description("Add a billing component (pricing-table, upgrade-button, usage-meter)").option("--path <path>", "Custom installation path").action(addCommand);
program.command("verify").description("Verify your billing setup is working correctly").action(verifyCommand);
program.command("sandbox").description("Toggle sandbox mode for testing without real charges").option("--enable", "Enable sandbox mode").option("--disable", "Disable sandbox mode").action(sandboxCommand);
program.command("whoami").description("Show current billing configuration").action(whoamiCommand);
program.command("telemetry").description("Manage anonymous usage telemetry").option("--enable", "Enable telemetry").option("--disable", "Disable telemetry").action(telemetryCommand);
program.command("doctor").description("Diagnose billing setup issues").action(doctorCommand);
if (process.argv.length === 2) {
  console.log(chalk11.blue.bold("\n\u26A1 @drew/billing\n"));
  console.log("Add subscriptions to your app in 10 minutes.\n");
  console.log(chalk11.gray("Quick start:"));
  console.log("  npx @drew/billing init\n");
  console.log(chalk11.gray("Commands:"));
  console.log("  init       Initialize billing in your project");
  console.log("  add        Add prebuilt UI components");
  console.log("  verify     Verify your setup");
  console.log("  sandbox    Toggle sandbox mode");
  console.log("  whoami     Show current configuration");
  console.log("  doctor     Diagnose setup issues");
  console.log("  telemetry  Manage usage telemetry\n");
  console.log(chalk11.gray("Documentation:"));
  console.log("  https://billing.drew.dev/docs\n");
}
program.parse();

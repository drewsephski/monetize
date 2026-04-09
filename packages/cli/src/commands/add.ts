import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";

const COMPONENTS = {
  "pricing-table": {
    name: "PricingTable",
    description: "Beautiful pricing table with Stripe checkout integration",
    files: ["pricing-table.tsx"],
  },
  "upgrade-button": {
    name: "UpgradeButton",
    description: "Smart upgrade button with plan comparison",
    files: ["upgrade-button.tsx"],
  },
  "usage-meter": {
    name: "UsageMeter",
    description: "Real-time usage visualization with limits",
    files: ["usage-meter.tsx"],
  },
  "current-plan": {
    name: "CurrentPlanBadge",
    description: "Shows current plan with upgrade CTA",
    files: ["current-plan.tsx"],
  },
  "billing-portal": {
    name: "BillingPortalButton",
    description: "Opens Stripe customer portal",
    files: ["billing-portal-button.tsx"],
  },
  "subscription-gate": {
    name: "SubscriptionGate",
    description: "Blocks content based on subscription status",
    files: ["subscription-gate.tsx"],
  },
  "trial-banner": {
    name: "TrialBanner",
    description: "Shows trial status and countdown",
    files: ["trial-banner.tsx"],
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
      "index.ts",
    ],
  },
};

interface AddOptions {
  path?: string;
  cwd?: string;
}

export async function addCommand(component: string, options: AddOptions) {
  console.log(chalk.blue.bold("\n📦 drew-billing-cli add\n"));

  const validComponents = Object.keys(COMPONENTS);

  if (!validComponents.includes(component)) {
    console.log(chalk.red(`Invalid component: ${component}\n`));
    console.log(chalk.gray("Available components:"));
    validComponents.forEach((c) => {
      if (c === "all") return;
      const info = COMPONENTS[c as keyof typeof COMPONENTS];
      console.log(chalk.gray(`  • ${c}`) + ` - ${info.description}`);
    });
    console.log(chalk.gray(`  • all - Install all components`));
    console.log();
    process.exit(1);
  }

  const componentInfo = COMPONENTS[component as keyof typeof COMPONENTS];
  const installPath = options.path || "components/billing";
  const cwd = options.cwd || process.cwd();
  const fullPath = path.join(cwd, installPath);

  console.log(chalk.gray(`Installing ${componentInfo.name}...\n`));

  // Ensure directory exists
  await fs.ensureDir(fullPath);

  // Create component files
  const spinner = ora("Creating components...").start();

  try {
    for (const file of componentInfo.files) {
      const content = getComponentTemplate(file);
      await fs.writeFile(path.join(fullPath, file), content);
    }

    spinner.succeed(`Installed ${componentInfo.name} to ${installPath}/`);
  } catch (error) {
    spinner.fail("Failed to install component");
    console.error(error);
    process.exit(1);
  }

  console.log(chalk.green.bold("\n✅ Component installed!\n"));
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

function getComponentTemplate(filename: string): string {
  const templates: Record<string, string> = {
    "pricing-table.tsx": getPricingTableTemplate(),
    "upgrade-button.tsx": getUpgradeButtonTemplate(),
    "usage-meter.tsx": getUsageMeterTemplate(),
    "current-plan.tsx": getCurrentPlanTemplate(),
    "billing-portal-button.tsx": getBillingPortalTemplate(),
    "subscription-gate.tsx": getSubscriptionGateTemplate(),
    "trial-banner.tsx": getTrialBannerTemplate(),
    "index.ts": getIndexTemplate(),
  };

  return templates[filename] || `// ${filename} - Component template\nexport function Placeholder() { return null; }`;
}

function getPricingTableTemplate(): string {
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

function getUpgradeButtonTemplate(): string {
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

function getUsageMeterTemplate(): string {
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

function getCurrentPlanTemplate(): string {
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

function getBillingPortalTemplate(): string {
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

function getSubscriptionGateTemplate(): string {
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

function getTrialBannerTemplate(): string {
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

function getIndexTemplate(): string {
  return `export { PricingTable } from "./pricing-table";
export { UpgradeButton } from "./upgrade-button";
export { UsageMeter } from "./usage-meter";
export { CurrentPlanBadge } from "./current-plan";
export { BillingPortalButton } from "./billing-portal-button";
export { SubscriptionGate } from "./subscription-gate";
export { TrialBanner } from "./trial-banner";
`;
}

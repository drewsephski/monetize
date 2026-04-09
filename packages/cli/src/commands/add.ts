import chalk from "chalk";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { globby } from "globby";

const COMPONENTS = {
  "pricing-table": {
    name: "PricingTable",
    description: "Beautiful pricing table with Stripe checkout integration",
    files: ["pricing-table.tsx", "pricing-table.css"],
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
      "pricing-table.css",
      "upgrade-button.tsx",
      "usage-meter.tsx",
      "current-plan.tsx",
      "billing-portal-button.tsx",
      "subscription-gate.tsx",
      "trial-banner.tsx",
    ],
  },
};

interface AddOptions {
  path?: string;
}

export async function addCommand(component: string, options: AddOptions) {
  console.log(chalk.blue.bold("\n📦 @drew/billing add\n"));

  const validComponents = Object.keys(COMPONENTS);

  if (!validComponents.includes(component)) {
    console.log(chalk.red(`Invalid component: ${component}\n`));
    console.log(chalk.gray("Available components:"));
    validComponents.forEach((c) => {
      const info = COMPONENTS[c as keyof typeof COMPONENTS];
      console.log(chalk.gray(`  • ${c}`) + ` - ${info.description}`);
    });
    console.log();
    process.exit(1);
  }

  const componentInfo = COMPONENTS[component as keyof typeof COMPONENTS];
  const installPath = options.path || "components/billing";
  const fullPath = path.join(process.cwd(), installPath);

  console.log(chalk.gray(`Installing ${componentInfo.name}...\n`));

  // Ensure directory exists
  await fs.ensureDir(fullPath);

  // Copy component files from npm package
  const spinner = ora("Downloading components...").start();

  try {
    // In real implementation, these come from the npm package
    // For now, we'll create placeholder implementations
    for (const file of componentInfo.files) {
      const content = getComponentTemplate(file);
      await fs.writeFile(path.join(fullPath, file), content);
    }

    spinner.succeed(`Installed ${componentInfo.name} to ${installPath}/`);
  } catch (error) {
    spinner.fail("Failed to install component");
    console.log(error);
    process.exit(1);
  }

  console.log(chalk.green.bold("\n✅ Component installed!\n"));
  console.log(chalk.gray("Usage:"));
  console.log(chalk.cyan(`import { ${componentInfo.name} } from "${installPath}/${component}"`));
  console.log();
  console.log(chalk.gray("Documentation:"), chalk.underline("https://billing.drew.dev/docs/components"));
  console.log();
}

function getComponentTemplate(filename: string): string {
  const templates: Record<string, string> = {
    "pricing-table.tsx": `"use client";

import { useState } from "react";
import { BillingSDK } from "@drew/billing-sdk";

interface PricingTableProps {
  userId: string;
  onSubscribe?: (planId: string) => void;
}

export function PricingTable({ userId, onSubscribe }: PricingTableProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      description: "Perfect for getting started",
      features: ["1,000 API calls/mo", "1 project", "Community support"],
      cta: "Get Started",
      popular: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: "$29",
      description: "For growing businesses",
      features: [
        "10,000 API calls/mo",
        "Unlimited projects",
        "Priority support",
        "Advanced analytics",
      ],
      cta: "Upgrade to Pro",
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Unlimited API calls",
        "Custom integrations",
        "SLA guarantee",
        "Dedicated support",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const handleSubscribe = async (planId: string) => {
    if (planId === "free") return;
    
    setIsLoading(planId);
    try {
      const billing = new BillingSDK({
        baseUrl: process.env.NEXT_PUBLIC_BILLING_API_URL!,
      });

      const { url } = await billing.createCheckout({
        priceId: planId === "pro" ? "price_pro" : "price_enterprise",
        userId,
      });

      window.location.href = url;
    } catch (error) {
      console.error("Checkout failed:", error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="pricing-table">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={\`plan-card \${plan.popular ? "popular" : ""}\`}
        >
          {plan.popular && <span className="popular-badge">Most Popular</span>}
          <h3>{plan.name}</h3>
          <div className="price">{plan.price}</div>
          <p className="description">{plan.description}</p>
          <ul className="features">
            {plan.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <button
            onClick={() => handleSubscribe(plan.id)}
            disabled={isLoading === plan.id}
            className={\`cta-button \${plan.popular ? "primary" : "secondary"}\`}
          >
            {isLoading === plan.id ? "Loading..." : plan.cta}
          </button>
        </div>
      ))}
    </div>
  );
}
`,
    "upgrade-button.tsx": `"use client";

import { useState } from "react";
import { BillingSDK } from "@drew/billing-sdk";

interface UpgradeButtonProps {
  userId: string;
  currentPlan: string;
  targetPlan: "pro" | "enterprise";
  children?: React.ReactNode;
  className?: string;
}

export function UpgradeButton({
  userId,
  currentPlan,
  targetPlan,
  children,
  className = "",
}: UpgradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const billing = new BillingSDK({
        baseUrl: process.env.NEXT_PUBLIC_BILLING_API_URL!,
      });

      const { url } = await billing.updateSubscription({
        userId,
        newPriceId: targetPlan === "pro" ? "price_pro" : "price_enterprise",
      });

      window.location.href = url;
    } catch (error) {
      console.error("Upgrade failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (currentPlan === targetPlan) {
    return (
      <button disabled className={\`upgrade-button current \${className}\`}>
        Current Plan
      </button>
    );
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={isLoading}
      className={\`upgrade-button \${className}\`}
    >
      {isLoading ? "Loading..." : children || \`Upgrade to \${targetPlan}\`}
    </button>
  );
}
`,
    "usage-meter.tsx": `"use client";

import { useEffect, useState } from "react";
import { BillingSDK } from "@drew/billing-sdk";

interface UsageMeterProps {
  userId: string;
  feature: string;
  limit: number;
  label?: string;
}

export function UsageMeter({ userId, feature, limit, label }: UsageMeterProps) {
  const [usage, setUsage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const billing = new BillingSDK({
          baseUrl: process.env.NEXT_PUBLIC_BILLING_API_URL!,
        });

        const result = await billing.getUsage({ userId, feature });
        setUsage(result.totalUsage);
      } catch (error) {
        console.error("Failed to fetch usage:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUsage, 30000);
    return () => clearInterval(interval);
  }, [userId, feature]);

  const percentage = Math.min((usage / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isOverLimit = percentage >= 100;

  if (loading) {
    return <div className="usage-meter loading">Loading usage...</div>;
  }

  return (
    <div className="usage-meter">
      <div className="usage-header">
        <span className="usage-label">{label || feature}</span>
        <span className="usage-value">
          {usage.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="usage-bar">
        <div
          className={\`usage-fill \${
            isOverLimit ? "over" : isNearLimit ? "near" : ""
          }\`}
          style={{ width: \`\${percentage}%\` }}
        />
      </div>
      {isNearLimit && !isOverLimit && (
        <p className="usage-warning">Approaching limit</p>
      )}
      {isOverLimit && <p className="usage-error">Limit exceeded</p>}
    </div>
  );
}
`,
  };

  return (
    templates[filename] ||
    `// ${filename} - Component template\nexport function Placeholder() { return null; }`
  );
}

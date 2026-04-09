#!/usr/bin/env node
import{Command as ct}from"commander";import V from"chalk";import c from"chalk";import ye from"inquirer";import A from"ora";import C from"fs-extra";import T from"path";async function M(){let e=process.cwd(),t=T.join(e,"package.json");if(await C.pathExists(t)){let n=await C.readJson(t),r={...n.dependencies,...n.devDependencies};if(r.next){let s=await C.pathExists(T.join(e,"app")),o=await C.pathExists(T.join(e,"pages"));return{name:"nextjs",version:r.next,type:s?"app":o?"pages":"app"}}if(r.react)return{name:"react",version:r.react};if(r.vue||r["@vue/core"])return{name:"vue",version:r.vue||r["@vue/core"]};if(r.express)return{name:"express",version:r.express}}return await C.pathExists(T.join(e,"next.config.js"))||await C.pathExists(T.join(e,"next.config.ts"))||await C.pathExists(T.join(e,"next.config.mjs"))?{name:"nextjs",type:"app"}:await C.pathExists(T.join(e,"vite.config.ts"))?{name:"react"}:{name:"unknown"}}import Ee from"stripe";async function Z(e){let t=new Ee(e,{apiVersion:"2026-03-25.dahlia"}),n=[],r=await t.products.create({name:"Pro",description:"For growing businesses",metadata:{tier:"pro",features:JSON.stringify(["10,000 API calls/mo","Unlimited projects","Priority support","Advanced analytics"])}}),s=await t.prices.create({product:r.id,unit_amount:2900,currency:"usd",recurring:{interval:"month"},lookup_key:"pro_monthly"});n.push({id:r.id,name:"Pro",priceId:s.id});let o=await t.products.create({name:"Enterprise",description:"For large organizations",metadata:{tier:"enterprise",features:JSON.stringify(["Unlimited API calls","Custom integrations","SLA guarantee","Dedicated support"])}}),u=await t.prices.create({product:o.id,unit_amount:9900,currency:"usd",recurring:{interval:"month"},lookup_key:"enterprise_monthly"});n.push({id:o.id,name:"Enterprise",priceId:u.id});let d=await t.products.create({name:"API Calls",description:"Per-call pricing for API usage",metadata:{type:"usage",unit:"api_call"}}),S=await t.prices.create({product:d.id,unit_amount:1,currency:"usd",recurring:{interval:"month",usage_type:"metered"},lookup_key:"api_calls"});return n.push({id:d.id,name:"API Calls (Usage)",priceId:S.id}),n}import x from"fs-extra";import v from"path";import P from"chalk";import Ne from"ora";import ee from"fs-extra";import te from"path";var Y={"pricing-table":{name:"PricingTable",description:"Beautiful pricing table with Stripe checkout integration",files:["pricing-table.tsx"]},"upgrade-button":{name:"UpgradeButton",description:"Smart upgrade button with plan comparison",files:["upgrade-button.tsx"]},"usage-meter":{name:"UsageMeter",description:"Real-time usage visualization with limits",files:["usage-meter.tsx"]},"current-plan":{name:"CurrentPlanBadge",description:"Shows current plan with upgrade CTA",files:["current-plan.tsx"]},"billing-portal":{name:"BillingPortalButton",description:"Opens Stripe customer portal",files:["billing-portal-button.tsx"]},"subscription-gate":{name:"SubscriptionGate",description:"Blocks content based on subscription status",files:["subscription-gate.tsx"]},"trial-banner":{name:"TrialBanner",description:"Shows trial status and countdown",files:["trial-banner.tsx"]},all:{name:"All Components",description:"Install all billing components",files:["pricing-table.tsx","upgrade-button.tsx","usage-meter.tsx","current-plan.tsx","billing-portal-button.tsx","subscription-gate.tsx","trial-banner.tsx","index.ts"]}};async function _(e,t){console.log(P.blue.bold(`
\u{1F4E6} @drew/billing add
`));let n=Object.keys(Y);n.includes(e)||(console.log(P.red(`Invalid component: ${e}
`)),console.log(P.gray("Available components:")),n.forEach(d=>{if(d==="all")return;let S=Y[d];console.log(P.gray(`  \u2022 ${d}`)+` - ${S.description}`)}),console.log(P.gray("  \u2022 all - Install all components")),console.log(),process.exit(1));let r=Y[e],s=t.path||"components/billing",o=te.join(process.cwd(),s);console.log(P.gray(`Installing ${r.name}...
`)),await ee.ensureDir(o);let u=Ne("Creating components...").start();try{for(let d of r.files){let S=Te(d);await ee.writeFile(te.join(o,d),S)}u.succeed(`Installed ${r.name} to ${s}/`)}catch(d){u.fail("Failed to install component"),console.error(d),process.exit(1)}console.log(P.green.bold(`
\u2705 Component installed!
`)),console.log(P.gray("Usage:")),console.log(e==="all"?P.cyan(`import { PricingTable, UpgradeButton } from "${s}";`):P.cyan(`import { ${r.name} } from "${s}/${e.replace("billing-portal","billing-portal-button")}";`)),console.log(),console.log(P.gray("Documentation:"),P.underline("https://billing.drew.dev/docs/components")),console.log()}function Te(e){return{"pricing-table.tsx":_e(),"upgrade-button.tsx":De(),"usage-meter.tsx":Le(),"current-plan.tsx":Re(),"billing-portal-button.tsx":Ae(),"subscription-gate.tsx":Ue(),"trial-banner.tsx":je(),"index.ts":$e()}[e]||`// ${e} - Component template
export function Placeholder() { return null; }`}function _e(){return`"use client";

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
`}function De(){return`"use client";

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
`}function Le(){return`"use client";

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
`}function Re(){return`"use client";

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
`}function Ae(){return`"use client";

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
`}function Ue(){return`"use client";

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
`}function je(){return`"use client";

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
`}function $e(){return`export { PricingTable } from "./pricing-table";
export { UpgradeButton } from "./upgrade-button";
export { UsageMeter } from "./usage-meter";
export { CurrentPlanBadge } from "./current-plan";
export { BillingPortalButton } from "./billing-portal-button";
export { SubscriptionGate } from "./subscription-gate";
export { TrialBanner } from "./trial-banner";
`}async function ne(e,t){let n=process.cwd();switch(e){case"saas":await Be(n,t);break;case"api":await Me(n,t);break;case"usage":await Fe(n,t);break;case"minimal":break;default:throw new Error(`Unknown template: ${e}`)}}async function Be(e,t){await _("all",{path:"components/billing"});let n=t.find(i=>i.name==="Pro"),r=t.find(i=>i.name==="Enterprise"),s=n?.priceId||"price_placeholder_pro",o=r?.priceId||"price_placeholder_enterprise",u=`"use client";

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
    priceId: "${s}",
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
    priceId: "${o}",
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
`;await x.ensureDir(v.join(e,"app/pricing")),await x.writeFile(v.join(e,"app/pricing/page.tsx"),u);let d=`"use client";

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
`;await x.ensureDir(v.join(e,"app/billing")),await x.writeFile(v.join(e,"app/billing/page.tsx"),d),await x.writeFile(v.join(e,"app/demo/page.tsx"),`"use client";

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
`),await Oe(e)}async function Oe(e){let t=`import { NextRequest, NextResponse } from "next/server";

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
`;await x.ensureDir(v.join(e,"app/api/billing/checkout")),await x.writeFile(v.join(e,"app/api/billing/checkout/route.ts"),t);let n=`import { NextRequest, NextResponse } from "next/server";

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
`;await x.ensureDir(v.join(e,"app/api/billing/portal")),await x.writeFile(v.join(e,"app/api/billing/portal/route.ts"),n)}async function Me(e,t){await _("usage-meter",{path:"components/billing"});let n=`import { NextRequest, NextResponse } from "next/server";

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
`;await x.ensureDir(v.join(e,"app/api/example")),await x.writeFile(v.join(e,"app/api/example/route.ts"),n),await x.writeFile(v.join(e,"middleware.ts"),`import { NextResponse } from "next/server";
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
`)}async function Fe(e,t){await _("usage-meter",{path:"components/billing"}),await _("upgrade-button",{path:"components/billing"});let n=`"use client";

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
`;await x.ensureDir(v.join(e,"app/dashboard")),await x.writeFile(v.join(e,"app/dashboard/page.tsx"),n)}import re from"fs-extra";import ze from"path";async function se(e){let t=ze.join(process.cwd(),".env.local"),n="";try{n=await re.readFile(t,"utf-8")}catch{}for(let[r,s]of Object.entries(e)){let o=`${r}=${s}`;n.includes(`${r}=`)?n=n.replace(new RegExp(`${r}=.*`),o):(n+=n.endsWith(`
`)?"":`
`,n+=`${o}
`)}await re.writeFile(t,n)}import{execa as oe}from"execa";import F from"fs-extra";import z from"path";async function ae(){let e=process.cwd();if(!(await F.pathExists(z.join(e,"drizzle.config.ts"))||await F.pathExists(z.join(e,"drizzle.config.js"))))throw new Error("Drizzle ORM not configured. Please set up Drizzle first: https://orm.drizzle.team/docs/get-started");try{await oe("npx",["drizzle-kit","--version"],{cwd:e,stdio:"pipe"})}catch{throw new Error("drizzle-kit not found. Install it with: npm install -D drizzle-kit")}let n=await F.readFile(z.join(e,".env.local"),"utf-8").catch(()=>""),r=await F.readFile(z.join(e,".env"),"utf-8").catch(()=>"");if(!(n.includes("DATABASE_URL=")||r.includes("DATABASE_URL=")))throw new Error("DATABASE_URL not found in .env or .env.local. Please add your database connection string.");try{let o=await oe("npx",["drizzle-kit","push","--force"],{cwd:e,stdio:"pipe",timeout:6e4});if(o.stderr&&o.stderr.includes("error"))throw new Error(`Database push failed: ${o.stderr}`)}catch(o){throw o instanceof Error?o.message.includes("timeout")?new Error("Database push timed out. Please check your database connection."):new Error(`Database push failed: ${o.message}`):new Error("Database push failed. Run 'npx drizzle-kit push' manually to see details.")}}import K from"fs-extra";import W from"path";import{execa as Ke}from"execa";async function G(){let e=process.cwd();return await K.pathExists(W.join(e,"bun.lockb"))||await K.pathExists(W.join(e,"bun.lock"))?"bun":await K.pathExists(W.join(e,"pnpm-lock.yaml"))?"pnpm":await K.pathExists(W.join(e,"yarn.lock"))?"yarn":"npm"}function We(e){switch(e){case"yarn":return"add";case"pnpm":return"add";case"bun":return"add";default:return"install"}}async function ie(e,t={}){let n=await G(),s=[We(n),...e];t.dev&&(n==="npm"?s.push("--save-dev"):s.push("-D")),await Ke(n,s,{cwd:process.cwd(),stdio:"pipe"})}import{createHash as qe}from"crypto";import{readFileSync as Ve,existsSync as ce,writeFileSync as Ye,mkdirSync as Ge}from"fs";import{homedir as de}from"os";import{join as pe}from"path";import Mt from"chalk";var H=pe(de(),".drew-billing"),J=pe(H,"telemetry.json"),He=process.env.TELEMETRY_ENDPOINT||"https://billing.drew.dev/api/internal/telemetry";function le(){let e=`${de()}_${process.platform}_${process.arch}`;return qe("sha256").update(e).digest("hex").substring(0,16)}function $(){try{if(ce(J)){let e=JSON.parse(Ve(J,"utf-8"));return{enabled:e.enabled??!1,machineId:e.machineId||le(),optedInAt:e.optedInAt}}}catch{}return{enabled:!1,machineId:le()}}function ue(e){try{ce(H)||Ge(H,{recursive:!0}),Ye(J,JSON.stringify(e,null,2))}catch{}}function ge(){let e=$();e.enabled=!0,e.optedInAt=new Date().toISOString(),ue(e)}function me(){let e=$();e.enabled=!1,ue(e)}function Je(){return`cli_${Math.random().toString(36).substring(2,15)}_${Date.now()}`}function R(e,t){let n=$();if(!n.enabled)return;let r={type:e,timestamp:new Date().toISOString(),machineId:n.machineId,sessionId:Je(),cliVersion:"1.0.0",metadata:t};Xe(r).catch(()=>{})}function fe(e,t,n){R(e,{...n,durationMs:t})}async function Xe(e){try{await fetch(He,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})}catch{}}var X={CLI_INSTALL:"cli_install",INIT_STARTED:"init_started",INIT_COMPLETED:"init_completed",SANDBOX_STARTED:"sandbox_started",FIRST_CHECKOUT:"first_checkout",FIRST_SUBSCRIPTION:"first_subscription"};function Q(e,t){R(`funnel_${e}`,t)}import q from"chalk";import he from"inquirer";async function be(e,t){console.log(),console.log(q.blue.bold("\u{1F4E3} Quick Feedback")),console.log(q.gray("Your feedback helps us improve.")),console.log();try{let{wasEasy:n}=await he.prompt([{type:"confirm",name:"wasEasy",message:"Was this easy to set up?",default:!0}]),r;if(!n){let{feedback:s}=await he.prompt([{type:"input",name:"feedback",message:"What was difficult? (optional, 1 sentence)"}]);r=s}R("feedback_collected",{eventType:e,rating:n?"positive":"negative",feedback:r,...t}),console.log(),console.log(n?q.green("\u2728 Thanks! Glad it went smoothly."):q.yellow("\u{1F4DD} Thanks for the feedback \u2014 we'll use it to improve.")),console.log()}catch{}}async function we(e){console.log(c.blue.bold(`
\u26A1 @drew/billing init
`)),Q(X.INIT_STARTED,{template:e.template});let t=Date.now(),n=A("Detecting framework...").start(),r=await M();if(n.succeed(`Detected: ${c.green(r.name)} ${r.version||""}`),r.name!=="nextjs"){console.log(c.yellow(`
\u26A0\uFE0F  Currently only Next.js is fully supported.`)),console.log(c.gray(`Other frameworks coming soon: React, Vue, Svelte, Express
`));let{continueAnyway:l}=await ye.prompt([{type:"confirm",name:"continueAnyway",message:"Continue with manual setup?",default:!1}]);l||(console.log(c.gray(`
Aborted.
`)),process.exit(0))}let s=await G();console.log(c.gray(`Using package manager: ${s}
`));let o;e.yes?o={stripeSecretKey:process.env.STRIPE_SECRET_KEY||"",stripePublishableKey:process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY||"",webhookSecret:process.env.STRIPE_WEBHOOK_SECRET||"",template:e.template||"saas",createProducts:!e.skipStripe}:o={...await ye.prompt([{type:"input",name:"stripeSecretKey",message:"Stripe Secret Key (sk_test_...):",default:process.env.STRIPE_SECRET_KEY,validate:f=>f.startsWith("sk_test_")||f.startsWith("sk_live_")?!0:"Must start with sk_test_ or sk_live_"},{type:"input",name:"stripePublishableKey",message:"Stripe Publishable Key (pk_test_...):",default:process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,validate:f=>f.startsWith("pk_test_")||f.startsWith("pk_live_")?!0:"Must start with pk_test_ or pk_live_"},{type:"list",name:"template",message:"Choose your template:",choices:[{name:"SaaS Starter (pricing page + auth + dashboard)",value:"saas"},{name:"API Billing (usage-based pricing)",value:"api"},{name:"Simple Usage (metered billing)",value:"usage"},{name:"Minimal (just the SDK)",value:"minimal"}],default:e.template||"saas"},{type:"confirm",name:"createProducts",message:"Create Stripe products automatically?",default:!e.skipStripe}]),webhookSecret:""},console.log(c.blue.bold(`
\u{1F4E6} Setting up @drew/billing...
`));let u={dependencies:!1,stripeProducts:!1,database:!1,templates:!1,env:!1},d=[],S=A("Installing dependencies...").start();try{await ie(["@drew/billing-sdk","stripe"]),S.succeed("Dependencies installed"),u.dependencies=!0}catch(l){S.fail("Failed to install dependencies");let f=l instanceof Error?l.message:String(l);d.push(`Dependencies: ${f}`),console.log(c.gray(`Run manually: ${s} ${s==="npm"?"install":"add"} @drew/billing-sdk stripe`))}let i=[];if(o.createProducts){let l=A("Creating Stripe products...").start();try{i=await Z(o.stripeSecretKey),l.succeed(`Created ${i.length} products in Stripe`),u.stripeProducts=!0}catch(f){l.fail("Failed to create Stripe products");let Ce=f instanceof Error?f.message:String(f);d.push(`Stripe products: ${Ce}`),console.log(c.gray("You can create them manually in the Stripe Dashboard")),console.log(c.gray("Then update the price IDs in your code"))}}let k=A("Setting up database...").start();try{await ae(),k.succeed("Database configured"),u.database=!0}catch(l){k.fail("Database setup failed");let f=l instanceof Error?l.message:String(l);d.push(`Database: ${f}`),console.log(c.gray("You can set up the database later by running:")),console.log(c.gray("  npx drizzle-kit push"))}let w=A(`Installing ${o.template} template...`).start();try{await ne(o.template,i),w.succeed("Template installed"),u.templates=!0}catch(l){w.fail("Template installation failed");let f=l instanceof Error?l.message:String(l);d.push(`Templates: ${f}`),console.log(c.gray("Try running:")),console.log(c.gray("  npx @drew/billing add all"))}let m=A("Updating environment variables...").start();try{await se({STRIPE_SECRET_KEY:o.stripeSecretKey,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:o.stripePublishableKey,STRIPE_WEBHOOK_SECRET:o.webhookSecret||"whsec_... (run: stripe listen --forward-to localhost:3000/api/webhooks/stripe)",BILLING_API_URL:"http://localhost:3000"}),m.succeed("Environment variables configured"),u.env=!0}catch(l){m.fail("Failed to update .env");let f=l instanceof Error?l.message:String(l);d.push(`Environment: ${f}`)}let b=Date.now()-t;Q(X.INIT_COMPLETED,{template:o.template,durationMs:b,framework:r.name,success:Object.values(u).every(l=>l)}),fe("init_complete",b),console.log(c.green.bold(`
\u2705 Setup complete!
`)),d.length>0&&(console.log(c.yellow("\u26A0\uFE0F  Some steps failed:")),d.forEach(l=>console.log(c.gray(`  \u2022 ${l}`))),console.log()),console.log(c.white(`Next steps:
`)),console.log(c.gray("1."),"Start your dev server:",c.cyan(`${s==="npm"?"npm run":s} dev`)),console.log(c.gray("2."),"Start Stripe webhook listener:",c.cyan("stripe listen --forward-to http://localhost:3000/api/stripe/webhook")),u.templates&&console.log(c.gray("3."),"Visit",c.cyan("http://localhost:3000/pricing")),console.log(),console.log(c.gray("Documentation:"),c.underline("https://billing.drew.dev/docs")),console.log(c.gray("Diagnostics:"),c.cyan("npx @drew/billing doctor")),console.log(c.gray("Support:"),c.underline("https://github.com/drew/billing/issues")),console.log(),i.length>0&&(console.log(c.gray("Created Stripe products:")),i.forEach(l=>{console.log(c.gray(`  \u2022 ${l.name}: ${l.priceId}`))}),console.log()),console.log(c.blue("\u{1F4CA} Help improve @drew/billing")),console.log(c.gray("Enable anonymous telemetry to help us fix bugs faster.")),console.log(c.gray(`Run: npx @drew/billing telemetry --enable
`)),await be("init_completed",{template:o.template,framework:r.name,durationMs:b,results:u})}import g from"chalk";import B from"ora";import U from"fs-extra";import j from"path";async function xe(){console.log(g.blue.bold(`
\u{1F50D} @drew/billing verify
`)),console.log(g.gray(`Checking your billing setup...
`));let e=[],t=B("Checking environment variables...").start();try{let i=j.join(process.cwd(),".env.local");if(!await U.pathExists(i))e.push({name:"Environment File",status:"fail",message:".env.local not found"}),t.fail();else{let w=await U.readFile(i,"utf-8"),b=["STRIPE_SECRET_KEY","NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"].filter(l=>!w.includes(l));b.length>0?(e.push({name:"Environment Variables",status:"fail",message:`Missing: ${b.join(", ")}`}),t.fail()):(e.push({name:"Environment Variables",status:"pass",message:"All required variables present"}),t.succeed())}}catch{e.push({name:"Environment Variables",status:"fail",message:"Could not read .env file"}),t.fail()}let n=B("Checking Stripe connection...").start();try{let i=(await import("stripe")).default,w=await new i(process.env.STRIPE_SECRET_KEY,{apiVersion:"2024-12-18.acacia"}).accounts.retrieve();e.push({name:"Stripe API",status:"pass",message:`Connected to ${w.settings?.dashboard?.display_name||"Stripe account"}`}),n.succeed()}catch{e.push({name:"Stripe API",status:"fail",message:"Could not connect to Stripe API"}),n.fail()}let r=B("Checking database...").start();try{let i=await U.pathExists(j.join(process.cwd(),"drizzle.config.ts")),k=await U.pathExists(j.join(process.cwd(),"drizzle/schema.ts"));i&&k?(e.push({name:"Database Setup",status:"pass",message:"Drizzle ORM configured"}),r.succeed()):(e.push({name:"Database Setup",status:"warn",message:"Database configuration not detected"}),r.warn())}catch{e.push({name:"Database Setup",status:"warn",message:"Could not verify database setup"}),r.warn()}let s=B("Checking API routes...").start();try{let i=["api/checkout/route.ts","api/webhooks/stripe/route.ts","api/entitlements/[userId]/route.ts"],k=j.join(process.cwd(),"app"),w=[];for(let m of i){let b=j.join(k,m);await U.pathExists(b)||w.push(m)}w.length>0?(e.push({name:"API Routes",status:"warn",message:`Missing routes: ${w.length}`}),s.warn()):(e.push({name:"API Routes",status:"pass",message:"All required routes present"}),s.succeed())}catch{e.push({name:"API Routes",status:"warn",message:"Could not verify API routes"}),s.warn()}let o=B("Checking SDK...").start();try{let i=await U.readJson(j.join(process.cwd(),"package.json"));i.dependencies?.["@drew/billing-sdk"]||i.devDependencies?.["@drew/billing-sdk"]?(e.push({name:"SDK Installation",status:"pass",message:"@drew/billing-sdk installed"}),o.succeed()):(e.push({name:"SDK Installation",status:"fail",message:"SDK not found in dependencies"}),o.fail())}catch{e.push({name:"SDK Installation",status:"fail",message:"Could not check package.json"}),o.fail()}console.log(g.blue.bold(`
\u{1F4CA} Summary
`));let u=e.filter(i=>i.status==="pass").length,d=e.filter(i=>i.status==="fail").length,S=e.filter(i=>i.status==="warn").length;e.forEach(i=>{let k=i.status==="pass"?g.green("\u2713"):i.status==="fail"?g.red("\u2717"):g.yellow("\u26A0"),w=i.status==="pass"?g.green:i.status==="fail"?g.red:g.yellow;console.log(`${k} ${w(i.name)}`),console.log(g.gray(`  ${i.message}`))}),console.log(),d===0?(console.log(g.green.bold("\u2705 All checks passed!")),console.log(g.gray("Your billing setup looks good."))):d>0&&u>0?(console.log(g.yellow.bold("\u26A0\uFE0F  Some checks failed")),console.log(g.gray("Review the issues above to complete your setup."))):(console.log(g.red.bold("\u274C Setup incomplete")),console.log(g.gray("Run: npx @drew/billing init"))),console.log(),console.log(g.gray("Next steps:")),console.log(g.gray("  \u2022 Start dev server: npm run dev")),console.log(g.gray("  \u2022 Start webhook listener: stripe listen --forward-to localhost:3000/api/webhooks/stripe")),console.log(g.gray("  \u2022 View docs: https://billing.drew.dev/docs")),console.log()}import y from"chalk";import Qe from"ora";import ve from"fs-extra";import Ze from"path";async function ke(e){console.log(y.blue.bold(`
\u{1F3D6}\uFE0F  @drew/billing sandbox
`));let t=Ze.join(process.cwd(),".env.local"),n="";try{n=await ve.readFile(t,"utf-8")}catch{}let r;if(e.enable)r=!0;else if(e.disable)r=!1;else{let o=n.match(/BILLING_SANDBOX_MODE=(true|false)/);r=!(o?o[1]==="true":!1)}let s=Qe(r?"Enabling sandbox mode...":"Disabling sandbox mode...").start();try{n.includes("BILLING_SANDBOX_MODE=")?n=n.replace(/BILLING_SANDBOX_MODE=(true|false)/,`BILLING_SANDBOX_MODE=${r}`):n+=`
# Sandbox mode - no real charges
BILLING_SANDBOX_MODE=${r}
`,await ve.writeFile(t,n),s.succeed()}catch(o){s.fail("Failed to update sandbox mode"),console.log(o),process.exit(1)}r?(console.log(y.green.bold(`
\u2705 Sandbox mode ENABLED
`)),console.log(y.gray("What this means:")),console.log(y.gray("  \u2022 No real charges will be processed")),console.log(y.gray("  \u2022 Stripe test mode API keys used")),console.log(y.gray("  \u2022 Webhooks simulated locally")),console.log(y.gray("  \u2022 Usage tracked but not billed")),console.log(),console.log(y.yellow("Perfect for development and testing!"))):(console.log(y.yellow.bold(`
\u26A0\uFE0F  Sandbox mode DISABLED
`)),console.log(y.gray("What this means:")),console.log(y.gray("  \u2022 Real charges will be processed")),console.log(y.gray("  \u2022 Stripe live mode API keys required")),console.log(y.gray("  \u2022 Production webhooks active")),console.log(),console.log(y.red("Make sure you have live Stripe keys configured!"))),console.log(),console.log(y.gray("Switch back anytime:")),console.log(y.cyan("  npx @drew/billing sandbox")),console.log()}import a from"chalk";import D from"fs-extra";import E from"path";async function Se(){console.log(a.blue.bold(`
\u{1F464} @drew/billing whoami
`));try{let m=await D.readJson(E.join(process.cwd(),"package.json"));console.log(a.gray("Project:"),a.white(m.name||"Unknown")),console.log(a.gray("Version:"),a.white(m.version||"Unknown"))}catch{console.log(a.gray("Project:"),a.yellow("Could not read package.json"))}let e=E.join(process.cwd(),".env.local"),t={};try{(await D.readFile(e,"utf-8")).split(`
`).forEach(b=>{let l=b.match(/^([A-Z_]+)=(.+)$/);l&&(t[l[1]]=l[2].replace(/^["']/,"").replace(/["']$/,""))})}catch{}console.log(),console.log(a.gray("Environment:"));let n=t.STRIPE_SECRET_KEY||"",r=n.startsWith("sk_test_"),s=n.startsWith("sk_live_");r?console.log(a.gray("  Stripe:"),a.yellow("TEST MODE")):s?console.log(a.gray("  Stripe:"),a.green("LIVE MODE \u26A0\uFE0F")):console.log(a.gray("  Stripe:"),a.red("Not configured"));let o=t.BILLING_SANDBOX_MODE==="true";console.log(a.gray("  Sandbox:"),o?a.green("Enabled"):a.gray("Disabled"));let u=t.NEXT_PUBLIC_BILLING_API_URL||t.BILLING_API_URL;console.log(a.gray("  API URL:"),u||a.red("Not set"));try{let m=await D.readJson(E.join(process.cwd(),"package.json")),b=m.dependencies?.["@drew/billing-sdk"]||m.devDependencies?.["@drew/billing-sdk"];b?console.log(a.gray("  SDK:"),b):console.log(a.gray("  SDK:"),a.red("Not installed"))}catch{}console.log();let d=E.join(process.cwd(),"components/billing");try{let b=(await D.readdir(d)).filter(l=>l.endsWith(".tsx"));b.length>0?(console.log(a.gray("Installed Components:")),b.forEach(l=>{console.log(a.gray("  \u2022"),l.replace(".tsx",""))})):(console.log(a.gray("Components:"),a.yellow("None installed")),console.log(a.gray("  Install with: npx @drew/billing add <component>")))}catch{console.log(a.gray("Components:"),a.yellow("None installed"))}console.log();let S=await D.pathExists(E.join(process.cwd(),"drizzle.config.ts"));console.log(a.gray("Database:"),S?a.green("Configured"):a.yellow("Not configured"));let i=E.join(process.cwd(),"app/api"),k=await D.pathExists(E.join(i,"checkout/route.ts")),w=await D.pathExists(E.join(i,"webhooks/stripe/route.ts"));console.log(a.gray("API Routes:")),console.log(a.gray("  /api/checkout"),k?a.green("\u2713"):a.red("\u2717")),console.log(a.gray("  /api/webhooks/stripe"),w?a.green("\u2713"):a.red("\u2717")),console.log(),console.log(a.gray("Commands:")),console.log(a.gray("  init       Initialize billing")),console.log(a.gray("  add        Add UI components")),console.log(a.gray("  verify     Verify setup")),console.log(a.gray("  sandbox    Toggle sandbox mode")),console.log()}import p from"chalk";async function Pe(e){console.log(p.blue.bold(`
\u{1F4CA} Telemetry Settings
`));let t=$();if(e.enable){ge(),console.log(p.green("\u2705 Anonymous telemetry enabled")),console.log(p.gray(`
We collect:`)),console.log(p.gray("  \u2022 Command usage (init, add, verify, etc.)")),console.log(p.gray("  \u2022 Performance metrics (timing)")),console.log(p.gray("  \u2022 Error reports (no stack traces with PII)")),console.log(p.gray(`
We NEVER collect:`)),console.log(p.gray("  \u2022 Personal information")),console.log(p.gray("  \u2022 Stripe keys or API credentials")),console.log(p.gray("  \u2022 Code or project details")),console.log(p.gray("  \u2022 IP addresses")),R("telemetry_enabled");return}if(e.disable){me(),console.log(p.yellow("\u274C Anonymous telemetry disabled")),console.log(p.gray("You can re-enable anytime with: npx @drew/billing telemetry --enable"));return}console.log(p.white("Current status:")),console.log(`  Enabled: ${t.enabled?p.green("Yes"):p.red("No")}`),t.machineId&&console.log(`  Machine ID: ${p.gray(t.machineId)}`),t.optedInAt&&console.log(`  Decision date: ${p.gray(t.optedInAt)}`),console.log(p.gray(`
Usage:`)),console.log(p.gray("  npx @drew/billing telemetry --enable   # Enable telemetry")),console.log(p.gray("  npx @drew/billing telemetry --disable  # Disable telemetry")),console.log(p.gray(`  npx @drew/billing telemetry            # Show status
`)),t.optedInAt||(console.log(p.blue("\u{1F4A1} Why enable telemetry?")),console.log(p.gray("Anonymous data helps us improve the CLI and catch bugs faster.")),console.log(p.gray(`No personal information is ever collected.
`)))}import h from"chalk";import{readFileSync as O,existsSync as L}from"fs";import{join as N}from"path";import{execa as et}from"execa";async function Ie(){console.log(h.blue.bold(`
\u{1F50D} @drew/billing doctor
`)),console.log(h.gray(`Running diagnostics...
`));let e=[];e.push(await tt()),e.push(await nt()),e.push(await rt()),e.push(await st()),e.push(await ot()),e.push(await at()),e.push(await it()),lt(e)}async function tt(){let e=N(process.cwd(),".env.local"),t=N(process.cwd(),".env.example"),n="";L(e)?n=O(e,"utf-8"):L(N(process.cwd(),".env"))&&(n=O(N(process.cwd(),".env"),"utf-8"));let r=["STRIPE_SECRET_KEY","NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY","STRIPE_WEBHOOK_SECRET"],s=r.filter(u=>!n.includes(u));if(s.length===0)return{name:"Environment Variables",status:"pass",message:"All required variables configured"};let o=L(t);return{name:"Environment Variables",status:"fail",message:`Missing: ${s.join(", ")}`,fix:o?"cp .env.example .env.local && edit with your Stripe keys":`Create .env.local with:
${r.map(u=>`${u}=...`).join(`
`)}`}}async function nt(){try{let e=new AbortController,t=setTimeout(()=>e.abort(),2e3),n=await fetch("http://localhost:3000/api/health",{signal:e.signal}).catch(()=>null);return clearTimeout(t),n?.ok?{name:"API Connectivity",status:"pass",message:"Billing API responding at localhost:3000"}:{name:"API Connectivity",status:"warn",message:"Dev server not running or API not accessible",fix:"Start dev server: npm run dev"}}catch{return{name:"API Connectivity",status:"warn",message:"Could not connect to localhost:3000",fix:"Start dev server: npm run dev"}}}async function rt(){let e=N(process.cwd(),".env.local"),t="";if(L(e)){let r=O(e,"utf-8").match(/STRIPE_WEBHOOK_SECRET=(.+)/);r&&(t=r[1].trim())}return!t||t==="whsec_..."?{name:"Webhook Configuration",status:"fail",message:"Webhook secret not configured",fix:`1. Run: stripe listen --forward-to http://localhost:3000/api/stripe/webhook
2. Copy webhook secret to .env.local`}:t.startsWith("whsec_")?{name:"Webhook Configuration",status:"pass",message:"Webhook secret configured"}:{name:"Webhook Configuration",status:"warn",message:"Webhook secret format looks unusual",fix:"Verify STRIPE_WEBHOOK_SECRET starts with 'whsec_'"}}async function st(){try{if(!L(N(process.cwd(),"drizzle.config.ts")))return{name:"Database Connection",status:"fail",message:"No Drizzle config found",fix:"Run: npx @drew/billing init to set up database"};try{return await et("npx",["drizzle-kit","check"],{cwd:process.cwd(),timeout:1e4,reject:!1}),{name:"Database Connection",status:"pass",message:"Database configuration found"}}catch{return{name:"Database Connection",status:"warn",message:"Database config exists but connection not verified",fix:"Run: npx drizzle-kit push to sync schema"}}}catch{return{name:"Database Connection",status:"warn",message:"Could not verify database connection"}}}async function ot(){let e=N(process.cwd(),".env.local"),t="";if(L(e)){let r=O(e,"utf-8").match(/STRIPE_SECRET_KEY=(.+)/);r&&(t=r[1].trim())}return t?t.startsWith("sk_test_")?{name:"Stripe Configuration",status:"pass",message:"Test mode Stripe key configured"}:t.startsWith("sk_live_")?{name:"Stripe Configuration",status:"warn",message:"\u26A0\uFE0F Live Stripe key detected",fix:"Use test keys for development: https://dashboard.stripe.com/test/apikeys"}:{name:"Stripe Configuration",status:"fail",message:"Invalid Stripe key format",fix:"Key should start with sk_test_ or sk_live_"}:{name:"Stripe Configuration",status:"fail",message:"STRIPE_SECRET_KEY not found",fix:"Add STRIPE_SECRET_KEY=sk_test_... to .env.local"}}async function at(){let e=N(process.cwd(),"package.json");if(!L(e))return{name:"Dependencies",status:"fail",message:"No package.json found",fix:"Run: npm init"};try{let t=JSON.parse(O(e,"utf-8")),n={...t.dependencies,...t.devDependencies},s=["@drew/billing-sdk","stripe"].filter(o=>!n[o]);return s.length===0?{name:"Dependencies",status:"pass",message:"All required packages installed"}:{name:"Dependencies",status:"fail",message:`Missing: ${s.join(", ")}`,fix:`npm install ${s.join(" ")}`}}catch{return{name:"Dependencies",status:"warn",message:"Could not parse package.json"}}}async function it(){let e=await M();return e.name==="nextjs"?{name:"Framework Support",status:"pass",message:`Next.js ${e.version||""} detected`}:{name:"Framework Support",status:"warn",message:`${e.name} detected (limited support)`,fix:"Next.js is fully supported. Other frameworks have basic support."}}function lt(e){let t=e.filter(s=>s.status==="pass").length,n=e.filter(s=>s.status==="fail").length,r=e.filter(s=>s.status==="warn").length;console.log(h.white.bold(`Results:
`));for(let s of e){let o=s.status==="pass"?h.green("\u2713"):s.status==="fail"?h.red("\u2717"):h.yellow("\u26A0");console.log(`${o} ${h.white(s.name)}`),console.log(`  ${h.gray(s.message)}`),s.fix&&console.log(`  ${h.cyan("Fix:")} ${s.fix}`),console.log()}console.log(h.white.bold("Summary:")),console.log(`  ${h.green(`${t} passing`)}`),n>0&&console.log(`  ${h.red(`${n} failing`)}`),r>0&&console.log(`  ${h.yellow(`${r} warnings`)}`),n===0&&r===0?console.log(h.green.bold(`
\u2705 All checks passed! Your billing setup looks good.
`)):n===0?console.log(h.yellow(`
\u26A0\uFE0F  Some warnings - review above.
`)):(console.log(h.red(`
\u274C ${n} issue(s) need attention. Run the suggested fixes above.
`)),console.log(h.gray(`Need help? https://billing.drew.dev/docs/troubleshooting
`)))}var I=new ct;I.name("@drew/billing").description("CLI for @drew/billing - Add subscriptions to your app in 10 minutes").version("1.0.0");I.command("init").description("Initialize @drew/billing in your Next.js project").option("--skip-stripe","Skip Stripe product creation").option("--template <type>","Template type (saas, api, usage)","saas").option("--yes","Skip prompts and use defaults").action(we);I.command("add <component>").description("Add a billing component (pricing-table, upgrade-button, usage-meter)").option("--path <path>","Custom installation path").action(_);I.command("verify").description("Verify your billing setup is working correctly").action(xe);I.command("sandbox").description("Toggle sandbox mode for testing without real charges").option("--enable","Enable sandbox mode").option("--disable","Disable sandbox mode").action(ke);I.command("whoami").description("Show current billing configuration").action(Se);I.command("telemetry").description("Manage anonymous usage telemetry").option("--enable","Enable telemetry").option("--disable","Disable telemetry").action(Pe);I.command("doctor").description("Diagnose billing setup issues").action(Ie);process.argv.length===2&&(console.log(V.blue.bold(`
\u26A1 @drew/billing
`)),console.log(`Add subscriptions to your app in 10 minutes.
`),console.log(V.gray("Quick start:")),console.log(`  npx @drew/billing init
`),console.log(V.gray("Commands:")),console.log("  init       Initialize billing in your project"),console.log("  add        Add prebuilt UI components"),console.log("  verify     Verify your setup"),console.log("  sandbox    Toggle sandbox mode"),console.log("  whoami     Show current configuration"),console.log("  doctor     Diagnose setup issues"),console.log(`  telemetry  Manage usage telemetry
`),console.log(V.gray("Documentation:")),console.log(`  https://billing.drew.dev/docs
`));I.parse();
//# sourceMappingURL=index.js.map
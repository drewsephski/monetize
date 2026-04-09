#!/usr/bin/env node
import{Command as gt}from"commander";import H from"chalk";import o from"chalk";import ne from"inquirer";import T from"ora";import N from"fs-extra";import C from"path";import{execa as A}from"execa";import _ from"fs-extra";import D from"path";async function q(){let e=process.cwd(),n=D.join(e,"package.json");if(await _.pathExists(n)){let t=await _.readJson(n),r={...t.dependencies,...t.devDependencies};if(r.next){let s=await _.pathExists(D.join(e,"app")),i=await _.pathExists(D.join(e,"pages"));return{name:"nextjs",version:r.next,type:s?"app":i?"pages":"app"}}if(r.react)return{name:"react",version:r.react};if(r.vue||r["@vue/core"])return{name:"vue",version:r.vue||r["@vue/core"]};if(r.express)return{name:"express",version:r.express}}return await _.pathExists(D.join(e,"next.config.js"))||await _.pathExists(D.join(e,"next.config.ts"))||await _.pathExists(D.join(e,"next.config.mjs"))?{name:"nextjs",type:"app"}:await _.pathExists(D.join(e,"vite.config.ts"))?{name:"react"}:{name:"unknown"}}import _e from"stripe";async function se(e){let n=new _e(e,{apiVersion:"2026-03-25.dahlia"}),t=[],r=await n.products.create({name:"Pro",description:"For growing businesses",metadata:{tier:"pro",features:JSON.stringify(["10,000 API calls/mo","Unlimited projects","Priority support","Advanced analytics"])}}),s=await n.prices.create({product:r.id,unit_amount:2900,currency:"usd",recurring:{interval:"month"},lookup_key:"pro_monthly"});t.push({id:r.id,name:"Pro",priceId:s.id});let i=await n.products.create({name:"Enterprise",description:"For large organizations",metadata:{tier:"enterprise",features:JSON.stringify(["Unlimited API calls","Custom integrations","SLA guarantee","Dedicated support"])}}),g=await n.prices.create({product:i.id,unit_amount:9900,currency:"usd",recurring:{interval:"month"},lookup_key:"enterprise_monthly"});t.push({id:i.id,name:"Enterprise",priceId:g.id});let m=await n.products.create({name:"API Calls",description:"Per-call pricing for API usage",metadata:{type:"usage",unit:"api_call"}}),p=await n.prices.create({product:m.id,unit_amount:1,currency:"usd",recurring:{interval:"month",usage_type:"metered"},lookup_key:"api_calls"});return t.push({id:m.id,name:"API Calls (Usage)",priceId:p.id}),t}import k from"fs-extra";import S from"path";import I from"chalk";import Te from"ora";import ae from"fs-extra";import oe from"path";var X={"pricing-table":{name:"PricingTable",description:"Beautiful pricing table with Stripe checkout integration",files:["pricing-table.tsx"]},"upgrade-button":{name:"UpgradeButton",description:"Smart upgrade button with plan comparison",files:["upgrade-button.tsx"]},"usage-meter":{name:"UsageMeter",description:"Real-time usage visualization with limits",files:["usage-meter.tsx"]},"current-plan":{name:"CurrentPlanBadge",description:"Shows current plan with upgrade CTA",files:["current-plan.tsx"]},"billing-portal":{name:"BillingPortalButton",description:"Opens Stripe customer portal",files:["billing-portal-button.tsx"]},"subscription-gate":{name:"SubscriptionGate",description:"Blocks content based on subscription status",files:["subscription-gate.tsx"]},"trial-banner":{name:"TrialBanner",description:"Shows trial status and countdown",files:["trial-banner.tsx"]},all:{name:"All Components",description:"Install all billing components",files:["pricing-table.tsx","upgrade-button.tsx","usage-meter.tsx","current-plan.tsx","billing-portal-button.tsx","subscription-gate.tsx","trial-banner.tsx","index.ts"]}};async function L(e,n){console.log(I.blue.bold(`
\u{1F4E6} @drew/billing add
`));let t=Object.keys(X);t.includes(e)||(console.log(I.red(`Invalid component: ${e}
`)),console.log(I.gray("Available components:")),t.forEach(m=>{if(m==="all")return;let p=X[m];console.log(I.gray(`  \u2022 ${m}`)+` - ${p.description}`)}),console.log(I.gray("  \u2022 all - Install all components")),console.log(),process.exit(1));let r=X[e],s=n.path||"components/billing",i=oe.join(process.cwd(),s);console.log(I.gray(`Installing ${r.name}...
`)),await ae.ensureDir(i);let g=Te("Creating components...").start();try{for(let m of r.files){let p=je(m);await ae.writeFile(oe.join(i,m),p)}g.succeed(`Installed ${r.name} to ${s}/`)}catch(m){g.fail("Failed to install component"),console.error(m),process.exit(1)}console.log(I.green.bold(`
\u2705 Component installed!
`)),console.log(I.gray("Usage:")),console.log(e==="all"?I.cyan(`import { PricingTable, UpgradeButton } from "${s}";`):I.cyan(`import { ${r.name} } from "${s}/${e.replace("billing-portal","billing-portal-button")}";`)),console.log(),console.log(I.gray("Documentation:"),I.underline("https://billing.drew.dev/docs/components")),console.log()}function je(e){return{"pricing-table.tsx":Re(),"upgrade-button.tsx":De(),"usage-meter.tsx":Le(),"current-plan.tsx":Ae(),"billing-portal-button.tsx":Ue(),"subscription-gate.tsx":$e(),"trial-banner.tsx":Be(),"index.ts":Oe()}[e]||`// ${e} - Component template
export function Placeholder() { return null; }`}function Re(){return`"use client";

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
`}function Ae(){return`"use client";

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
`}function Ue(){return`"use client";

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
`}function $e(){return`"use client";

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
`}function Be(){return`"use client";

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
`}function Oe(){return`export { PricingTable } from "./pricing-table";
export { UpgradeButton } from "./upgrade-button";
export { UsageMeter } from "./usage-meter";
export { CurrentPlanBadge } from "./current-plan";
export { BillingPortalButton } from "./billing-portal-button";
export { SubscriptionGate } from "./subscription-gate";
export { TrialBanner } from "./trial-banner";
`}async function ie(e,n){let t=process.cwd();switch(e){case"saas":await Me(t,n);break;case"api":await ze(t,n);break;case"usage":await Ke(t,n);break;case"minimal":break;default:throw new Error(`Unknown template: ${e}`)}}async function Me(e,n){await L("all",{path:"components/billing"});let t=n.find(a=>a.name==="Pro"),r=n.find(a=>a.name==="Enterprise"),s=t?.priceId||"price_placeholder_pro",i=r?.priceId||"price_placeholder_enterprise",g=`"use client";

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
    priceId: "${i}",
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
`;await k.ensureDir(S.join(e,"app/pricing")),await k.writeFile(S.join(e,"app/pricing/page.tsx"),g);let m=`"use client";

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
`;await k.ensureDir(S.join(e,"app/billing")),await k.writeFile(S.join(e,"app/billing/page.tsx"),m),await k.writeFile(S.join(e,"app/demo/page.tsx"),`"use client";

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
`),await Fe(e)}async function Fe(e){let n=`import { NextRequest, NextResponse } from "next/server";

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
`;await k.ensureDir(S.join(e,"app/api/billing/checkout")),await k.writeFile(S.join(e,"app/api/billing/checkout/route.ts"),n);let t=`import { NextRequest, NextResponse } from "next/server";

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
`;await k.ensureDir(S.join(e,"app/api/billing/portal")),await k.writeFile(S.join(e,"app/api/billing/portal/route.ts"),t)}async function ze(e,n){await L("usage-meter",{path:"components/billing"});let t=`import { NextRequest, NextResponse } from "next/server";

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
`;await k.ensureDir(S.join(e,"app/api/example")),await k.writeFile(S.join(e,"app/api/example/route.ts"),t),await k.writeFile(S.join(e,"middleware.ts"),`import { NextResponse } from "next/server";
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
`)}async function Ke(e,n){await L("usage-meter",{path:"components/billing"}),await L("upgrade-button",{path:"components/billing"});let t=`"use client";

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
`;await k.ensureDir(S.join(e,"app/dashboard")),await k.writeFile(S.join(e,"app/dashboard/page.tsx"),t)}import le from"fs-extra";import We from"path";async function ce(e){let n=We.join(process.cwd(),".env.local"),t="";try{t=await le.readFile(n,"utf-8")}catch{}for(let[r,s]of Object.entries(e)){let i=`${r}=${s}`;t.includes(`${r}=`)?t=t.replace(new RegExp(`${r}=.*`),i):(t+=t.endsWith(`
`)?"":`
`,t+=`${i}
`)}await le.writeFile(n,t)}import V from"fs-extra";import Y from"path";import{execa as Lt}from"execa";async function pe(){let e=process.cwd();return await V.pathExists(Y.join(e,"bun.lockb"))||await V.pathExists(Y.join(e,"bun.lock"))?"bun":await V.pathExists(Y.join(e,"pnpm-lock.yaml"))?"pnpm":await V.pathExists(Y.join(e,"yarn.lock"))?"yarn":"npm"}import{createHash as qe}from"crypto";import{readFileSync as Ve,existsSync as ue,writeFileSync as Ye,mkdirSync as Ge}from"fs";import{homedir as ge}from"os";import{join as me}from"path";import Ft from"chalk";var Q=me(ge(),".drew-billing"),Z=me(Q,"telemetry.json"),He=process.env.TELEMETRY_ENDPOINT||"https://billing.drew.dev/api/internal/telemetry";function de(){let e=`${ge()}_${process.platform}_${process.arch}`;return qe("sha256").update(e).digest("hex").substring(0,16)}function F(){try{if(ue(Z)){let e=JSON.parse(Ve(Z,"utf-8"));return{enabled:e.enabled??!1,machineId:e.machineId||de(),optedInAt:e.optedInAt}}}catch{}return{enabled:!1,machineId:de()}}function fe(e){try{ue(Q)||Ge(Q,{recursive:!0}),Ye(Z,JSON.stringify(e,null,2))}catch{}}function he(){let e=F();e.enabled=!0,e.optedInAt=new Date().toISOString(),fe(e)}function be(){let e=F();e.enabled=!1,fe(e)}function Je(){return`cli_${Math.random().toString(36).substring(2,15)}_${Date.now()}`}function B(e,n){let t=F();if(!t.enabled)return;let r={type:e,timestamp:new Date().toISOString(),machineId:t.machineId,sessionId:Je(),cliVersion:"1.0.0",metadata:n};Xe(r).catch(()=>{})}function ye(e,n,t){B(e,{...t,durationMs:n})}async function Xe(e){try{await fetch(He,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})}catch{}}var ee={CLI_INSTALL:"cli_install",INIT_STARTED:"init_started",INIT_COMPLETED:"init_completed",SANDBOX_STARTED:"sandbox_started",FIRST_CHECKOUT:"first_checkout",FIRST_SUBSCRIPTION:"first_subscription"};function te(e,n){B(`funnel_${e}`,n)}import G from"chalk";import we from"inquirer";async function ve(e,n){console.log(),console.log(G.blue.bold("\u{1F4E3} Quick Feedback")),console.log(G.gray("Your feedback helps us improve.")),console.log();try{let{wasEasy:t}=await we.prompt([{type:"confirm",name:"wasEasy",message:"Was this easy to set up?",default:!0}]),r;if(!t){let{feedback:s}=await we.prompt([{type:"input",name:"feedback",message:"What was difficult? (optional, 1 sentence)"}]);r=s}B("feedback_collected",{eventType:e,rating:t?"positive":"negative",feedback:r,...n}),console.log(),console.log(t?G.green("\u2728 Thanks! Glad it went smoothly."):G.yellow("\u{1F4DD} Thanks for the feedback \u2014 we'll use it to improve.")),console.log()}catch{}}async function ke(e){console.log(o.blue.bold(`
\u26A1 @drew/billing init
`)),te(ee.INIT_STARTED,{template:e.template});let n=Date.now(),t=process.cwd(),r=await Qe(t),s=await N.pathExists(C.join(t,"package.json")),i="npm",g=C.basename(t),m={name:"nextjs"};if(r||!s){console.log(o.yellow("\u{1F4C1} No existing project detected."));let{shouldScaffold:c}=await ne.prompt([{type:"confirm",name:"shouldScaffold",message:"Create a new Next.js project here?",default:!0}]);c||(console.log(o.gray(`
Aborted. Please run this in an existing Next.js project directory.
`)),process.exit(0));let d=await Ze(t,e.yes);d.success||(console.log(o.red(`
\u274C Failed to scaffold Next.js project.`)),console.log(o.gray(`Please try manually: npx create-next-app@latest .
`)),process.exit(1)),i=d.pkgManager,g=d.projectName,console.log(o.green(`
\u2705 Created Next.js project: ${g}
`))}else{let c=T("Detecting framework...").start(),d=await q();if(m={name:d.name,version:d.version},d.name!=="nextjs"){c.warn(`Detected: ${d.name} (limited support)`),console.log(o.yellow(`
\u26A0\uFE0F  Currently only Next.js is fully supported.`)),console.log(o.gray(`Other frameworks coming soon: React, Vue, Svelte, Express
`));let{continueAnyway:W}=await ne.prompt([{type:"confirm",name:"continueAnyway",message:"Continue with manual setup?",default:!1}]);W||(console.log(o.gray(`
Aborted.
`)),process.exit(0))}else c.succeed(`Detected: ${o.green("Next.js")} ${d.version||""}`);i=await pe()}console.log(o.gray(`Using package manager: ${i}
`));let p;e.yes?p={stripeSecretKey:process.env.STRIPE_SECRET_KEY||"",stripePublishableKey:process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY||"",webhookSecret:process.env.STRIPE_WEBHOOK_SECRET||"",template:e.template||"saas",createProducts:!e.skipStripe}:p={...await ne.prompt([{type:"input",name:"stripeSecretKey",message:"Stripe Secret Key (sk_test_...):",default:process.env.STRIPE_SECRET_KEY,validate:d=>d.startsWith("sk_test_")||d.startsWith("sk_live_")?!0:"Must start with sk_test_ or sk_live_"},{type:"input",name:"stripePublishableKey",message:"Stripe Publishable Key (pk_test_...):",default:process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,validate:d=>d.startsWith("pk_test_")||d.startsWith("pk_live_")?!0:"Must start with pk_test_ or pk_live_"},{type:"list",name:"template",message:"Choose your template:",choices:[{name:"SaaS Starter (pricing page + auth + dashboard)",value:"saas"},{name:"API Billing (usage-based pricing)",value:"api"},{name:"Simple Usage (metered billing)",value:"usage"},{name:"Minimal (just the SDK)",value:"minimal"}],default:e.template||"saas"},{type:"confirm",name:"createProducts",message:"Create Stripe products automatically?",default:!e.skipStripe}]),webhookSecret:""},console.log(o.blue.bold(`
\u{1F4E6} Setting up @drew/billing...
`));let a={projectScaffolded:r||!s,dependencies:!1,stripeProducts:!1,database:!1,templates:!1,env:!1},h=[],x=T("Installing dependencies...").start();try{await xe(["@drew/billing-sdk","stripe"],i,x),x.succeed("Dependencies installed"),a.dependencies=!0}catch(c){x.fail("Failed to install dependencies");let d=c instanceof Error?c.message:String(c);h.push(`Dependencies: ${d}`),console.log(o.gray(`Run manually: ${i} ${i==="npm"?"install":"add"} @drew/billing-sdk stripe`))}if(a.dependencies){let c=T("Installing additional dependencies...").start();try{await xe(["drizzle-orm","@neondatabase/serverless","drizzle-kit","@types/node","typescript","stripe"],i,c,!0),c.succeed("Additional dependencies installed")}catch{c.warn("Some additional dependencies may need manual installation"),console.log(o.gray("You can install them later if needed."))}}let f=[];if(p.createProducts&&p.stripeSecretKey){let c=T("Creating Stripe products...").start();try{if(!p.stripeSecretKey.startsWith("sk_test_")&&!p.stripeSecretKey.startsWith("sk_live_"))throw new Error("Invalid Stripe secret key format");f=await se(p.stripeSecretKey),c.succeed(`Created ${f.length} Stripe products`),a.stripeProducts=!0}catch(d){c.fail("Failed to create Stripe products");let W=d instanceof Error?d.message:String(d);h.push(`Stripe products: ${W}`),console.log(o.gray("You can create them manually in the Stripe Dashboard")),console.log(o.gray("Then update the price IDs in your code")),f=[{id:"prod_fallback",name:"Pro",priceId:"price_fallback_pro"},{id:"prod_fallback_2",name:"Enterprise",priceId:"price_fallback_enterprise"}]}}let w=T("Setting up database...").start();try{await et(t),await tt(t,i,w),w.succeed("Database configured"),a.database=!0}catch(c){w.fail("Database setup failed");let d=c instanceof Error?c.message:String(c);h.push(`Database: ${d}`),console.log(o.gray("You can set up the database later by running:")),console.log(o.gray("  npx drizzle-kit push")),console.log(o.gray(`
Make sure to set DATABASE_URL in your .env.local file`))}let P=T(`Installing ${p.template} template...`).start();try{await N.ensureDir(C.join(t,"app")),await N.ensureDir(C.join(t,"components")),await ie(p.template,f),P.succeed("Template installed"),a.templates=!0}catch(c){P.fail("Template installation failed");let d=c instanceof Error?c.message:String(c);h.push(`Templates: ${d}`),console.log(o.gray("Try running:")),console.log(o.gray("  npx @drew/billing add all"))}let re=T("Updating environment variables...").start();try{let c={STRIPE_SECRET_KEY:p.stripeSecretKey,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:p.stripePublishableKey,STRIPE_WEBHOOK_SECRET:p.webhookSecret||"whsec_... (run: stripe listen --forward-to localhost:3000/api/webhooks/stripe)",BILLING_API_URL:"http://localhost:3000"},d=C.join(t,".env.local");(await N.readFile(d,"utf-8").catch(()=>"")).includes("DATABASE_URL=")||(c.DATABASE_URL="postgresql://username:password@localhost:5432/database_name"),await ce(c),re.succeed("Environment variables configured"),a.env=!0}catch(c){re.fail("Failed to update .env");let d=c instanceof Error?c.message:String(c);h.push(`Environment: ${d}`)}let J=Date.now()-n;if(te(ee.INIT_COMPLETED,{template:p.template,durationMs:J,framework:m.name,success:Object.values(a).every(c=>c)}),ye("init_complete",J),console.log(o.green.bold(`
\u2705 Setup complete!
`)),h.length>0&&(console.log(o.yellow("\u26A0\uFE0F  Some steps failed:")),h.forEach(c=>console.log(o.gray(`  \u2022 ${c}`))),console.log()),console.log(o.white(`Next steps:
`)),a.projectScaffolded?(console.log(o.gray("1."),"Navigate to your project:",o.cyan(`cd ${g}`)),console.log(o.gray("2."),"Start your dev server:",o.cyan(`${i==="npm"?"npm run":i} dev`)),console.log(o.gray("3."),"Start Stripe webhook listener:",o.cyan("stripe listen --forward-to http://localhost:3000/api/stripe/webhook"))):(console.log(o.gray("1."),"Start your dev server:",o.cyan(`${i==="npm"?"npm run":i} dev`)),console.log(o.gray("2."),"Start Stripe webhook listener:",o.cyan("stripe listen --forward-to http://localhost:3000/api/stripe/webhook"))),a.templates){let c=a.projectScaffolded?"4":"3";console.log(o.gray(`${c}.`),"Visit",o.cyan("http://localhost:3000/pricing"))}a.database||(console.log(o.gray(`
\u26A0\uFE0F  Database not configured. Add DATABASE_URL to .env.local and run:`)),console.log(o.gray("   npx drizzle-kit push"))),console.log(),console.log(o.gray("Documentation:"),o.underline("https://billing.drew.dev/docs")),console.log(o.gray("Diagnostics:"),o.cyan("npx @drew/billing doctor")),console.log(o.gray("Support:"),o.underline("https://github.com/drew/billing/issues")),console.log(),f.length>0&&a.stripeProducts?(console.log(o.gray("Created Stripe products:")),f.forEach(c=>{console.log(o.gray(`  \u2022 ${c.name}: ${c.priceId}`))}),console.log()):f.length>0&&(console.log(o.gray("Placeholder product IDs (update these in your code):")),f.forEach(c=>{console.log(o.gray(`  \u2022 ${c.name}: ${c.priceId}`))}),console.log()),console.log(o.blue("\u{1F4CA} Help improve @drew/billing")),console.log(o.gray("Enable anonymous telemetry to help us fix bugs faster.")),console.log(o.gray(`Run: npx @drew/billing telemetry --enable
`)),await ve("init_completed",{template:p.template,framework:m.name,durationMs:J,results:a})}async function Qe(e){try{return(await N.readdir(e)).filter(r=>!r.startsWith(".")&&r!=="node_modules").length===0}catch{return!0}}async function Ze(e,n=!1){let t=C.basename(e),r="npm";try{await A("bun",["--version"],{stdio:"pipe"}),r="bun"}catch{try{await A("pnpm",["--version"],{stdio:"pipe"}),r="pnpm"}catch{try{await A("yarn",["--version"],{stdio:"pipe"}),r="yarn"}catch{}}}let s=T(`Creating Next.js project with ${r}...`).start();try{let i=r==="npm"?"npx":r,g=[...r==="npm"?["create-next-app@latest"]:["create","next-app"],".","--typescript","--tailwind","--eslint","--app","--src-dir=false","--import-alias","@/*",...n?["--yes"]:[]];return await A(i,g,{cwd:e,stdio:"pipe",timeout:3e5}),s.succeed("Next.js project created"),{success:!0,pkgManager:r,projectName:t}}catch{if(s.fail("Failed to create Next.js project"),r!=="npm"){s.text="Retrying with npm...",s.start();try{return await A("npx",["create-next-app@latest",".","--typescript","--tailwind","--eslint","--app","--src-dir=false","--import-alias","@/*",...n?["--yes"]:[]],{cwd:e,stdio:"pipe",timeout:3e5}),s.succeed("Next.js project created with npm"),{success:!0,pkgManager:"npm",projectName:t}}catch{return s.fail("All attempts failed"),{success:!1,pkgManager:"npm",projectName:t}}}return{success:!1,pkgManager:r,projectName:t}}}async function xe(e,n,t,r=!1,s=2){let i=n==="npm"?"install":"add",g=r?n==="npm"?"--save-dev":"-D":"",m=[i,...e,...g?[g]:[]];for(let p=1;p<=s;p++)try{t.text=`Installing dependencies (attempt ${p}/${s})...`,await A(n,m,{cwd:process.cwd(),stdio:"pipe",timeout:12e4});return}catch(a){if(p===s)throw a;await new Promise(h=>setTimeout(h,2e3))}}async function et(e){let n=C.join(e,"drizzle.config.ts");if(await N.pathExists(n)||await N.pathExists(C.join(e,"drizzle.config.js")))return;await N.writeFile(n,`import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
`);let r=C.join(e,"drizzle");await N.ensureDir(r),await N.writeFile(C.join(r,"schema.ts"),`import { pgTable, serial, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

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
`)}async function tt(e,n,t){try{t.text="Running database migrations...",await A("npx",["drizzle-kit","push","--force"],{cwd:e,stdio:"pipe",timeout:6e4,env:{...process.env,SKIP_ENV_VALIDATION:"true"}})}catch(r){let s=r instanceof Error?r.message:String(r);throw s.includes("DATABASE_URL")||s.includes("database")?new Error("DATABASE_URL not configured. Please add it to .env.local"):r}}import b from"chalk";import z from"ora";import O from"fs-extra";import M from"path";async function Se(){console.log(b.blue.bold(`
\u{1F50D} @drew/billing verify
`)),console.log(b.gray(`Checking your billing setup...
`));let e=[],n=z("Checking environment variables...").start();try{let a=M.join(process.cwd(),".env.local");if(!await O.pathExists(a))e.push({name:"Environment File",status:"fail",message:".env.local not found"}),n.fail();else{let x=await O.readFile(a,"utf-8"),w=["STRIPE_SECRET_KEY","NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"].filter(P=>!x.includes(P));w.length>0?(e.push({name:"Environment Variables",status:"fail",message:`Missing: ${w.join(", ")}`}),n.fail()):(e.push({name:"Environment Variables",status:"pass",message:"All required variables present"}),n.succeed())}}catch{e.push({name:"Environment Variables",status:"fail",message:"Could not read .env file"}),n.fail()}let t=z("Checking Stripe connection...").start();try{let a=(await import("stripe")).default,x=await new a(process.env.STRIPE_SECRET_KEY,{apiVersion:"2024-12-18.acacia"}).accounts.retrieve();e.push({name:"Stripe API",status:"pass",message:`Connected to ${x.settings?.dashboard?.display_name||"Stripe account"}`}),t.succeed()}catch{e.push({name:"Stripe API",status:"fail",message:"Could not connect to Stripe API"}),t.fail()}let r=z("Checking database...").start();try{let a=await O.pathExists(M.join(process.cwd(),"drizzle.config.ts")),h=await O.pathExists(M.join(process.cwd(),"drizzle/schema.ts"));a&&h?(e.push({name:"Database Setup",status:"pass",message:"Drizzle ORM configured"}),r.succeed()):(e.push({name:"Database Setup",status:"warn",message:"Database configuration not detected"}),r.warn())}catch{e.push({name:"Database Setup",status:"warn",message:"Could not verify database setup"}),r.warn()}let s=z("Checking API routes...").start();try{let a=["api/checkout/route.ts","api/webhooks/stripe/route.ts","api/entitlements/[userId]/route.ts"],h=M.join(process.cwd(),"app"),x=[];for(let f of a){let w=M.join(h,f);await O.pathExists(w)||x.push(f)}x.length>0?(e.push({name:"API Routes",status:"warn",message:`Missing routes: ${x.length}`}),s.warn()):(e.push({name:"API Routes",status:"pass",message:"All required routes present"}),s.succeed())}catch{e.push({name:"API Routes",status:"warn",message:"Could not verify API routes"}),s.warn()}let i=z("Checking SDK...").start();try{let a=await O.readJson(M.join(process.cwd(),"package.json"));a.dependencies?.["@drew/billing-sdk"]||a.devDependencies?.["@drew/billing-sdk"]?(e.push({name:"SDK Installation",status:"pass",message:"@drew/billing-sdk installed"}),i.succeed()):(e.push({name:"SDK Installation",status:"fail",message:"SDK not found in dependencies"}),i.fail())}catch{e.push({name:"SDK Installation",status:"fail",message:"Could not check package.json"}),i.fail()}console.log(b.blue.bold(`
\u{1F4CA} Summary
`));let g=e.filter(a=>a.status==="pass").length,m=e.filter(a=>a.status==="fail").length,p=e.filter(a=>a.status==="warn").length;e.forEach(a=>{let h=a.status==="pass"?b.green("\u2713"):a.status==="fail"?b.red("\u2717"):b.yellow("\u26A0"),x=a.status==="pass"?b.green:a.status==="fail"?b.red:b.yellow;console.log(`${h} ${x(a.name)}`),console.log(b.gray(`  ${a.message}`))}),console.log(),m===0?(console.log(b.green.bold("\u2705 All checks passed!")),console.log(b.gray("Your billing setup looks good."))):m>0&&g>0?(console.log(b.yellow.bold("\u26A0\uFE0F  Some checks failed")),console.log(b.gray("Review the issues above to complete your setup."))):(console.log(b.red.bold("\u274C Setup incomplete")),console.log(b.gray("Run: npx @drew/billing init"))),console.log(),console.log(b.gray("Next steps:")),console.log(b.gray("  \u2022 Start dev server: npm run dev")),console.log(b.gray("  \u2022 Start webhook listener: stripe listen --forward-to localhost:3000/api/webhooks/stripe")),console.log(b.gray("  \u2022 View docs: https://billing.drew.dev/docs")),console.log()}import v from"chalk";import nt from"ora";import Pe from"fs-extra";import rt from"path";async function Ie(e){console.log(v.blue.bold(`
\u{1F3D6}\uFE0F  @drew/billing sandbox
`));let n=rt.join(process.cwd(),".env.local"),t="";try{t=await Pe.readFile(n,"utf-8")}catch{}let r;if(e.enable)r=!0;else if(e.disable)r=!1;else{let i=t.match(/BILLING_SANDBOX_MODE=(true|false)/);r=!(i?i[1]==="true":!1)}let s=nt(r?"Enabling sandbox mode...":"Disabling sandbox mode...").start();try{t.includes("BILLING_SANDBOX_MODE=")?t=t.replace(/BILLING_SANDBOX_MODE=(true|false)/,`BILLING_SANDBOX_MODE=${r}`):t+=`
# Sandbox mode - no real charges
BILLING_SANDBOX_MODE=${r}
`,await Pe.writeFile(n,t),s.succeed()}catch(i){s.fail("Failed to update sandbox mode"),console.log(i),process.exit(1)}r?(console.log(v.green.bold(`
\u2705 Sandbox mode ENABLED
`)),console.log(v.gray("What this means:")),console.log(v.gray("  \u2022 No real charges will be processed")),console.log(v.gray("  \u2022 Stripe test mode API keys used")),console.log(v.gray("  \u2022 Webhooks simulated locally")),console.log(v.gray("  \u2022 Usage tracked but not billed")),console.log(),console.log(v.yellow("Perfect for development and testing!"))):(console.log(v.yellow.bold(`
\u26A0\uFE0F  Sandbox mode DISABLED
`)),console.log(v.gray("What this means:")),console.log(v.gray("  \u2022 Real charges will be processed")),console.log(v.gray("  \u2022 Stripe live mode API keys required")),console.log(v.gray("  \u2022 Production webhooks active")),console.log(),console.log(v.red("Make sure you have live Stripe keys configured!"))),console.log(),console.log(v.gray("Switch back anytime:")),console.log(v.cyan("  npx @drew/billing sandbox")),console.log()}import l from"chalk";import U from"fs-extra";import j from"path";async function Ne(){console.log(l.blue.bold(`
\u{1F464} @drew/billing whoami
`));try{let f=await U.readJson(j.join(process.cwd(),"package.json"));console.log(l.gray("Project:"),l.white(f.name||"Unknown")),console.log(l.gray("Version:"),l.white(f.version||"Unknown"))}catch{console.log(l.gray("Project:"),l.yellow("Could not read package.json"))}let e=j.join(process.cwd(),".env.local"),n={};try{(await U.readFile(e,"utf-8")).split(`
`).forEach(w=>{let P=w.match(/^([A-Z_]+)=(.+)$/);P&&(n[P[1]]=P[2].replace(/^["']/,"").replace(/["']$/,""))})}catch{}console.log(),console.log(l.gray("Environment:"));let t=n.STRIPE_SECRET_KEY||"",r=t.startsWith("sk_test_"),s=t.startsWith("sk_live_");r?console.log(l.gray("  Stripe:"),l.yellow("TEST MODE")):s?console.log(l.gray("  Stripe:"),l.green("LIVE MODE \u26A0\uFE0F")):console.log(l.gray("  Stripe:"),l.red("Not configured"));let i=n.BILLING_SANDBOX_MODE==="true";console.log(l.gray("  Sandbox:"),i?l.green("Enabled"):l.gray("Disabled"));let g=n.NEXT_PUBLIC_BILLING_API_URL||n.BILLING_API_URL;console.log(l.gray("  API URL:"),g||l.red("Not set"));try{let f=await U.readJson(j.join(process.cwd(),"package.json")),w=f.dependencies?.["@drew/billing-sdk"]||f.devDependencies?.["@drew/billing-sdk"];w?console.log(l.gray("  SDK:"),w):console.log(l.gray("  SDK:"),l.red("Not installed"))}catch{}console.log();let m=j.join(process.cwd(),"components/billing");try{let w=(await U.readdir(m)).filter(P=>P.endsWith(".tsx"));w.length>0?(console.log(l.gray("Installed Components:")),w.forEach(P=>{console.log(l.gray("  \u2022"),P.replace(".tsx",""))})):(console.log(l.gray("Components:"),l.yellow("None installed")),console.log(l.gray("  Install with: npx @drew/billing add <component>")))}catch{console.log(l.gray("Components:"),l.yellow("None installed"))}console.log();let p=await U.pathExists(j.join(process.cwd(),"drizzle.config.ts"));console.log(l.gray("Database:"),p?l.green("Configured"):l.yellow("Not configured"));let a=j.join(process.cwd(),"app/api"),h=await U.pathExists(j.join(a,"checkout/route.ts")),x=await U.pathExists(j.join(a,"webhooks/stripe/route.ts"));console.log(l.gray("API Routes:")),console.log(l.gray("  /api/checkout"),h?l.green("\u2713"):l.red("\u2717")),console.log(l.gray("  /api/webhooks/stripe"),x?l.green("\u2713"):l.red("\u2717")),console.log(),console.log(l.gray("Commands:")),console.log(l.gray("  init       Initialize billing")),console.log(l.gray("  add        Add UI components")),console.log(l.gray("  verify     Verify setup")),console.log(l.gray("  sandbox    Toggle sandbox mode")),console.log()}import u from"chalk";async function Ce(e){console.log(u.blue.bold(`
\u{1F4CA} Telemetry Settings
`));let n=F();if(e.enable){he(),console.log(u.green("\u2705 Anonymous telemetry enabled")),console.log(u.gray(`
We collect:`)),console.log(u.gray("  \u2022 Command usage (init, add, verify, etc.)")),console.log(u.gray("  \u2022 Performance metrics (timing)")),console.log(u.gray("  \u2022 Error reports (no stack traces with PII)")),console.log(u.gray(`
We NEVER collect:`)),console.log(u.gray("  \u2022 Personal information")),console.log(u.gray("  \u2022 Stripe keys or API credentials")),console.log(u.gray("  \u2022 Code or project details")),console.log(u.gray("  \u2022 IP addresses")),B("telemetry_enabled");return}if(e.disable){be(),console.log(u.yellow("\u274C Anonymous telemetry disabled")),console.log(u.gray("You can re-enable anytime with: npx @drew/billing telemetry --enable"));return}console.log(u.white("Current status:")),console.log(`  Enabled: ${n.enabled?u.green("Yes"):u.red("No")}`),n.machineId&&console.log(`  Machine ID: ${u.gray(n.machineId)}`),n.optedInAt&&console.log(`  Decision date: ${u.gray(n.optedInAt)}`),console.log(u.gray(`
Usage:`)),console.log(u.gray("  npx @drew/billing telemetry --enable   # Enable telemetry")),console.log(u.gray("  npx @drew/billing telemetry --disable  # Disable telemetry")),console.log(u.gray(`  npx @drew/billing telemetry            # Show status
`)),n.optedInAt||(console.log(u.blue("\u{1F4A1} Why enable telemetry?")),console.log(u.gray("Anonymous data helps us improve the CLI and catch bugs faster.")),console.log(u.gray(`No personal information is ever collected.
`)))}import y from"chalk";import{readFileSync as K,existsSync as $}from"fs";import{join as R}from"path";import{execa as st}from"execa";async function Ee(){console.log(y.blue.bold(`
\u{1F50D} @drew/billing doctor
`)),console.log(y.gray(`Running diagnostics...
`));let e=[];e.push(await at()),e.push(await ot()),e.push(await it()),e.push(await lt()),e.push(await ct()),e.push(await pt()),e.push(await dt()),ut(e)}async function at(){let e=R(process.cwd(),".env.local"),n=R(process.cwd(),".env.example"),t="";$(e)?t=K(e,"utf-8"):$(R(process.cwd(),".env"))&&(t=K(R(process.cwd(),".env"),"utf-8"));let r=["STRIPE_SECRET_KEY","NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY","STRIPE_WEBHOOK_SECRET"],s=r.filter(g=>!t.includes(g));if(s.length===0)return{name:"Environment Variables",status:"pass",message:"All required variables configured"};let i=$(n);return{name:"Environment Variables",status:"fail",message:`Missing: ${s.join(", ")}`,fix:i?"cp .env.example .env.local && edit with your Stripe keys":`Create .env.local with:
${r.map(g=>`${g}=...`).join(`
`)}`}}async function ot(){try{let e=new AbortController,n=setTimeout(()=>e.abort(),2e3),t=await fetch("http://localhost:3000/api/health",{signal:e.signal}).catch(()=>null);return clearTimeout(n),t?.ok?{name:"API Connectivity",status:"pass",message:"Billing API responding at localhost:3000"}:{name:"API Connectivity",status:"warn",message:"Dev server not running or API not accessible",fix:"Start dev server: npm run dev"}}catch{return{name:"API Connectivity",status:"warn",message:"Could not connect to localhost:3000",fix:"Start dev server: npm run dev"}}}async function it(){let e=R(process.cwd(),".env.local"),n="";if($(e)){let r=K(e,"utf-8").match(/STRIPE_WEBHOOK_SECRET=(.+)/);r&&(n=r[1].trim())}return!n||n==="whsec_..."?{name:"Webhook Configuration",status:"fail",message:"Webhook secret not configured",fix:`1. Run: stripe listen --forward-to http://localhost:3000/api/stripe/webhook
2. Copy webhook secret to .env.local`}:n.startsWith("whsec_")?{name:"Webhook Configuration",status:"pass",message:"Webhook secret configured"}:{name:"Webhook Configuration",status:"warn",message:"Webhook secret format looks unusual",fix:"Verify STRIPE_WEBHOOK_SECRET starts with 'whsec_'"}}async function lt(){try{if(!$(R(process.cwd(),"drizzle.config.ts")))return{name:"Database Connection",status:"fail",message:"No Drizzle config found",fix:"Run: npx @drew/billing init to set up database"};try{return await st("npx",["drizzle-kit","check"],{cwd:process.cwd(),timeout:1e4,reject:!1}),{name:"Database Connection",status:"pass",message:"Database configuration found"}}catch{return{name:"Database Connection",status:"warn",message:"Database config exists but connection not verified",fix:"Run: npx drizzle-kit push to sync schema"}}}catch{return{name:"Database Connection",status:"warn",message:"Could not verify database connection"}}}async function ct(){let e=R(process.cwd(),".env.local"),n="";if($(e)){let r=K(e,"utf-8").match(/STRIPE_SECRET_KEY=(.+)/);r&&(n=r[1].trim())}return n?n.startsWith("sk_test_")?{name:"Stripe Configuration",status:"pass",message:"Test mode Stripe key configured"}:n.startsWith("sk_live_")?{name:"Stripe Configuration",status:"warn",message:"\u26A0\uFE0F Live Stripe key detected",fix:"Use test keys for development: https://dashboard.stripe.com/test/apikeys"}:{name:"Stripe Configuration",status:"fail",message:"Invalid Stripe key format",fix:"Key should start with sk_test_ or sk_live_"}:{name:"Stripe Configuration",status:"fail",message:"STRIPE_SECRET_KEY not found",fix:"Add STRIPE_SECRET_KEY=sk_test_... to .env.local"}}async function pt(){let e=R(process.cwd(),"package.json");if(!$(e))return{name:"Dependencies",status:"fail",message:"No package.json found",fix:"Run: npm init"};try{let n=JSON.parse(K(e,"utf-8")),t={...n.dependencies,...n.devDependencies},s=["@drew/billing-sdk","stripe"].filter(i=>!t[i]);return s.length===0?{name:"Dependencies",status:"pass",message:"All required packages installed"}:{name:"Dependencies",status:"fail",message:`Missing: ${s.join(", ")}`,fix:`npm install ${s.join(" ")}`}}catch{return{name:"Dependencies",status:"warn",message:"Could not parse package.json"}}}async function dt(){let e=await q();return e.name==="nextjs"?{name:"Framework Support",status:"pass",message:`Next.js ${e.version||""} detected`}:{name:"Framework Support",status:"warn",message:`${e.name} detected (limited support)`,fix:"Next.js is fully supported. Other frameworks have basic support."}}function ut(e){let n=e.filter(s=>s.status==="pass").length,t=e.filter(s=>s.status==="fail").length,r=e.filter(s=>s.status==="warn").length;console.log(y.white.bold(`Results:
`));for(let s of e){let i=s.status==="pass"?y.green("\u2713"):s.status==="fail"?y.red("\u2717"):y.yellow("\u26A0");console.log(`${i} ${y.white(s.name)}`),console.log(`  ${y.gray(s.message)}`),s.fix&&console.log(`  ${y.cyan("Fix:")} ${s.fix}`),console.log()}console.log(y.white.bold("Summary:")),console.log(`  ${y.green(`${n} passing`)}`),t>0&&console.log(`  ${y.red(`${t} failing`)}`),r>0&&console.log(`  ${y.yellow(`${r} warnings`)}`),t===0&&r===0?console.log(y.green.bold(`
\u2705 All checks passed! Your billing setup looks good.
`)):t===0?console.log(y.yellow(`
\u26A0\uFE0F  Some warnings - review above.
`)):(console.log(y.red(`
\u274C ${t} issue(s) need attention. Run the suggested fixes above.
`)),console.log(y.gray(`Need help? https://billing.drew.dev/docs/troubleshooting
`)))}var E=new gt;E.name("@drew/billing").description("CLI for @drew/billing - Add subscriptions to your app in 10 minutes").version("1.0.0");E.command("init").description("Initialize @drew/billing in your Next.js project").option("--skip-stripe","Skip Stripe product creation").option("--template <type>","Template type (saas, api, usage)","saas").option("--yes","Skip prompts and use defaults").action(ke);E.command("add <component>").description("Add a billing component (pricing-table, upgrade-button, usage-meter)").option("--path <path>","Custom installation path").action(L);E.command("verify").description("Verify your billing setup is working correctly").action(Se);E.command("sandbox").description("Toggle sandbox mode for testing without real charges").option("--enable","Enable sandbox mode").option("--disable","Disable sandbox mode").action(Ie);E.command("whoami").description("Show current billing configuration").action(Ne);E.command("telemetry").description("Manage anonymous usage telemetry").option("--enable","Enable telemetry").option("--disable","Disable telemetry").action(Ce);E.command("doctor").description("Diagnose billing setup issues").action(Ee);process.argv.length===2&&(console.log(H.blue.bold(`
\u26A1 @drew/billing
`)),console.log(`Add subscriptions to your app in 10 minutes.
`),console.log(H.gray("Quick start:")),console.log(`  npx @drew/billing init
`),console.log(H.gray("Commands:")),console.log("  init       Initialize billing in your project"),console.log("  add        Add prebuilt UI components"),console.log("  verify     Verify your setup"),console.log("  sandbox    Toggle sandbox mode"),console.log("  whoami     Show current configuration"),console.log("  doctor     Diagnose setup issues"),console.log(`  telemetry  Manage usage telemetry
`),console.log(H.gray("Documentation:")),console.log(`  https://billing.drew.dev/docs
`));E.parse();
//# sourceMappingURL=index.js.map
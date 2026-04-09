#!/usr/bin/env node
import{Command as bt}from"commander";import H from"chalk";import a from"chalk";import ae from"inquirer";import E from"ora";import N from"fs-extra";import C from"path";import{execa as U}from"execa";import D from"fs-extra";import L from"path";async function V(){let e=process.cwd(),r=L.join(e,"package.json");if(await D.pathExists(r)){let n=await D.readJson(r),t={...n.dependencies,...n.devDependencies};if(t.next){let s=await D.pathExists(L.join(e,"app")),o=await D.pathExists(L.join(e,"pages"));return{name:"nextjs",version:t.next,type:s?"app":o?"pages":"app"}}if(t.react)return{name:"react",version:t.react};if(t.vue||t["@vue/core"])return{name:"vue",version:t.vue||t["@vue/core"]};if(t.express)return{name:"express",version:t.express}}return await D.pathExists(L.join(e,"next.config.js"))||await D.pathExists(L.join(e,"next.config.ts"))||await D.pathExists(L.join(e,"next.config.mjs"))?{name:"nextjs",type:"app"}:await D.pathExists(L.join(e,"vite.config.ts"))?{name:"react"}:{name:"unknown"}}import Le from"stripe";async function Z(e,r,n){try{let o=await e.prices.search({query:`lookup_key:"${n.lookup_key}"`});if(o.data.length>0){let g=o.data[0],h=await e.products.retrieve(typeof g.product=="string"?g.product:g.product.id);return{productId:h.id,priceId:g.id,name:h.name}}}catch{}let t=await e.products.create(r),s=await e.prices.create({product:t.id,unit_amount:n.unit_amount,currency:n.currency,recurring:n.recurring,lookup_key:n.lookup_key});return{productId:t.id,priceId:s.id,name:t.name}}async function ce(e){let r=new Le(e,{apiVersion:"2023-10-16"}),n=[];try{let t=await Z(r,{name:"Pro",description:"For growing businesses",metadata:{tier:"pro",features:JSON.stringify(["10,000 API calls/mo","Unlimited projects","Priority support","Advanced analytics"])}},{unit_amount:2900,currency:"usd",recurring:{interval:"month"},lookup_key:`pro_monthly_${Date.now()}`});n.push({id:t.productId,name:t.name,priceId:t.priceId})}catch(t){console.warn("Failed to create Pro plan:",t instanceof Error?t.message:String(t))}try{let t=await Z(r,{name:"Enterprise",description:"For large organizations",metadata:{tier:"enterprise",features:JSON.stringify(["Unlimited API calls","Custom integrations","SLA guarantee","Dedicated support"])}},{unit_amount:9900,currency:"usd",recurring:{interval:"month"},lookup_key:`enterprise_monthly_${Date.now()}`});n.push({id:t.productId,name:t.name,priceId:t.priceId})}catch(t){console.warn("Failed to create Enterprise plan:",t instanceof Error?t.message:String(t))}try{let t=await Z(r,{name:"API Calls",description:"Per-call pricing for API usage",metadata:{type:"usage",unit:"api_call"}},{unit_amount:1,currency:"usd",recurring:{interval:"month",usage_type:"metered"},lookup_key:`api_calls_${Date.now()}`});n.push({id:t.productId,name:"API Calls (Usage)",priceId:t.priceId})}catch(t){console.warn("Failed to create Usage plan:",t instanceof Error?t.message:String(t))}if(n.length===0)throw new Error("Failed to create any Stripe products. Check your API key and try again.");return n}import k from"fs-extra";import S from"path";import P from"chalk";import Ae from"ora";import pe from"fs-extra";import de from"path";var ee={"pricing-table":{name:"PricingTable",description:"Beautiful pricing table with Stripe checkout integration",files:["pricing-table.tsx"]},"upgrade-button":{name:"UpgradeButton",description:"Smart upgrade button with plan comparison",files:["upgrade-button.tsx"]},"usage-meter":{name:"UsageMeter",description:"Real-time usage visualization with limits",files:["usage-meter.tsx"]},"current-plan":{name:"CurrentPlanBadge",description:"Shows current plan with upgrade CTA",files:["current-plan.tsx"]},"billing-portal":{name:"BillingPortalButton",description:"Opens Stripe customer portal",files:["billing-portal-button.tsx"]},"subscription-gate":{name:"SubscriptionGate",description:"Blocks content based on subscription status",files:["subscription-gate.tsx"]},"trial-banner":{name:"TrialBanner",description:"Shows trial status and countdown",files:["trial-banner.tsx"]},all:{name:"All Components",description:"Install all billing components",files:["pricing-table.tsx","upgrade-button.tsx","usage-meter.tsx","current-plan.tsx","billing-portal-button.tsx","subscription-gate.tsx","trial-banner.tsx","index.ts"]}};async function A(e,r){console.log(P.blue.bold(`
\u{1F4E6} @drew/billing add
`));let n=Object.keys(ee);n.includes(e)||(console.log(P.red(`Invalid component: ${e}
`)),console.log(P.gray("Available components:")),n.forEach(c=>{if(c==="all")return;let p=ee[c];console.log(P.gray(`  \u2022 ${c}`)+` - ${p.description}`)}),console.log(P.gray("  \u2022 all - Install all components")),console.log(),process.exit(1));let t=ee[e],s=r.path||"components/billing",o=r.cwd||process.cwd(),g=de.join(o,s);console.log(P.gray(`Installing ${t.name}...
`)),await pe.ensureDir(g);let h=Ae("Creating components...").start();try{for(let c of t.files){let p=Ue(c);await pe.writeFile(de.join(g,c),p)}h.succeed(`Installed ${t.name} to ${s}/`)}catch(c){h.fail("Failed to install component"),console.error(c),process.exit(1)}console.log(P.green.bold(`
\u2705 Component installed!
`)),console.log(P.gray("Usage:")),console.log(e==="all"?P.cyan(`import { PricingTable, UpgradeButton } from "${s}";`):P.cyan(`import { ${t.name} } from "${s}/${e.replace("billing-portal","billing-portal-button")}";`)),console.log(),console.log(P.gray("Documentation:"),P.underline("https://github.com/drewsephski/monetize/tree/main/packages/cli#readme")),console.log()}function Ue(e){return{"pricing-table.tsx":$e(),"upgrade-button.tsx":Be(),"usage-meter.tsx":Me(),"current-plan.tsx":Oe(),"billing-portal-button.tsx":Fe(),"subscription-gate.tsx":ze(),"trial-banner.tsx":Ke(),"index.ts":We()}[e]||`// ${e} - Component template
export function Placeholder() { return null; }`}function $e(){return`"use client";

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
`}function Be(){return`"use client";

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
`}function Me(){return`"use client";

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
`}function Oe(){return`"use client";

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
`}function Fe(){return`"use client";

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
`}function ze(){return`"use client";

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
`}function Ke(){return`"use client";

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
`}function We(){return`export { PricingTable } from "./pricing-table";
export { UpgradeButton } from "./upgrade-button";
export { UsageMeter } from "./usage-meter";
export { CurrentPlanBadge } from "./current-plan";
export { BillingPortalButton } from "./billing-portal-button";
export { SubscriptionGate } from "./subscription-gate";
export { TrialBanner } from "./trial-banner";
`}async function ue(e,r,n){let t=n||process.cwd();switch(e){case"saas":await qe(t,r);break;case"api":await Ye(t,r);break;case"usage":await Je(t,r);break;case"minimal":break;default:throw new Error(`Unknown template: ${e}`)}}async function qe(e,r){await A("all",{path:"components/billing",cwd:e});let n=r.find(p=>p.name==="Pro"),t=r.find(p=>p.name==="Enterprise"),s=n?.priceId||"price_placeholder_pro",o=t?.priceId||"price_placeholder_enterprise",g=`"use client";

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
`;await k.ensureDir(S.join(e,"app/pricing")),await k.writeFile(S.join(e,"app/pricing/page.tsx"),g);let h=`"use client";

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
`;await k.ensureDir(S.join(e,"app/billing")),await k.writeFile(S.join(e,"app/billing/page.tsx"),h);let c=`"use client";

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
`;await k.ensureDir(S.join(e,"app/demo")),await k.writeFile(S.join(e,"app/demo/page.tsx"),c),await Ve(e)}async function Ve(e){let r=`import { NextRequest, NextResponse } from "next/server";

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
`;await k.ensureDir(S.join(e,"app/api/billing/checkout")),await k.writeFile(S.join(e,"app/api/billing/checkout/route.ts"),r);let n=`import { NextRequest, NextResponse } from "next/server";

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
`;await k.ensureDir(S.join(e,"app/api/billing/portal")),await k.writeFile(S.join(e,"app/api/billing/portal/route.ts"),n)}async function Ye(e,r){await A("usage-meter",{path:"components/billing",cwd:e});let n=`import { NextRequest, NextResponse } from "next/server";

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
`;await k.ensureDir(S.join(e,"app/api/example")),await k.writeFile(S.join(e,"app/api/example/route.ts"),n),await k.writeFile(S.join(e,"middleware.ts"),`import { NextResponse } from "next/server";
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
`)}async function Je(e,r){await A("usage-meter",{path:"components/billing",cwd:e}),await A("upgrade-button",{path:"components/billing",cwd:e});let n=`"use client";

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
`;await k.ensureDir(S.join(e,"app/dashboard")),await k.writeFile(S.join(e,"app/dashboard/page.tsx"),n)}import ge from"fs-extra";import Ge from"path";async function me(e){let r=Ge.join(process.cwd(),".env.local"),n="";try{n=await ge.readFile(r,"utf-8")}catch{}for(let[t,s]of Object.entries(e)){let o=`${t}=${s}`;n.includes(`${t}=`)?n=n.replace(new RegExp(`${t}=.*`),o):(n+=n.endsWith(`
`)?"":`
`,n+=`${o}
`)}await ge.writeFile(r,n)}import Y from"fs-extra";import J from"path";import{execa as Mt}from"execa";async function fe(){let e=process.cwd();return await Y.pathExists(J.join(e,"bun.lockb"))||await Y.pathExists(J.join(e,"bun.lock"))?"bun":await Y.pathExists(J.join(e,"pnpm-lock.yaml"))?"pnpm":await Y.pathExists(J.join(e,"yarn.lock"))?"yarn":"npm"}import{createHash as He}from"crypto";import{readFileSync as Xe,existsSync as ye,writeFileSync as Qe,mkdirSync as Ze}from"fs";import{homedir as we}from"os";import{join as ve}from"path";import Vt from"chalk";var te=ve(we(),".drew-billing"),ne=ve(te,"telemetry.json"),he=process.env.TELEMETRY_ENDPOINT||"";function be(){let e=`${we()}_${process.platform}_${process.arch}`;return He("sha256").update(e).digest("hex").substring(0,16)}function z(){try{if(ye(ne)){let e=JSON.parse(Xe(ne,"utf-8"));return{enabled:e.enabled??!1,machineId:e.machineId||be(),optedInAt:e.optedInAt}}}catch{}return{enabled:!1,machineId:be()}}function xe(e){try{ye(te)||Ze(te,{recursive:!0}),Qe(ne,JSON.stringify(e,null,2))}catch{}}function ke(){let e=z();e.enabled=!0,e.optedInAt=new Date().toISOString(),xe(e)}function Se(){let e=z();e.enabled=!1,xe(e)}function et(){return`cli_${Math.random().toString(36).substring(2,15)}_${Date.now()}`}function M(e,r){let n=z();if(!n.enabled)return;let t={type:e,timestamp:new Date().toISOString(),machineId:n.machineId,sessionId:et(),cliVersion:"1.0.0",metadata:r};tt(t).catch(()=>{})}function Pe(e,r,n){M(e,{...n,durationMs:r})}async function tt(e){if(!he){process.env.DEBUG==="true"&&console.log("[Telemetry]",e);return}try{await fetch(he,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})}catch{}}var re={CLI_INSTALL:"cli_install",INIT_STARTED:"init_started",INIT_COMPLETED:"init_completed",SANDBOX_STARTED:"sandbox_started",FIRST_CHECKOUT:"first_checkout",FIRST_SUBSCRIPTION:"first_subscription"};function se(e,r){M(`funnel_${e}`,r)}import G from"chalk";import Ie from"inquirer";async function Ne(e,r){console.log(),console.log(G.blue.bold("\u{1F4E3} Quick Feedback")),console.log(G.gray("Your feedback helps us improve.")),console.log();try{let{wasEasy:n}=await Ie.prompt([{type:"confirm",name:"wasEasy",message:"Was this easy to set up?",default:!0}]),t;if(!n){let{feedback:s}=await Ie.prompt([{type:"input",name:"feedback",message:"What was difficult? (optional, 1 sentence)"}]);t=s}M("feedback_collected",{eventType:e,rating:n?"positive":"negative",feedback:t,...r}),console.log(),console.log(n?G.green("\u2728 Thanks! Glad it went smoothly."):G.yellow("\u{1F4DD} Thanks for the feedback \u2014 we'll use it to improve.")),console.log()}catch{}}async function Ce(e){console.log(a.blue.bold(`
\u26A1 @drew/billing init
`)),se(re.INIT_STARTED,{template:e.template});let r=Date.now(),n=process.cwd(),t=await nt(n),s=await N.pathExists(C.join(n,"package.json"));console.log(a.gray(`Debug: cwd=${n}, isEmptyDir=${t}, hasPackageJson=${s}`));let o="npm",g=C.basename(n),h={name:"nextjs"},c=!1;if(t||!s){console.log(a.yellow("\u{1F4C1} No existing project detected."));let l=e.yes;e.yes||(l=(await ae.prompt([{type:"confirm",name:"shouldScaffold",message:"Create a new Next.js project here?",default:!0}])).shouldScaffold),l||(console.log(a.gray(`
Aborted. Please run this in an existing Next.js project directory.
`)),process.exit(0));let d=await rt(n,e.yes);d.success||(console.log(a.red(`
\u274C Failed to scaffold Next.js project.`)),console.log(a.gray(`Please try manually: npx create-next-app@latest .
`)),process.exit(1)),o=d.pkgManager,g=d.projectName,c=!0,h={name:"nextjs",version:"latest"},console.log(a.green(`
\u2705 Created Next.js project: ${g}
`)),await N.pathExists(C.join(n,"package.json"))||(console.log(a.red(`
\u274C Scaffolded project missing package.json`)),process.exit(1))}else{let l=E("Detecting framework...").start(),d=await V();if(h={name:d.name,version:d.version},d.name!=="nextjs"){l.warn(`Detected: ${d.name} (limited support)`),console.log(a.yellow(`
\u26A0\uFE0F  Currently only Next.js is fully supported.`)),console.log(a.gray(`Other frameworks coming soon: React, Vue, Svelte, Express
`));let{continueAnyway:q}=await ae.prompt([{type:"confirm",name:"continueAnyway",message:"Continue with manual setup?",default:!1}]);q||(console.log(a.gray(`
Aborted.
`)),process.exit(0))}else l.succeed(`Detected: ${a.green("Next.js")} ${d.version||""}`);o=await fe()}console.log(a.gray(`Using package manager: ${o}
`));let p;e.yes?p={stripeSecretKey:process.env.STRIPE_SECRET_KEY||"",stripePublishableKey:process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY||"",webhookSecret:process.env.STRIPE_WEBHOOK_SECRET||"",databaseUrl:process.env.DATABASE_URL||"",template:e.template||"saas",createProducts:!e.skipStripe}:p={...await ae.prompt([{type:"input",name:"stripeSecretKey",message:"Stripe Secret Key (sk_test_...):",default:process.env.STRIPE_SECRET_KEY,validate:d=>d.startsWith("sk_test_")||d.startsWith("sk_live_")?!0:"Must start with sk_test_ or sk_live_"},{type:"input",name:"stripePublishableKey",message:"Stripe Publishable Key (pk_test_...):",default:process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,validate:d=>d.startsWith("pk_test_")||d.startsWith("pk_live_")?!0:"Must start with pk_test_ or pk_live_"},{type:"input",name:"databaseUrl",message:"Database URL (postgresql://...):",default:process.env.DATABASE_URL,validate:d=>!d||d.trim()===""?"Database URL is required (use your Neon or local Postgres URL)":!d.startsWith("postgresql://")&&!d.startsWith("postgres://")?"Must start with postgresql:// or postgres://":!0},{type:"list",name:"template",message:"Choose your template:",choices:[{name:"SaaS Starter (pricing page + auth + dashboard)",value:"saas"},{name:"API Billing (usage-based pricing)",value:"api"},{name:"Simple Usage (metered billing)",value:"usage"},{name:"Minimal (just the SDK)",value:"minimal"}],default:e.template||"saas"},{type:"confirm",name:"createProducts",message:"Create Stripe products automatically?",default:!e.skipStripe}]),webhookSecret:""},console.log(a.blue.bold(`
\u{1F4E6} Setting up @drew/billing...
`));let u={projectScaffolded:c,dependencies:!1,stripeProducts:!1,database:!1,templates:!1,env:!1},y=[],f=E("Installing core dependencies...").start();try{await oe(["stripe"],o,f,!1,2,n),f.succeed("Core dependencies installed"),u.dependencies=!0}catch(l){f.fail("Failed to install core dependencies");let d=l instanceof Error?l.message:String(l);y.push(`Dependencies: ${d}`),console.log(a.gray(`Run manually: ${o} ${o==="npm"?"install":"add"} stripe`))}let x=E("Installing database dependencies...").start();try{await oe(["drizzle-orm","@neondatabase/serverless","drizzle-kit"],o,x,!1,2,n),x.succeed("Database dependencies installed")}catch(l){x.fail("Failed to install database dependencies");let d=l instanceof Error?l.message:String(l);y.push(`DB Dependencies: ${d}`),console.log(a.gray(`Run manually: ${o} ${o==="npm"?"install":"add"} drizzle-orm @neondatabase/serverless drizzle-kit`))}let I=E("Installing dev dependencies...").start();try{await oe(["@types/node","typescript"],o,I,!0,2,n),I.succeed("Dev dependencies installed")}catch{I.warn("Some dev dependencies may need manual installation")}console.log(a.gray(`
Note: @drew/billing-sdk will be available when published. For now, the CLI provides all needed components.
`));let T=[];if(p.createProducts&&p.stripeSecretKey){let l=E("Creating Stripe products...").start();try{if(!p.stripeSecretKey.startsWith("sk_test_")&&!p.stripeSecretKey.startsWith("sk_live_"))throw new Error("Invalid Stripe secret key format");T=await ce(p.stripeSecretKey),l.succeed(`Created ${T.length} Stripe products`),u.stripeProducts=!0}catch(d){l.fail("Failed to create Stripe products");let q=d instanceof Error?d.message:String(d);y.push(`Stripe products: ${q}`),console.log(a.gray("You can create them manually in the Stripe Dashboard")),console.log(a.gray("Then update the price IDs in your code")),T=[{id:"prod_fallback",name:"Pro",priceId:"price_fallback_pro"},{id:"prod_fallback_2",name:"Enterprise",priceId:"price_fallback_enterprise"}]}}let X=E("Setting up database...").start();try{await st(n),await at(n,o,X),X.succeed("Database configured"),u.database=!0}catch(l){X.fail("Database setup failed");let d=l instanceof Error?l.message:String(l);y.push(`Database: ${d}`),console.log(a.gray("You can set up the database later by running:")),console.log(a.gray("  npx drizzle-kit push")),console.log(a.gray(`
Make sure to set DATABASE_URL in your .env.local file`))}let ie=E(`Installing ${p.template} template...`).start();try{await N.ensureDir(C.join(n,"app")),await N.ensureDir(C.join(n,"components")),await ue(p.template,T,n),ie.succeed("Template installed"),u.templates=!0}catch(l){ie.fail("Template installation failed");let d=l instanceof Error?l.message:String(l);y.push(`Templates: ${d}`),console.log(a.gray("Try running:")),console.log(a.gray("  npx @drew/billing add all"))}let le=E("Updating environment variables...").start();try{let l={STRIPE_SECRET_KEY:p.stripeSecretKey,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:p.stripePublishableKey,STRIPE_WEBHOOK_SECRET:p.webhookSecret||"whsec_... (run: stripe listen --forward-to localhost:3000/api/webhooks/stripe)",DATABASE_URL:p.databaseUrl||"postgresql://username:password@localhost:5432/database_name",BILLING_API_URL:"http://localhost:3000"};await me(l),le.succeed("Environment variables configured"),u.env=!0}catch(l){le.fail("Failed to update .env");let d=l instanceof Error?l.message:String(l);y.push(`Environment: ${d}`)}let Q=Date.now()-r;if(se(re.INIT_COMPLETED,{template:p.template,durationMs:Q,framework:h.name,success:Object.values(u).every(l=>l)}),Pe("init_complete",Q),console.log(a.green.bold(`
\u2705 Setup complete!
`)),y.length>0&&(console.log(a.yellow("\u26A0\uFE0F  Some steps failed:")),y.forEach(l=>console.log(a.gray(`  \u2022 ${l}`))),console.log()),console.log(a.white(`Next steps:
`)),u.projectScaffolded?(console.log(a.gray("1."),"Navigate to your project:",a.cyan(`cd ${g}`)),console.log(a.gray("2."),"Start your dev server:",a.cyan(`${o==="npm"?"npm run":o} dev`)),console.log(a.gray("3."),"Start Stripe webhook listener:",a.cyan("stripe listen --forward-to http://localhost:3000/api/stripe/webhook"))):(console.log(a.gray("1."),"Start your dev server:",a.cyan(`${o==="npm"?"npm run":o} dev`)),console.log(a.gray("2."),"Start Stripe webhook listener:",a.cyan("stripe listen --forward-to http://localhost:3000/api/stripe/webhook"))),u.templates){let l=u.projectScaffolded?"4":"3";console.log(a.gray(`${l}.`),"Visit",a.cyan("http://localhost:3000/pricing"))}u.database||(console.log(a.gray(`
\u26A0\uFE0F  Database not configured. Add DATABASE_URL to .env.local and run:`)),console.log(a.gray("   npx drizzle-kit push"))),console.log(),console.log(a.gray("Documentation:"),a.underline("https://github.com/drewsephski/monetize/tree/main/packages/cli#readme")),console.log(a.gray("Diagnostics:"),a.cyan("npx drew-billing-cli doctor")),console.log(a.gray("Support:"),a.underline("https://github.com/drewsephski/monetize/issues")),console.log(),T.length>0&&u.stripeProducts?(console.log(a.gray("Created Stripe products:")),T.forEach(l=>{console.log(a.gray(`  \u2022 ${l.name}: ${l.priceId}`))}),console.log()):T.length>0&&(console.log(a.gray("Placeholder product IDs (update these in your code):")),T.forEach(l=>{console.log(a.gray(`  \u2022 ${l.name}: ${l.priceId}`))}),console.log()),console.log(a.blue("\u{1F4CA} Help improve @drew/billing")),console.log(a.gray("Enable anonymous telemetry to help us fix bugs faster.")),console.log(a.gray(`Run: npx @drew/billing telemetry --enable
`)),await Ne("init_completed",{template:p.template,framework:h.name,durationMs:Q,results:u})}async function nt(e){try{return(await N.readdir(e)).filter(t=>!t.startsWith(".")&&t!=="node_modules").length===0}catch{return!0}}async function rt(e,r=!1){let n=C.basename(e),t="npm";try{await U("bun",["--version"],{stdio:"pipe"}),t="bun"}catch{try{await U("pnpm",["--version"],{stdio:"pipe"}),t="pnpm"}catch{try{await U("yarn",["--version"],{stdio:"pipe"}),t="yarn"}catch{}}}let s=E(`Creating Next.js project with ${t}...`).start();try{let o=t==="npm"?"npx":t,g=[...t==="npm"?["create-next-app@latest"]:["create","next-app"],".","--typescript","--tailwind","--eslint","--app","--src-dir=false","--import-alias","@/*",...r?["--yes"]:[]];return await U(o,g,{cwd:e,stdio:"pipe",timeout:3e5}),s.succeed("Next.js project created"),{success:!0,pkgManager:t,projectName:n}}catch{if(s.fail("Failed to create Next.js project"),t!=="npm"){s.text="Retrying with npm...",s.start();try{return await U("npx",["create-next-app@latest",".","--typescript","--tailwind","--eslint","--app","--src-dir=false","--import-alias","@/*",...r?["--yes"]:[]],{cwd:e,stdio:"pipe",timeout:3e5}),s.succeed("Next.js project created with npm"),{success:!0,pkgManager:"npm",projectName:n}}catch{return s.fail("All attempts failed"),{success:!1,pkgManager:"npm",projectName:n}}}return{success:!1,pkgManager:t,projectName:n}}}async function oe(e,r,n,t=!1,s=2,o){let g=r==="npm"?"install":"add",h=t?r==="npm"?"--save-dev":"-D":"",c=[g,...e,...h?[h]:[]],p=o||process.cwd();for(let u=1;u<=s;u++)try{n.text=`Installing dependencies (attempt ${u}/${s})...`,await U(r,c,{cwd:p,stdio:"pipe",timeout:12e4});return}catch(y){let f=y instanceof Error?y.message:String(y);if(console.log(a.gray(`  Install attempt ${u} failed: ${f.substring(0,100)}`)),u===s)throw y;await new Promise(x=>setTimeout(x,2e3))}}async function st(e){let r=C.join(e,"drizzle.config.ts");if(await N.pathExists(r)||await N.pathExists(C.join(e,"drizzle.config.js")))return;await N.writeFile(r,`import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
`);let t=C.join(e,"drizzle");await N.ensureDir(t),await N.writeFile(C.join(t,"schema.ts"),`import { pgTable, serial, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

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
`)}async function at(e,r,n){try{n.text="Running database migrations...",await U("npx",["drizzle-kit","push","--force"],{cwd:e,stdio:"pipe",timeout:6e4,env:{...process.env,SKIP_ENV_VALIDATION:"true"}})}catch(t){let s=t instanceof Error?t.message:String(t);throw s.includes("DATABASE_URL")||s.includes("database")?new Error("DATABASE_URL not configured. Please add it to .env.local"):t}}import b from"chalk";import K from"ora";import O from"fs-extra";import F from"path";async function Ee(){console.log(b.blue.bold(`
\u{1F50D} @drew/billing verify
`)),console.log(b.gray(`Checking your billing setup...
`));let e=[],r=K("Checking environment variables...").start();try{let c=F.join(process.cwd(),".env.local");if(!await O.pathExists(c))e.push({name:"Environment File",status:"fail",message:".env.local not found"}),r.fail();else{let u=await O.readFile(c,"utf-8"),f=["STRIPE_SECRET_KEY","NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"].filter(x=>!u.includes(x));f.length>0?(e.push({name:"Environment Variables",status:"fail",message:`Missing: ${f.join(", ")}`}),r.fail()):(e.push({name:"Environment Variables",status:"pass",message:"All required variables present"}),r.succeed())}}catch{e.push({name:"Environment Variables",status:"fail",message:"Could not read .env file"}),r.fail()}let n=K("Checking Stripe connection...").start();try{let c=(await import("stripe")).default,u=await new c(process.env.STRIPE_SECRET_KEY,{apiVersion:"2023-10-16"}).accounts.retrieve();e.push({name:"Stripe API",status:"pass",message:`Connected to ${u.settings?.dashboard?.display_name||"Stripe account"}`}),n.succeed()}catch{e.push({name:"Stripe API",status:"fail",message:"Could not connect to Stripe API"}),n.fail()}let t=K("Checking database...").start();try{let c=await O.pathExists(F.join(process.cwd(),"drizzle.config.ts")),p=await O.pathExists(F.join(process.cwd(),"drizzle/schema.ts"));c&&p?(e.push({name:"Database Setup",status:"pass",message:"Drizzle ORM configured"}),t.succeed()):(e.push({name:"Database Setup",status:"warn",message:"Database configuration not detected"}),t.warn())}catch{e.push({name:"Database Setup",status:"warn",message:"Could not verify database setup"}),t.warn()}let s=K("Checking API routes...").start();try{let c=["api/checkout/route.ts","api/webhooks/stripe/route.ts","api/entitlements/[userId]/route.ts"],p=F.join(process.cwd(),"app"),u=[];for(let y of c){let f=F.join(p,y);await O.pathExists(f)||u.push(y)}u.length>0?(e.push({name:"API Routes",status:"warn",message:`Missing routes: ${u.length}`}),s.warn()):(e.push({name:"API Routes",status:"pass",message:"All required routes present"}),s.succeed())}catch{e.push({name:"API Routes",status:"warn",message:"Could not verify API routes"}),s.warn()}let o=K("Checking SDK...").start();try{let c=await O.readJson(F.join(process.cwd(),"package.json"));c.dependencies?.stripe||c.devDependencies?.stripe?(e.push({name:"Stripe SDK",status:"pass",message:"stripe SDK installed"}),o.succeed()):(e.push({name:"Stripe SDK",status:"fail",message:"Stripe SDK not found in dependencies"}),o.fail())}catch{e.push({name:"SDK Installation",status:"fail",message:"Could not check package.json"}),o.fail()}console.log(b.blue.bold(`
\u{1F4CA} Summary
`));let g=e.filter(c=>c.status==="pass").length,h=e.filter(c=>c.status==="fail").length;e.forEach(c=>{let p=c.status==="pass"?b.green("\u2713"):c.status==="fail"?b.red("\u2717"):b.yellow("\u26A0"),u=c.status==="pass"?b.green:c.status==="fail"?b.red:b.yellow;console.log(`${p} ${u(c.name)}`),console.log(b.gray(`  ${c.message}`))}),console.log(),h===0?(console.log(b.green.bold("\u2705 All checks passed!")),console.log(b.gray("Your billing setup looks good."))):h>0&&g>0?(console.log(b.yellow.bold("\u26A0\uFE0F  Some checks failed")),console.log(b.gray("Review the issues above to complete your setup."))):(console.log(b.red.bold("\u274C Setup incomplete")),console.log(b.gray("Run: npx @drew/billing init"))),console.log(),console.log(b.gray("Next steps:")),console.log(b.gray("  \u2022 Start dev server: npm run dev")),console.log(b.gray("  \u2022 Start webhook listener: stripe listen --forward-to localhost:3000/api/webhooks/stripe")),console.log(b.gray("  \u2022 View docs: https://github.com/drewsephski/monetize/tree/main/packages/cli#readme")),console.log()}import v from"chalk";import ot from"ora";import _e from"fs-extra";import it from"path";async function Te(e){console.log(v.blue.bold(`
\u{1F3D6}\uFE0F  @drew/billing sandbox
`));let r=it.join(process.cwd(),".env.local"),n="";try{n=await _e.readFile(r,"utf-8")}catch{}let t;if(e.enable)t=!0;else if(e.disable)t=!1;else{let o=n.match(/BILLING_SANDBOX_MODE=(true|false)/);t=!(o?o[1]==="true":!1)}let s=ot(t?"Enabling sandbox mode...":"Disabling sandbox mode...").start();try{n.includes("BILLING_SANDBOX_MODE=")?n=n.replace(/BILLING_SANDBOX_MODE=(true|false)/,`BILLING_SANDBOX_MODE=${t}`):n+=`
# Sandbox mode - no real charges
BILLING_SANDBOX_MODE=${t}
`,await _e.writeFile(r,n),s.succeed()}catch(o){s.fail("Failed to update sandbox mode"),console.log(o),process.exit(1)}t?(console.log(v.green.bold(`
\u2705 Sandbox mode ENABLED
`)),console.log(v.gray("What this means:")),console.log(v.gray("  \u2022 No real charges will be processed")),console.log(v.gray("  \u2022 Stripe test mode API keys used")),console.log(v.gray("  \u2022 Webhooks simulated locally")),console.log(v.gray("  \u2022 Usage tracked but not billed")),console.log(),console.log(v.yellow("Perfect for development and testing!"))):(console.log(v.yellow.bold(`
\u26A0\uFE0F  Sandbox mode DISABLED
`)),console.log(v.gray("What this means:")),console.log(v.gray("  \u2022 Real charges will be processed")),console.log(v.gray("  \u2022 Stripe live mode API keys required")),console.log(v.gray("  \u2022 Production webhooks active")),console.log(),console.log(v.red("Make sure you have live Stripe keys configured!"))),console.log(),console.log(v.gray("Switch back anytime:")),console.log(v.cyan("  npx @drew/billing sandbox")),console.log()}import i from"chalk";import $ from"fs-extra";import j from"path";async function De(){console.log(i.blue.bold(`
\u{1F464} @drew/billing whoami
`));try{let f=await $.readJson(j.join(process.cwd(),"package.json"));console.log(i.gray("Project:"),i.white(f.name||"Unknown")),console.log(i.gray("Version:"),i.white(f.version||"Unknown"))}catch{console.log(i.gray("Project:"),i.yellow("Could not read package.json"))}let e=j.join(process.cwd(),".env.local"),r={};try{(await $.readFile(e,"utf-8")).split(`
`).forEach(x=>{let I=x.match(/^([A-Z_]+)=(.+)$/);I&&(r[I[1]]=I[2].replace(/^["']/,"").replace(/["']$/,""))})}catch{}console.log(),console.log(i.gray("Environment:"));let n=r.STRIPE_SECRET_KEY||"",t=n.startsWith("sk_test_"),s=n.startsWith("sk_live_");t?console.log(i.gray("  Stripe:"),i.yellow("TEST MODE")):s?console.log(i.gray("  Stripe:"),i.green("LIVE MODE \u26A0\uFE0F")):console.log(i.gray("  Stripe:"),i.red("Not configured"));let o=r.BILLING_SANDBOX_MODE==="true";console.log(i.gray("  Sandbox:"),o?i.green("Enabled"):i.gray("Disabled"));let g=r.NEXT_PUBLIC_BILLING_API_URL||r.BILLING_API_URL;console.log(i.gray("  API URL:"),g||i.red("Not set"));try{let f=await $.readJson(j.join(process.cwd(),"package.json")),x=f.dependencies?.["@drew/billing-sdk"]||f.devDependencies?.["@drew/billing-sdk"];x?console.log(i.gray("  SDK:"),x):console.log(i.gray("  SDK:"),i.red("Not installed"))}catch{}console.log();let h=j.join(process.cwd(),"components/billing");try{let x=(await $.readdir(h)).filter(I=>I.endsWith(".tsx"));x.length>0?(console.log(i.gray("Installed Components:")),x.forEach(I=>{console.log(i.gray("  \u2022"),I.replace(".tsx",""))})):(console.log(i.gray("Components:"),i.yellow("None installed")),console.log(i.gray("  Install with: npx @drew/billing add <component>")))}catch{console.log(i.gray("Components:"),i.yellow("None installed"))}console.log();let c=await $.pathExists(j.join(process.cwd(),"drizzle.config.ts"));console.log(i.gray("Database:"),c?i.green("Configured"):i.yellow("Not configured"));let p=j.join(process.cwd(),"app/api"),u=await $.pathExists(j.join(p,"checkout/route.ts")),y=await $.pathExists(j.join(p,"webhooks/stripe/route.ts"));console.log(i.gray("API Routes:")),console.log(i.gray("  /api/checkout"),u?i.green("\u2713"):i.red("\u2717")),console.log(i.gray("  /api/webhooks/stripe"),y?i.green("\u2713"):i.red("\u2717")),console.log(),console.log(i.gray("Commands:")),console.log(i.gray("  init       Initialize billing")),console.log(i.gray("  add        Add UI components")),console.log(i.gray("  verify     Verify setup")),console.log(i.gray("  sandbox    Toggle sandbox mode")),console.log()}import m from"chalk";async function je(e){console.log(m.blue.bold(`
\u{1F4CA} Telemetry Settings
`));let r=z();if(e.enable){ke(),console.log(m.green("\u2705 Anonymous telemetry enabled")),console.log(m.gray(`
We collect:`)),console.log(m.gray("  \u2022 Command usage (init, add, verify, etc.)")),console.log(m.gray("  \u2022 Performance metrics (timing)")),console.log(m.gray("  \u2022 Error reports (no stack traces with PII)")),console.log(m.gray(`
We NEVER collect:`)),console.log(m.gray("  \u2022 Personal information")),console.log(m.gray("  \u2022 Stripe keys or API credentials")),console.log(m.gray("  \u2022 Code or project details")),console.log(m.gray("  \u2022 IP addresses")),M("telemetry_enabled");return}if(e.disable){Se(),console.log(m.yellow("\u274C Anonymous telemetry disabled")),console.log(m.gray("You can re-enable anytime with: npx @drew/billing telemetry --enable"));return}console.log(m.white("Current status:")),console.log(`  Enabled: ${r.enabled?m.green("Yes"):m.red("No")}`),r.machineId&&console.log(`  Machine ID: ${m.gray(r.machineId)}`),r.optedInAt&&console.log(`  Decision date: ${m.gray(r.optedInAt)}`),console.log(m.gray(`
Usage:`)),console.log(m.gray("  npx @drew/billing telemetry --enable   # Enable telemetry")),console.log(m.gray("  npx @drew/billing telemetry --disable  # Disable telemetry")),console.log(m.gray(`  npx @drew/billing telemetry            # Show status
`)),r.optedInAt||(console.log(m.blue("\u{1F4A1} Why enable telemetry?")),console.log(m.gray("Anonymous data helps us improve the CLI and catch bugs faster.")),console.log(m.gray(`No personal information is ever collected.
`)))}import w from"chalk";import{readFileSync as W,existsSync as B}from"fs";import{join as R}from"path";import{execa as lt}from"execa";async function Re(){console.log(w.blue.bold(`
\u{1F50D} @drew/billing doctor
`)),console.log(w.gray(`Running diagnostics...
`));let e=[];e.push(await ct()),e.push(await pt()),e.push(await dt()),e.push(await ut()),e.push(await gt()),e.push(await mt()),e.push(await ft()),ht(e)}async function ct(){let e=R(process.cwd(),".env.local"),r=R(process.cwd(),".env.example"),n="";B(e)?n=W(e,"utf-8"):B(R(process.cwd(),".env"))&&(n=W(R(process.cwd(),".env"),"utf-8"));let t=["STRIPE_SECRET_KEY","NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY","STRIPE_WEBHOOK_SECRET"],s=t.filter(g=>!n.includes(g));if(s.length===0)return{name:"Environment Variables",status:"pass",message:"All required variables configured"};let o=B(r);return{name:"Environment Variables",status:"fail",message:`Missing: ${s.join(", ")}`,fix:o?"cp .env.example .env.local && edit with your Stripe keys":`Create .env.local with:
${t.map(g=>`${g}=...`).join(`
`)}`}}async function pt(){try{let e=new AbortController,r=setTimeout(()=>e.abort(),2e3),n=await fetch("http://localhost:3000/api/health",{signal:e.signal}).catch(()=>null);return clearTimeout(r),n?.ok?{name:"API Connectivity",status:"pass",message:"Billing API responding at localhost:3000"}:{name:"API Connectivity",status:"warn",message:"Dev server not running or API not accessible",fix:"Start dev server: npm run dev"}}catch{return{name:"API Connectivity",status:"warn",message:"Could not connect to localhost:3000",fix:"Start dev server: npm run dev"}}}async function dt(){let e=R(process.cwd(),".env.local"),r="";if(B(e)){let t=W(e,"utf-8").match(/STRIPE_WEBHOOK_SECRET=(.+)/);t&&(r=t[1].trim())}return!r||r==="whsec_..."?{name:"Webhook Configuration",status:"fail",message:"Webhook secret not configured",fix:`1. Run: stripe listen --forward-to http://localhost:3000/api/stripe/webhook
2. Copy webhook secret to .env.local`}:r.startsWith("whsec_")?{name:"Webhook Configuration",status:"pass",message:"Webhook secret configured"}:{name:"Webhook Configuration",status:"warn",message:"Webhook secret format looks unusual",fix:"Verify STRIPE_WEBHOOK_SECRET starts with 'whsec_'"}}async function ut(){try{if(!B(R(process.cwd(),"drizzle.config.ts")))return{name:"Database Connection",status:"fail",message:"No Drizzle config found",fix:"Run: npx @drew/billing init to set up database"};try{return await lt("npx",["drizzle-kit","check"],{cwd:process.cwd(),timeout:1e4,reject:!1}),{name:"Database Connection",status:"pass",message:"Database configuration found"}}catch{return{name:"Database Connection",status:"warn",message:"Database config exists but connection not verified",fix:"Run: npx drizzle-kit push to sync schema"}}}catch{return{name:"Database Connection",status:"warn",message:"Could not verify database connection"}}}async function gt(){let e=R(process.cwd(),".env.local"),r="";if(B(e)){let t=W(e,"utf-8").match(/STRIPE_SECRET_KEY=(.+)/);t&&(r=t[1].trim())}return r?r.startsWith("sk_test_")?{name:"Stripe Configuration",status:"pass",message:"Test mode Stripe key configured"}:r.startsWith("sk_live_")?{name:"Stripe Configuration",status:"warn",message:"\u26A0\uFE0F Live Stripe key detected",fix:"Use test keys for development: https://dashboard.stripe.com/test/apikeys"}:{name:"Stripe Configuration",status:"fail",message:"Invalid Stripe key format",fix:"Key should start with sk_test_ or sk_live_"}:{name:"Stripe Configuration",status:"fail",message:"STRIPE_SECRET_KEY not found",fix:"Add STRIPE_SECRET_KEY=sk_test_... to .env.local"}}async function mt(){let e=R(process.cwd(),"package.json");if(!B(e))return{name:"Dependencies",status:"fail",message:"No package.json found",fix:"Run: npm init"};try{let r=JSON.parse(W(e,"utf-8")),n={...r.dependencies,...r.devDependencies},s=["stripe","drizzle-orm"].filter(o=>!n[o]);return s.length===0?{name:"Dependencies",status:"pass",message:"All required packages installed"}:{name:"Dependencies",status:"fail",message:`Missing: ${s.join(", ")}`,fix:`npm install ${s.join(" ")}`}}catch{return{name:"Dependencies",status:"warn",message:"Could not parse package.json"}}}async function ft(){let e=await V();return e.name==="nextjs"?{name:"Framework Support",status:"pass",message:`Next.js ${e.version||""} detected`}:{name:"Framework Support",status:"warn",message:`${e.name} detected (limited support)`,fix:"Next.js is fully supported. Other frameworks have basic support."}}function ht(e){let r=e.filter(s=>s.status==="pass").length,n=e.filter(s=>s.status==="fail").length,t=e.filter(s=>s.status==="warn").length;console.log(w.white.bold(`Results:
`));for(let s of e){let o=s.status==="pass"?w.green("\u2713"):s.status==="fail"?w.red("\u2717"):w.yellow("\u26A0");console.log(`${o} ${w.white(s.name)}`),console.log(`  ${w.gray(s.message)}`),s.fix&&console.log(`  ${w.cyan("Fix:")} ${s.fix}`),console.log()}console.log(w.white.bold("Summary:")),console.log(`  ${w.green(`${r} passing`)}`),n>0&&console.log(`  ${w.red(`${n} failing`)}`),t>0&&console.log(`  ${w.yellow(`${t} warnings`)}`),n===0&&t===0?console.log(w.green.bold(`
\u2705 All checks passed! Your billing setup looks good.
`)):n===0?console.log(w.yellow(`
\u26A0\uFE0F  Some warnings - review above.
`)):(console.log(w.red(`
\u274C ${n} issue(s) need attention. Run the suggested fixes above.
`)),console.log(w.gray(`Need help? https://github.com/drewsephski/monetize/issues
`)))}var _=new bt;_.name("@drew/billing").description("CLI for @drew/billing - Add subscriptions to your app in 10 minutes").version("1.0.0");_.command("init").description("Initialize @drew/billing in your Next.js project").option("--skip-stripe","Skip Stripe product creation").option("--template <type>","Template type (saas, api, usage)","saas").option("--yes","Skip prompts and use defaults").action(Ce);_.command("add <component>").description("Add a billing component (pricing-table, upgrade-button, usage-meter)").option("--path <path>","Custom installation path").action(A);_.command("verify").description("Verify your billing setup is working correctly").action(Ee);_.command("sandbox").description("Toggle sandbox mode for testing without real charges").option("--enable","Enable sandbox mode").option("--disable","Disable sandbox mode").action(Te);_.command("whoami").description("Show current billing configuration").action(De);_.command("telemetry").description("Manage anonymous usage telemetry").option("--enable","Enable telemetry").option("--disable","Disable telemetry").action(je);_.command("doctor").description("Diagnose billing setup issues").action(Re);process.argv.length===2&&(console.log(H.blue.bold(`
\u26A1 @drew/billing
`)),console.log(`Add subscriptions to your app in 10 minutes.
`),console.log(H.gray("Quick start:")),console.log(`  npx @drew/billing init
`),console.log(H.gray("Commands:")),console.log("  init       Initialize billing in your project"),console.log("  add        Add prebuilt UI components"),console.log("  verify     Verify your setup"),console.log("  sandbox    Toggle sandbox mode"),console.log("  whoami     Show current configuration"),console.log("  doctor     Diagnose setup issues"),console.log(`  telemetry  Manage usage telemetry
`),console.log(H.gray("Documentation:")),console.log(`  https://billing.drew.dev/docs
`));_.parse();
//# sourceMappingURL=index.js.map
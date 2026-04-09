#!/usr/bin/env node
import{Command as vt}from"commander";import Z from"chalk";import n from"chalk";import le from"inquirer";import S from"ora";import C from"fs-extra";import E from"path";import{execa as _}from"execa";import U from"fs-extra";import D from"path";async function V(){let e=process.cwd(),s=D.join(e,"package.json");if(await U.pathExists(s)){let a=await U.readJson(s),t={...a.dependencies,...a.devDependencies};if(t.next){let r=await U.pathExists(D.join(e,"app")),o=await U.pathExists(D.join(e,"pages"));return{name:"nextjs",version:t.next,type:r?"app":o?"pages":"app"}}if(t.react)return{name:"react",version:t.react};if(t.vue||t["@vue/core"])return{name:"vue",version:t.vue||t["@vue/core"]};if(t.express)return{name:"express",version:t.express}}return await U.pathExists(D.join(e,"next.config.js"))||await U.pathExists(D.join(e,"next.config.ts"))||await U.pathExists(D.join(e,"next.config.mjs"))?{name:"nextjs",type:"app"}:await U.pathExists(D.join(e,"vite.config.ts"))?{name:"react"}:{name:"unknown"}}import $e from"stripe";async function ae(e,s,a){try{let o=await e.prices.search({query:`lookup_key:"${a.lookup_key}"`});if(o.data.length>0){let u=o.data[0],h=await e.products.retrieve(typeof u.product=="string"?u.product:u.product.id);return{productId:h.id,priceId:u.id,name:h.name}}}catch{}let t=await e.products.create(s),r=await e.prices.create({product:t.id,unit_amount:a.unit_amount,currency:a.currency,recurring:a.recurring,lookup_key:a.lookup_key});return{productId:t.id,priceId:r.id,name:t.name}}async function ue(e){let s=new $e(e,{apiVersion:"2023-10-16"}),a=[];try{let t=await ae(s,{name:"Pro",description:"For growing businesses",metadata:{tier:"pro",features:JSON.stringify(["10,000 API calls/mo","Unlimited projects","Priority support","Advanced analytics"])}},{unit_amount:2900,currency:"usd",recurring:{interval:"month"},lookup_key:`pro_monthly_${Date.now()}`});a.push({id:t.productId,name:t.name,priceId:t.priceId})}catch(t){console.warn("Failed to create Pro plan:",t instanceof Error?t.message:String(t))}try{let t=await ae(s,{name:"Enterprise",description:"For large organizations",metadata:{tier:"enterprise",features:JSON.stringify(["Unlimited API calls","Custom integrations","SLA guarantee","Dedicated support"])}},{unit_amount:9900,currency:"usd",recurring:{interval:"month"},lookup_key:`enterprise_monthly_${Date.now()}`});a.push({id:t.productId,name:t.name,priceId:t.priceId})}catch(t){console.warn("Failed to create Enterprise plan:",t instanceof Error?t.message:String(t))}try{let t=await ae(s,{name:"API Calls",description:"Per-call pricing for API usage",metadata:{type:"usage",unit:"api_call"}},{unit_amount:1,currency:"usd",recurring:{interval:"month",usage_type:"metered"},lookup_key:`api_calls_${Date.now()}`});a.push({id:t.productId,name:"API Calls (Usage)",priceId:t.priceId})}catch(t){console.warn("Failed to create Usage plan:",t instanceof Error?t.message:String(t))}if(a.length===0)throw new Error("Failed to create any Stripe products. Check your API key and try again.");return a}import Y from"fs-extra";import P from"path";import I from"chalk";import N from"chalk";import Me from"ora";import ge from"fs-extra";import fe from"path";var se={"pricing-table":{name:"PricingTable",description:"Beautiful pricing table with Stripe checkout integration",files:["pricing-table.tsx"]},"upgrade-button":{name:"UpgradeButton",description:"Smart upgrade button with plan comparison",files:["upgrade-button.tsx"]},"usage-meter":{name:"UsageMeter",description:"Real-time usage visualization with limits",files:["usage-meter.tsx"]},"current-plan":{name:"CurrentPlanBadge",description:"Shows current plan with upgrade CTA",files:["current-plan.tsx"]},"billing-portal":{name:"BillingPortalButton",description:"Opens Stripe customer portal",files:["billing-portal-button.tsx"]},"subscription-gate":{name:"SubscriptionGate",description:"Blocks content based on subscription status",files:["subscription-gate.tsx"]},"trial-banner":{name:"TrialBanner",description:"Shows trial status and countdown",files:["trial-banner.tsx"]},all:{name:"All Components",description:"Install all billing components",files:["pricing-table.tsx","upgrade-button.tsx","usage-meter.tsx","current-plan.tsx","billing-portal-button.tsx","subscription-gate.tsx","trial-banner.tsx","index.ts"]}};async function B(e,s){console.log(N.blue.bold(`
\u{1F4E6} drew-billing-cli add
`));let a=Object.keys(se);a.includes(e)||(console.log(N.red(`Invalid component: ${e}
`)),console.log(N.gray("Available components:")),a.forEach(c=>{if(c==="all")return;let p=se[c];console.log(N.gray(`  \u2022 ${c}`)+` - ${p.description}`)}),console.log(N.gray("  \u2022 all - Install all components")),console.log(),process.exit(1));let t=se[e],r=s.path||"components/billing",o=s.cwd||process.cwd(),u=fe.join(o,r);console.log(N.gray(`Installing ${t.name}...
`)),await ge.ensureDir(u);let h=Me("Creating components...").start();try{for(let c of t.files){let p=Oe(c);await ge.writeFile(fe.join(u,c),p)}h.succeed(`Installed ${t.name} to ${r}/`)}catch(c){h.fail("Failed to install component"),console.error(c),process.exit(1)}console.log(N.green.bold(`
\u2705 Component installed!
`)),console.log(N.gray("Usage:")),console.log(e==="all"?N.cyan(`import { PricingTable, UpgradeButton } from "${r}";`):N.cyan(`import { ${t.name} } from "${r}/${e.replace("billing-portal","billing-portal-button")}";`)),console.log(),console.log(N.gray("Documentation:"),N.underline("https://github.com/drewsephski/monetize/tree/main/packages/cli#readme")),console.log()}function Oe(e){return{"pricing-table.tsx":ze(),"upgrade-button.tsx":Fe(),"usage-meter.tsx":We(),"current-plan.tsx":Ke(),"billing-portal-button.tsx":qe(),"subscription-gate.tsx":He(),"trial-banner.tsx":Ve(),"index.ts":Ye()}[e]||`// ${e} - Component template
export function Placeholder() { return null; }`}function ze(){return`"use client";

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
`}function Fe(){return`"use client";

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
`}function We(){return`"use client";

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
`}function Ke(){return`"use client";

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
`}function qe(){return`"use client";

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
`}function He(){return`"use client";

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
`}function Ve(){return`"use client";

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
`}function Ye(){return`export { PricingTable } from "./pricing-table";
export { UpgradeButton } from "./upgrade-button";
export { UsageMeter } from "./usage-meter";
export { CurrentPlanBadge } from "./current-plan";
export { BillingPortalButton } from "./billing-portal-button";
export { SubscriptionGate } from "./subscription-gate";
export { TrialBanner } from "./trial-banner";
`}async function T(e,s,a){try{if(await Y.ensureDir(P.dirname(e)),await Y.writeFile(e,s,"utf-8"),!await Y.pathExists(e))throw new Error(`Verification failed: ${e} was not created`);let r=await Y.stat(e);console.log(I.gray(`  \u2713 ${a} (${r.size} bytes)`))}catch(t){throw console.error(I.red(`  \u2717 Failed to write ${a}:`)),console.error(I.red(`    ${e}`)),t instanceof Error&&console.error(I.red(`    ${t.message}`)),t}}async function he(e,s,a){let t=a||process.cwd();switch(e){case"saas":await Ge(t,s);break;case"api":await Je(t,s);break;case"usage":await Xe(t,s);break;case"minimal":break;default:throw new Error(`Unknown template: ${e}`)}}async function Ge(e,s){console.log(I.blue(`
\u{1F4C4} Creating SaaS template pages...`)),await B("all",{path:"components/billing",cwd:e});let a=s.find(m=>m.name==="Pro"),t=s.find(m=>m.name==="Enterprise"),r=a?.priceId||"price_placeholder_pro",o=t?.priceId||"price_placeholder_enterprise";await T(P.join(e,"app/page.tsx"),`"use client";

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
`,"Main landing page with setup guide");let h=`"use client";

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
    priceId: "${r}",
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
    priceId: "${o}",
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
`;await T(P.join(e,"app/pricing/page.tsx"),h,"Pricing page"),await T(P.join(e,"app/billing/page.tsx"),`"use client";

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
`,"Billing dashboard page"),await T(P.join(e,"app/demo/page.tsx"),`"use client";

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
`,"Demo/playground page"),console.log(I.green(`\u2705 SaaS template files created successfully
`))}async function Je(e,s){console.log(I.blue(`
\u{1F4C4} Creating API template pages...`)),await B("usage-meter",{path:"components/billing",cwd:e}),await T(P.join(e,"app/page.tsx"),`"use client";

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
`,"Main page with setup guide"),await T(P.join(e,"app/api/example/route.ts"),`import { NextRequest, NextResponse } from "next/server";

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
`,"Example API route"),await T(P.join(e,"middleware.ts"),`import { NextResponse } from "next/server";
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
`,"API middleware"),console.log(I.green(`\u2705 API template files created successfully
`))}async function Xe(e,s){console.log(I.blue(`
\u{1F4C4} Creating Usage template pages...`)),await B("usage-meter",{path:"components/billing",cwd:e}),await B("upgrade-button",{path:"components/billing",cwd:e}),await T(P.join(e,"app/page.tsx"),`"use client";

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
`,"Main page with usage setup guide"),await T(P.join(e,"app/dashboard/page.tsx"),`"use client";

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
`,"Usage dashboard page"),console.log(I.green(`\u2705 Usage template files created successfully
`))}import be from"fs-extra";import Ze from"path";async function xe(e){let s=Ze.join(process.cwd(),".env.local"),a="";try{a=await be.readFile(s,"utf-8")}catch{}for(let[t,r]of Object.entries(e)){let o=`${t}=${r}`;a.includes(`${t}=`)?a=a.replace(new RegExp(`${t}=.*`),o):(a+=a.endsWith(`
`)?"":`
`,a+=`${o}
`)}await be.writeFile(s,a)}import G from"fs-extra";import J from"path";import{execa as Wt}from"execa";async function ye(){let e=process.cwd();return await G.pathExists(J.join(e,"bun.lockb"))||await G.pathExists(J.join(e,"bun.lock"))?"bun":await G.pathExists(J.join(e,"pnpm-lock.yaml"))?"pnpm":await G.pathExists(J.join(e,"yarn.lock"))?"yarn":"npm"}import{createHash as Qe}from"crypto";import{readFileSync as et,existsSync as Ne,writeFileSync as tt,mkdirSync as at}from"fs";import{homedir as ke}from"os";import{join as Se}from"path";import Jt from"chalk";var re=Se(ke(),".drew-billing"),ne=Se(re,"telemetry.json"),ve=process.env.TELEMETRY_ENDPOINT||"";function we(){let e=`${ke()}_${process.platform}_${process.arch}`;return Qe("sha256").update(e).digest("hex").substring(0,16)}function W(){try{if(Ne(ne)){let e=JSON.parse(et(ne,"utf-8"));return{enabled:e.enabled??!1,machineId:e.machineId||we(),optedInAt:e.optedInAt}}}catch{}return{enabled:!1,machineId:we()}}function Pe(e){try{Ne(re)||at(re,{recursive:!0}),tt(ne,JSON.stringify(e,null,2))}catch{}}function Ie(){let e=W();e.enabled=!0,e.optedInAt=new Date().toISOString(),Pe(e)}function Ce(){let e=W();e.enabled=!1,Pe(e)}function st(){return`cli_${Math.random().toString(36).substring(2,15)}_${Date.now()}`}function O(e,s){let a=W();if(!a.enabled)return;let t={type:e,timestamp:new Date().toISOString(),machineId:a.machineId,sessionId:st(),cliVersion:"1.0.0",metadata:s};rt(t).catch(()=>{})}function Ee(e,s,a){O(e,{...a,durationMs:s})}async function rt(e){if(!ve){process.env.DEBUG==="true"&&console.log("[Telemetry]",e);return}try{await fetch(ve,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})}catch{}}var oe={CLI_INSTALL:"cli_install",INIT_STARTED:"init_started",INIT_COMPLETED:"init_completed",SANDBOX_STARTED:"sandbox_started",FIRST_CHECKOUT:"first_checkout",FIRST_SUBSCRIPTION:"first_subscription"};function ie(e,s){O(`funnel_${e}`,s)}import X from"chalk";import Te from"inquirer";async function _e(e,s){console.log(),console.log(X.blue.bold("\u{1F4E3} Quick Feedback")),console.log(X.gray("Your feedback helps us improve.")),console.log();try{let{wasEasy:a}=await Te.prompt([{type:"confirm",name:"wasEasy",message:"Was this easy to set up?",default:!0}]),t;if(!a){let{feedback:r}=await Te.prompt([{type:"input",name:"feedback",message:"What was difficult? (optional, 1 sentence)"}]);t=r}O("feedback_collected",{eventType:e,rating:a?"positive":"negative",feedback:t,...s}),console.log(),console.log(a?X.green("\u2728 Thanks! Glad it went smoothly."):X.yellow("\u{1F4DD} Thanks for the feedback \u2014 we'll use it to improve.")),console.log()}catch{}}async function Ae(e){console.log(n.blue.bold(`
\u26A1 drew-billing-cli init
`)),ie(oe.INIT_STARTED,{template:e.template});let s=Date.now(),a=process.cwd(),t=await nt(a),r=await C.pathExists(E.join(a,"package.json"));console.log(n.gray(`Debug: cwd=${a}, isEmptyDir=${t}, hasPackageJson=${r}`));let o="npm",u=E.basename(a),h={name:"nextjs"},c=!1;if(t||!r){console.log(n.yellow("\u{1F4C1} No existing project detected."));let i=e.yes;e.yes||(i=(await le.prompt([{type:"confirm",name:"shouldScaffold",message:"Create a new Next.js project here?",default:!0}])).shouldScaffold),i||(console.log(n.gray(`
Aborted. Please run this in an existing Next.js project directory.
`)),process.exit(0));let d=await ot(a,e.yes);d.success||(console.log(n.red(`
\u274C Failed to scaffold Next.js project.`)),console.log(n.gray(`Please try manually: npx create-next-app@latest .
`)),process.exit(1)),o=d.pkgManager,u=d.projectName,c=!0,h={name:"nextjs",version:"latest"},console.log(n.green(`
\u2705 Created Next.js project: ${u}
`)),await C.pathExists(E.join(a,"package.json"))||(console.log(n.red(`
\u274C Scaffolded project missing package.json`)),process.exit(1))}else{let i=S("Detecting framework...").start(),d=await V();if(h={name:d.name,version:d.version},d.name!=="nextjs"){i.warn(`Detected: ${d.name} (limited support)`),console.log(n.yellow(`
\u26A0\uFE0F  Currently only Next.js is fully supported.`)),console.log(n.gray(`Other frameworks coming soon: React, Vue, Svelte, Express
`));let{continueAnyway:H}=await le.prompt([{type:"confirm",name:"continueAnyway",message:"Continue with manual setup?",default:!1}]);H||(console.log(n.gray(`
Aborted.
`)),process.exit(0))}else i.succeed(`Detected: ${n.green("Next.js")} ${d.version||""}`);o=await ye()}console.log(n.gray(`Using package manager: ${o}
`));let p;e.yes?p={stripeSecretKey:process.env.STRIPE_SECRET_KEY||"",stripePublishableKey:process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY||"",webhookSecret:process.env.STRIPE_WEBHOOK_SECRET||"",databaseUrl:process.env.DATABASE_URL||"",template:e.template||"saas",createProducts:!e.skipStripe}:p={...await le.prompt([{type:"input",name:"stripeSecretKey",message:"Stripe Secret Key (sk_test_...):",default:process.env.STRIPE_SECRET_KEY,validate:d=>d.startsWith("sk_test_")||d.startsWith("sk_live_")?!0:"Must start with sk_test_ or sk_live_"},{type:"input",name:"stripePublishableKey",message:"Stripe Publishable Key (pk_test_...):",default:process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,validate:d=>d.startsWith("pk_test_")||d.startsWith("pk_live_")?!0:"Must start with pk_test_ or pk_live_"},{type:"input",name:"databaseUrl",message:"Database URL (postgresql://...):",default:process.env.DATABASE_URL,validate:d=>!d||d.trim()===""?"Database URL is required (use your Neon or local Postgres URL)":!d.startsWith("postgresql://")&&!d.startsWith("postgres://")?"Must start with postgresql:// or postgres://":!0},{type:"list",name:"template",message:"Choose your template:",choices:[{name:"SaaS Starter (pricing page + auth + dashboard)",value:"saas"},{name:"API Billing (usage-based pricing)",value:"api"},{name:"Simple Usage (metered billing)",value:"usage"},{name:"Minimal (just the SDK)",value:"minimal"}],default:e.template||"saas"},{type:"confirm",name:"createProducts",message:"Create Stripe products automatically?",default:!e.skipStripe}]),webhookSecret:""},console.log(n.blue.bold(`
\u{1F4E6} Setting up drew-billing-cli...
`));let m={projectScaffolded:c,dependencies:!1,stripeProducts:!1,database:!1,templates:!1,env:!1},x=[],f=S("Installing core dependencies...").start();try{await ce(["stripe","lucide-react"],o,f,!1,2,a),f.succeed("Core dependencies installed"),m.dependencies=!0}catch(i){f.fail("Failed to install core dependencies");let d=i instanceof Error?i.message:String(i);x.push(`Dependencies: ${d}`),console.log(n.gray(`Run manually: ${o} ${o==="npm"?"install":"add"} stripe lucide-react`))}let w=S("Installing database dependencies...").start();try{await ce(["drizzle-orm","@neondatabase/serverless","drizzle-kit"],o,w,!1,2,a),w.succeed("Database dependencies installed")}catch(i){w.fail("Failed to install database dependencies");let d=i instanceof Error?i.message:String(i);x.push(`DB Dependencies: ${d}`),console.log(n.gray(`Run manually: ${o} ${o==="npm"?"install":"add"} drizzle-orm @neondatabase/serverless drizzle-kit`))}let k=S("Installing dev dependencies...").start();try{await ce(["@types/node","typescript"],o,k,!0,2,a),k.succeed("Dev dependencies installed")}catch{k.warn("Some dev dependencies may need manual installation")}let Q=S("Installing UI components...").start();try{let i=["button","card","progress"];for(let d of i){Q.text=`Installing shadcn/ui ${d}...`;try{await _("npx",["shadcn@latest","add",d,"-y"],{cwd:a,stdio:"pipe",timeout:6e4})}catch{}}Q.succeed("UI components installed")}catch{Q.warn("Some UI components may need manual installation"),console.log(n.gray("Run manually: npx shadcn@latest add button card progress"))}let de=S("Installing toast notifications...").start();try{await _(o,[o==="npm"?"install":"add","sonner"],{cwd:a,stdio:"pipe",timeout:6e4}),de.succeed("Toast notifications installed")}catch{de.warn("sonner may need manual installation"),console.log(n.gray(`Run manually: ${o} ${o==="npm"?"install":"add"} sonner`))}console.log(n.gray(`
Tip: Install the SDK for programmatic access:`)),console.log(n.cyan(`  ${o} ${o==="npm"?"install":"add"} @drew/billing-sdk
`));let L=[];if(p.createProducts&&p.stripeSecretKey){let i=S("Creating Stripe products...").start();try{if(!p.stripeSecretKey.startsWith("sk_test_")&&!p.stripeSecretKey.startsWith("sk_live_"))throw new Error("Invalid Stripe secret key format");L=await ue(p.stripeSecretKey),i.succeed(`Created ${L.length} Stripe products`),m.stripeProducts=!0}catch(d){i.fail("Failed to create Stripe products");let H=d instanceof Error?d.message:String(d);x.push(`Stripe products: ${H}`),console.log(n.gray("You can create them manually in the Stripe Dashboard")),console.log(n.gray("Then update the price IDs in your code")),L=[{id:"prod_fallback",name:"Pro",priceId:"price_fallback_pro"},{id:"prod_fallback_2",name:"Enterprise",priceId:"price_fallback_enterprise"}]}}let ee=S("Setting up database...").start();try{await it(a),await lt(a,o,ee),ee.succeed("Database configured"),m.database=!0}catch(i){ee.fail("Database setup failed");let d=i instanceof Error?i.message:String(i);x.push(`Database: ${d}`),console.log(n.gray("You can set up the database later by running:")),console.log(n.gray("  npx drizzle-kit push")),console.log(n.gray(`
Make sure to set DATABASE_URL in your .env.local file`))}let pe=S(`Installing ${p.template} template...`).start();try{await C.ensureDir(E.join(a,"app")),await C.ensureDir(E.join(a,"components")),await he(p.template,L,a),pe.succeed("Template installed"),m.templates=!0}catch(i){pe.fail("Template installation failed");let d=i instanceof Error?i.message:String(i);x.push(`Templates: ${d}`),console.log(n.gray("Try running:")),console.log(n.gray("  npx drew-billing-cli add all"))}let me=S("Updating environment variables...").start();try{let i={STRIPE_SECRET_KEY:p.stripeSecretKey,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:p.stripePublishableKey,STRIPE_WEBHOOK_SECRET:p.webhookSecret||"whsec_... (run: stripe listen --forward-to localhost:3000/api/webhooks/stripe)",DATABASE_URL:p.databaseUrl||"postgresql://username:password@localhost:5432/database_name",BILLING_API_URL:"http://localhost:3000"};await xe(i),me.succeed("Environment variables configured"),m.env=!0}catch(i){me.fail("Failed to update .env");let d=i instanceof Error?i.message:String(i);x.push(`Environment: ${d}`)}let te=Date.now()-s;if(ie(oe.INIT_COMPLETED,{template:p.template,durationMs:te,framework:h.name,success:Object.values(m).every(i=>i)}),Ee("init_complete",te),console.log(n.green.bold(`
\u2705 Setup complete!
`)),x.length>0&&(console.log(n.yellow("\u26A0\uFE0F  Some steps failed:")),x.forEach(i=>console.log(n.gray(`  \u2022 ${i}`))),console.log()),console.log(n.white(`Next steps:
`)),m.projectScaffolded?(console.log(n.gray("1."),"Navigate to your project:",n.cyan(`cd ${u}`)),console.log(n.gray("2."),"Start your dev server:",n.cyan(`${o==="npm"?"npm run":o} dev`)),console.log(n.gray("3."),"Start Stripe webhook listener:",n.cyan("stripe listen --forward-to http://localhost:3000/api/stripe/webhook"))):(console.log(n.gray("1."),"Start your dev server:",n.cyan(`${o==="npm"?"npm run":o} dev`)),console.log(n.gray("2."),"Start Stripe webhook listener:",n.cyan("stripe listen --forward-to http://localhost:3000/api/stripe/webhook"))),m.templates){let i=m.projectScaffolded?"4":"3";console.log(n.gray(`${i}.`),"Visit",n.cyan("http://localhost:3000/pricing"))}m.database||(console.log(n.gray(`
\u26A0\uFE0F  Database not configured. Add DATABASE_URL to .env.local and run:`)),console.log(n.gray("   npx drizzle-kit push"))),console.log(),console.log(n.gray("Documentation:"),n.underline("https://github.com/drewsephski/monetize/tree/main/packages/cli#readme")),console.log(n.gray("Diagnostics:"),n.cyan("npx drew-billing-cli doctor")),console.log(n.gray("Support:"),n.underline("https://github.com/drewsephski/monetize/issues")),console.log(),L.length>0&&m.stripeProducts?(console.log(n.gray("Created Stripe products:")),L.forEach(i=>{console.log(n.gray(`  \u2022 ${i.name}: ${i.priceId}`))}),console.log()):L.length>0&&(console.log(n.gray("Placeholder product IDs (update these in your code):")),L.forEach(i=>{console.log(n.gray(`  \u2022 ${i.name}: ${i.priceId}`))}),console.log()),console.log(n.blue("\u{1F4CA} Help improve drew-billing-cli")),console.log(n.gray("Enable anonymous telemetry to help us fix bugs faster.")),console.log(n.gray(`Run: npx drew-billing-cli telemetry --enable
`)),await _e("init_completed",{template:p.template,framework:h.name,durationMs:te,results:m})}async function nt(e){try{return(await C.readdir(e)).filter(t=>!t.startsWith(".")&&t!=="node_modules").length===0}catch{return!0}}async function ot(e,s=!1){let a=E.basename(e),t="npm";try{await _("bun",["--version"],{stdio:"pipe"}),t="bun"}catch{try{await _("pnpm",["--version"],{stdio:"pipe"}),t="pnpm"}catch{try{await _("yarn",["--version"],{stdio:"pipe"}),t="yarn"}catch{}}}let r=S(`Creating Next.js project with ${t}...`).start();try{let o=t==="npm"?"npx":t,u=[...t==="npm"?["create-next-app@latest"]:["create","next-app"],".","--typescript","--tailwind","--eslint","--app","--src-dir=false","--import-alias","@/*",...s?["--yes"]:[]];return await _(o,u,{cwd:e,stdio:"pipe",timeout:3e5}),r.succeed("Next.js project created"),{success:!0,pkgManager:t,projectName:a}}catch{if(r.fail("Failed to create Next.js project"),t!=="npm"){r.text="Retrying with npm...",r.start();try{return await _("npx",["create-next-app@latest",".","--typescript","--tailwind","--eslint","--app","--src-dir=false","--import-alias","@/*",...s?["--yes"]:[]],{cwd:e,stdio:"pipe",timeout:3e5}),r.succeed("Next.js project created with npm"),{success:!0,pkgManager:"npm",projectName:a}}catch{return r.fail("All attempts failed"),{success:!1,pkgManager:"npm",projectName:a}}}return{success:!1,pkgManager:t,projectName:a}}}async function ce(e,s,a,t=!1,r=2,o){let u=s==="npm"?"install":"add",h=t?s==="npm"?"--save-dev":"-D":"",c=[u,...e,...h?[h]:[]],p=o||process.cwd();for(let m=1;m<=r;m++)try{a.text=`Installing dependencies (attempt ${m}/${r})...`,await _(s,c,{cwd:p,stdio:"pipe",timeout:12e4});return}catch(x){let f=x instanceof Error?x.message:String(x);if(console.log(n.gray(`  Install attempt ${m} failed: ${f.substring(0,100)}`)),m===r)throw x;await new Promise(w=>setTimeout(w,2e3))}}async function it(e){let s=E.join(e,"drizzle.config.ts");if(await C.pathExists(s)||await C.pathExists(E.join(e,"drizzle.config.js")))return;await C.writeFile(s,`import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
`);let t=E.join(e,"drizzle");await C.ensureDir(t),await C.writeFile(E.join(t,"schema.ts"),`import { pgTable, serial, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

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
`)}async function lt(e,s,a){try{a.text="Running database migrations...",await _("npx",["drizzle-kit","push","--force"],{cwd:e,stdio:"pipe",timeout:6e4,env:{...process.env,SKIP_ENV_VALIDATION:"true"}})}catch(t){let r=t instanceof Error?t.message:String(t);throw r.includes("DATABASE_URL")||r.includes("database")?new Error("DATABASE_URL not configured. Please add it to .env.local"):t}}import b from"chalk";import K from"ora";import z from"fs-extra";import F from"path";async function Le(){console.log(b.blue.bold(`
\u{1F50D} @drew/billing verify
`)),console.log(b.gray(`Checking your billing setup...
`));let e=[],s=K("Checking environment variables...").start();try{let c=F.join(process.cwd(),".env.local");if(!await z.pathExists(c))e.push({name:"Environment File",status:"fail",message:".env.local not found"}),s.fail();else{let m=await z.readFile(c,"utf-8"),f=["STRIPE_SECRET_KEY","NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"].filter(w=>!m.includes(w));f.length>0?(e.push({name:"Environment Variables",status:"fail",message:`Missing: ${f.join(", ")}`}),s.fail()):(e.push({name:"Environment Variables",status:"pass",message:"All required variables present"}),s.succeed())}}catch{e.push({name:"Environment Variables",status:"fail",message:"Could not read .env file"}),s.fail()}let a=K("Checking Stripe connection...").start();try{let c=(await import("stripe")).default,m=await new c(process.env.STRIPE_SECRET_KEY,{apiVersion:"2023-10-16"}).accounts.retrieve();e.push({name:"Stripe API",status:"pass",message:`Connected to ${m.settings?.dashboard?.display_name||"Stripe account"}`}),a.succeed()}catch{e.push({name:"Stripe API",status:"fail",message:"Could not connect to Stripe API"}),a.fail()}let t=K("Checking database...").start();try{let c=await z.pathExists(F.join(process.cwd(),"drizzle.config.ts")),p=await z.pathExists(F.join(process.cwd(),"drizzle/schema.ts"));c&&p?(e.push({name:"Database Setup",status:"pass",message:"Drizzle ORM configured"}),t.succeed()):(e.push({name:"Database Setup",status:"warn",message:"Database configuration not detected"}),t.warn())}catch{e.push({name:"Database Setup",status:"warn",message:"Could not verify database setup"}),t.warn()}let r=K("Checking API routes...").start();try{let c=["api/checkout/route.ts","api/webhooks/stripe/route.ts","api/entitlements/[userId]/route.ts"],p=F.join(process.cwd(),"app"),m=[];for(let x of c){let f=F.join(p,x);await z.pathExists(f)||m.push(x)}m.length>0?(e.push({name:"API Routes",status:"warn",message:`Missing routes: ${m.length}`}),r.warn()):(e.push({name:"API Routes",status:"pass",message:"All required routes present"}),r.succeed())}catch{e.push({name:"API Routes",status:"warn",message:"Could not verify API routes"}),r.warn()}let o=K("Checking SDK...").start();try{let c=await z.readJson(F.join(process.cwd(),"package.json"));c.dependencies?.stripe||c.devDependencies?.stripe?(e.push({name:"Stripe SDK",status:"pass",message:"stripe SDK installed"}),o.succeed()):(e.push({name:"Stripe SDK",status:"fail",message:"Stripe SDK not found in dependencies"}),o.fail())}catch{e.push({name:"SDK Installation",status:"fail",message:"Could not check package.json"}),o.fail()}console.log(b.blue.bold(`
\u{1F4CA} Summary
`));let u=e.filter(c=>c.status==="pass").length,h=e.filter(c=>c.status==="fail").length;e.forEach(c=>{let p=c.status==="pass"?b.green("\u2713"):c.status==="fail"?b.red("\u2717"):b.yellow("\u26A0"),m=c.status==="pass"?b.green:c.status==="fail"?b.red:b.yellow;console.log(`${p} ${m(c.name)}`),console.log(b.gray(`  ${c.message}`))}),console.log(),h===0?(console.log(b.green.bold("\u2705 All checks passed!")),console.log(b.gray("Your billing setup looks good."))):h>0&&u>0?(console.log(b.yellow.bold("\u26A0\uFE0F  Some checks failed")),console.log(b.gray("Review the issues above to complete your setup."))):(console.log(b.red.bold("\u274C Setup incomplete")),console.log(b.gray("Run: npx drew-billing-cli init"))),console.log(),console.log(b.gray("Next steps:")),console.log(b.gray("  \u2022 Start dev server: npm run dev")),console.log(b.gray("  \u2022 Start webhook listener: stripe listen --forward-to localhost:3000/api/webhooks/stripe")),console.log(b.gray("  \u2022 View docs: https://github.com/drewsephski/monetize/tree/main/packages/cli#readme")),console.log()}import v from"chalk";import ct from"ora";import Ue from"fs-extra";import dt from"path";async function je(e){console.log(v.blue.bold(`
\u{1F3D6}\uFE0F  @drew/billing sandbox
`));let s=dt.join(process.cwd(),".env.local"),a="";try{a=await Ue.readFile(s,"utf-8")}catch{}let t;if(e.enable)t=!0;else if(e.disable)t=!1;else{let o=a.match(/BILLING_SANDBOX_MODE=(true|false)/);t=!(o?o[1]==="true":!1)}let r=ct(t?"Enabling sandbox mode...":"Disabling sandbox mode...").start();try{a.includes("BILLING_SANDBOX_MODE=")?a=a.replace(/BILLING_SANDBOX_MODE=(true|false)/,`BILLING_SANDBOX_MODE=${t}`):a+=`
# Sandbox mode - no real charges
BILLING_SANDBOX_MODE=${t}
`,await Ue.writeFile(s,a),r.succeed()}catch(o){r.fail("Failed to update sandbox mode"),console.log(o),process.exit(1)}t?(console.log(v.green.bold(`
\u2705 Sandbox mode ENABLED
`)),console.log(v.gray("What this means:")),console.log(v.gray("  \u2022 No real charges will be processed")),console.log(v.gray("  \u2022 Stripe test mode API keys used")),console.log(v.gray("  \u2022 Webhooks simulated locally")),console.log(v.gray("  \u2022 Usage tracked but not billed")),console.log(),console.log(v.yellow("Perfect for development and testing!"))):(console.log(v.yellow.bold(`
\u26A0\uFE0F  Sandbox mode DISABLED
`)),console.log(v.gray("What this means:")),console.log(v.gray("  \u2022 Real charges will be processed")),console.log(v.gray("  \u2022 Stripe live mode API keys required")),console.log(v.gray("  \u2022 Production webhooks active")),console.log(),console.log(v.red("Make sure you have live Stripe keys configured!"))),console.log(),console.log(v.gray("Switch back anytime:")),console.log(v.cyan("  npx drew-billing-cli sandbox")),console.log()}import l from"chalk";import $ from"fs-extra";import j from"path";async function Re(){console.log(l.blue.bold(`
\u{1F464} drew-billing-cli whoami
`));try{let f=await $.readJson(j.join(process.cwd(),"package.json"));console.log(l.gray("Project:"),l.white(f.name||"Unknown")),console.log(l.gray("Version:"),l.white(f.version||"Unknown"))}catch{console.log(l.gray("Project:"),l.yellow("Could not read package.json"))}let e=j.join(process.cwd(),".env.local"),s={};try{(await $.readFile(e,"utf-8")).split(`
`).forEach(w=>{let k=w.match(/^([A-Z_]+)=(.+)$/);k&&(s[k[1]]=k[2].replace(/^["']/,"").replace(/["']$/,""))})}catch{}console.log(),console.log(l.gray("Environment:"));let a=s.STRIPE_SECRET_KEY||"",t=a.startsWith("sk_test_"),r=a.startsWith("sk_live_");t?console.log(l.gray("  Stripe:"),l.yellow("TEST MODE")):r?console.log(l.gray("  Stripe:"),l.green("LIVE MODE \u26A0\uFE0F")):console.log(l.gray("  Stripe:"),l.red("Not configured"));let o=s.BILLING_SANDBOX_MODE==="true";console.log(l.gray("  Sandbox:"),o?l.green("Enabled"):l.gray("Disabled"));let u=s.NEXT_PUBLIC_BILLING_API_URL||s.BILLING_API_URL;console.log(l.gray("  API URL:"),u||l.red("Not set"));try{let f=await $.readJson(j.join(process.cwd(),"package.json")),w=f.dependencies?.["@drew/billing-sdk"]||f.devDependencies?.["@drew/billing-sdk"];w?console.log(l.gray("  SDK:"),w):console.log(l.gray("  SDK:"),l.red("Not installed"))}catch{}console.log();let h=j.join(process.cwd(),"components/billing");try{let w=(await $.readdir(h)).filter(k=>k.endsWith(".tsx"));w.length>0?(console.log(l.gray("Installed Components:")),w.forEach(k=>{console.log(l.gray("  \u2022"),k.replace(".tsx",""))})):(console.log(l.gray("Components:"),l.yellow("None installed")),console.log(l.gray("  Install with: npx drew-billing-cli add <component>")))}catch{console.log(l.gray("Components:"),l.yellow("None installed"))}console.log();let c=await $.pathExists(j.join(process.cwd(),"drizzle.config.ts"));console.log(l.gray("Database:"),c?l.green("Configured"):l.yellow("Not configured"));let p=j.join(process.cwd(),"app/api"),m=await $.pathExists(j.join(p,"checkout/route.ts")),x=await $.pathExists(j.join(p,"webhooks/stripe/route.ts"));console.log(l.gray("API Routes:")),console.log(l.gray("  /api/checkout"),m?l.green("\u2713"):l.red("\u2717")),console.log(l.gray("  /api/webhooks/stripe"),x?l.green("\u2713"):l.red("\u2717")),console.log(),console.log(l.gray("Commands:")),console.log(l.gray("  init       Initialize billing")),console.log(l.gray("  add        Add UI components")),console.log(l.gray("  verify     Verify setup")),console.log(l.gray("  sandbox    Toggle sandbox mode")),console.log()}import g from"chalk";async function De(e){console.log(g.blue.bold(`
\u{1F4CA} Telemetry Settings
`));let s=W();if(e.enable){Ie(),console.log(g.green("\u2705 Anonymous telemetry enabled")),console.log(g.gray(`
We collect:`)),console.log(g.gray("  \u2022 Command usage (init, add, verify, etc.)")),console.log(g.gray("  \u2022 Performance metrics (timing)")),console.log(g.gray("  \u2022 Error reports (no stack traces with PII)")),console.log(g.gray(`
We NEVER collect:`)),console.log(g.gray("  \u2022 Personal information")),console.log(g.gray("  \u2022 Stripe keys or API credentials")),console.log(g.gray("  \u2022 Code or project details")),console.log(g.gray("  \u2022 IP addresses")),O("telemetry_enabled");return}if(e.disable){Ce(),console.log(g.yellow("\u274C Anonymous telemetry disabled")),console.log(g.gray("You can re-enable anytime with: npx drew-billing-cli telemetry --enable"));return}console.log(g.white("Current status:")),console.log(`  Enabled: ${s.enabled?g.green("Yes"):g.red("No")}`),s.machineId&&console.log(`  Machine ID: ${g.gray(s.machineId)}`),s.optedInAt&&console.log(`  Decision date: ${g.gray(s.optedInAt)}`),console.log(g.gray(`
Usage:`)),console.log(g.gray("  npx drew-billing-cli telemetry --enable   # Enable telemetry")),console.log(g.gray("  npx drew-billing-cli telemetry --disable  # Disable telemetry")),console.log(g.gray(`  npx drew-billing-cli telemetry            # Show status
`)),s.optedInAt||(console.log(g.blue("\u{1F4A1} Why enable telemetry?")),console.log(g.gray("Anonymous data helps us improve the CLI and catch bugs faster.")),console.log(g.gray(`No personal information is ever collected.
`)))}import y from"chalk";import{readFileSync as q,existsSync as M}from"fs";import{join as R}from"path";import{execa as pt}from"execa";async function Be(){console.log(y.blue.bold(`
\u{1F50D} @drew/billing doctor
`)),console.log(y.gray(`Running diagnostics...
`));let e=[];e.push(await mt()),e.push(await ut()),e.push(await gt()),e.push(await ft()),e.push(await ht()),e.push(await bt()),e.push(await xt()),yt(e)}async function mt(){let e=R(process.cwd(),".env.local"),s=R(process.cwd(),".env.example"),a="";M(e)?a=q(e,"utf-8"):M(R(process.cwd(),".env"))&&(a=q(R(process.cwd(),".env"),"utf-8"));let t=["STRIPE_SECRET_KEY","NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY","STRIPE_WEBHOOK_SECRET"],r=t.filter(u=>!a.includes(u));if(r.length===0)return{name:"Environment Variables",status:"pass",message:"All required variables configured"};let o=M(s);return{name:"Environment Variables",status:"fail",message:`Missing: ${r.join(", ")}`,fix:o?"cp .env.example .env.local && edit with your Stripe keys":`Create .env.local with:
${t.map(u=>`${u}=...`).join(`
`)}`}}async function ut(){try{let e=new AbortController,s=setTimeout(()=>e.abort(),2e3),a=await fetch("http://localhost:3000/api/health",{signal:e.signal}).catch(()=>null);return clearTimeout(s),a?.ok?{name:"API Connectivity",status:"pass",message:"Billing API responding at localhost:3000"}:{name:"API Connectivity",status:"warn",message:"Dev server not running or API not accessible",fix:"Start dev server: npm run dev"}}catch{return{name:"API Connectivity",status:"warn",message:"Could not connect to localhost:3000",fix:"Start dev server: npm run dev"}}}async function gt(){let e=R(process.cwd(),".env.local"),s="";if(M(e)){let t=q(e,"utf-8").match(/STRIPE_WEBHOOK_SECRET=(.+)/);t&&(s=t[1].trim())}return!s||s==="whsec_..."?{name:"Webhook Configuration",status:"fail",message:"Webhook secret not configured",fix:`1. Run: stripe listen --forward-to http://localhost:3000/api/stripe/webhook
2. Copy webhook secret to .env.local`}:s.startsWith("whsec_")?{name:"Webhook Configuration",status:"pass",message:"Webhook secret configured"}:{name:"Webhook Configuration",status:"warn",message:"Webhook secret format looks unusual",fix:"Verify STRIPE_WEBHOOK_SECRET starts with 'whsec_'"}}async function ft(){try{if(!M(R(process.cwd(),"drizzle.config.ts")))return{name:"Database Connection",status:"fail",message:"No Drizzle config found",fix:"Run: npx drew-billing-cli init to set up database"};try{return await pt("npx",["drizzle-kit","check"],{cwd:process.cwd(),timeout:1e4,reject:!1}),{name:"Database Connection",status:"pass",message:"Database configuration found"}}catch{return{name:"Database Connection",status:"warn",message:"Database config exists but connection not verified",fix:"Run: npx drizzle-kit push to sync schema"}}}catch{return{name:"Database Connection",status:"warn",message:"Could not verify database connection"}}}async function ht(){let e=R(process.cwd(),".env.local"),s="";if(M(e)){let t=q(e,"utf-8").match(/STRIPE_SECRET_KEY=(.+)/);t&&(s=t[1].trim())}return s?s.startsWith("sk_test_")?{name:"Stripe Configuration",status:"pass",message:"Test mode Stripe key configured"}:s.startsWith("sk_live_")?{name:"Stripe Configuration",status:"warn",message:"\u26A0\uFE0F Live Stripe key detected",fix:"Use test keys for development: https://dashboard.stripe.com/test/apikeys"}:{name:"Stripe Configuration",status:"fail",message:"Invalid Stripe key format",fix:"Key should start with sk_test_ or sk_live_"}:{name:"Stripe Configuration",status:"fail",message:"STRIPE_SECRET_KEY not found",fix:"Add STRIPE_SECRET_KEY=sk_test_... to .env.local"}}async function bt(){let e=R(process.cwd(),"package.json");if(!M(e))return{name:"Dependencies",status:"fail",message:"No package.json found",fix:"Run: npm init"};try{let s=JSON.parse(q(e,"utf-8")),a={...s.dependencies,...s.devDependencies},r=["stripe","drizzle-orm"].filter(o=>!a[o]);return r.length===0?{name:"Dependencies",status:"pass",message:"All required packages installed"}:{name:"Dependencies",status:"fail",message:`Missing: ${r.join(", ")}`,fix:`npm install ${r.join(" ")}`}}catch{return{name:"Dependencies",status:"warn",message:"Could not parse package.json"}}}async function xt(){let e=await V();return e.name==="nextjs"?{name:"Framework Support",status:"pass",message:`Next.js ${e.version||""} detected`}:{name:"Framework Support",status:"warn",message:`${e.name} detected (limited support)`,fix:"Next.js is fully supported. Other frameworks have basic support."}}function yt(e){let s=e.filter(r=>r.status==="pass").length,a=e.filter(r=>r.status==="fail").length,t=e.filter(r=>r.status==="warn").length;console.log(y.white.bold(`Results:
`));for(let r of e){let o=r.status==="pass"?y.green("\u2713"):r.status==="fail"?y.red("\u2717"):y.yellow("\u26A0");console.log(`${o} ${y.white(r.name)}`),console.log(`  ${y.gray(r.message)}`),r.fix&&console.log(`  ${y.cyan("Fix:")} ${r.fix}`),console.log()}console.log(y.white.bold("Summary:")),console.log(`  ${y.green(`${s} passing`)}`),a>0&&console.log(`  ${y.red(`${a} failing`)}`),t>0&&console.log(`  ${y.yellow(`${t} warnings`)}`),a===0&&t===0?console.log(y.green.bold(`
\u2705 All checks passed! Your billing setup looks good.
`)):a===0?console.log(y.yellow(`
\u26A0\uFE0F  Some warnings - review above.
`)):(console.log(y.red(`
\u274C ${a} issue(s) need attention. Run the suggested fixes above.
`)),console.log(y.gray(`Need help? https://github.com/drewsephski/monetize/issues
`)))}var A=new vt;A.name("drew-billing-cli").description("CLI for drew-billing - Add subscriptions to your app in 10 minutes").version("1.0.0");A.command("init").description("Initialize @drew/billing in your Next.js project").option("--skip-stripe","Skip Stripe product creation").option("--template <type>","Template type (saas, api, usage)","saas").option("--yes","Skip prompts and use defaults").action(Ae);A.command("add <component>").description("Add a billing component (pricing-table, upgrade-button, usage-meter)").option("--path <path>","Custom installation path").action(B);A.command("verify").description("Verify your billing setup is working correctly").action(Le);A.command("sandbox").description("Toggle sandbox mode for testing without real charges").option("--enable","Enable sandbox mode").option("--disable","Disable sandbox mode").action(je);A.command("whoami").description("Show current billing configuration").action(Re);A.command("telemetry").description("Manage anonymous usage telemetry").option("--enable","Enable telemetry").option("--disable","Disable telemetry").action(De);A.command("doctor").description("Diagnose billing setup issues").action(Be);process.argv.length===2&&(console.log(Z.blue.bold(`
\u26A1 drew-billing-cli
`)),console.log(`Add subscriptions to your app in 10 minutes.
`),console.log(Z.gray("Quick start:")),console.log(`  npx drew-billing-cli init
`),console.log(Z.gray("Commands:")),console.log("  init       Initialize billing in your project"),console.log("  add        Add prebuilt UI components"),console.log("  verify     Verify your setup"),console.log("  sandbox    Toggle sandbox mode"),console.log("  whoami     Show current configuration"),console.log("  doctor     Diagnose setup issues"),console.log(`  telemetry  Manage usage telemetry
`),console.log(Z.gray("Documentation:")),console.log(`  https://billing.drew.dev/docs
`));A.parse();
//# sourceMappingURL=index.js.map
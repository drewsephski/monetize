#!/usr/bin/env node
import{Command as Ve}from"commander";import F from"chalk";import l from"chalk";import ie from"inquirer";import R from"ora";import{execa as De}from"execa";import P from"fs-extra";import C from"path";async function $(){let e=process.cwd(),t=C.join(e,"package.json");if(await P.pathExists(t)){let n=await P.readJson(t),o={...n.dependencies,...n.devDependencies};if(o.next){let s=await P.pathExists(C.join(e,"app")),i=await P.pathExists(C.join(e,"pages"));return{name:"nextjs",version:o.next,type:s?"app":i?"pages":"app"}}if(o.react)return{name:"react",version:o.react};if(o.vue||o["@vue/core"])return{name:"vue",version:o.vue||o["@vue/core"]};if(o.express)return{name:"express",version:o.express}}return await P.pathExists(C.join(e,"next.config.js"))||await P.pathExists(C.join(e,"next.config.ts"))||await P.pathExists(C.join(e,"next.config.mjs"))?{name:"nextjs",type:"app"}:await P.pathExists(C.join(e,"vite.config.ts"))?{name:"react"}:{name:"unknown"}}import ye from"stripe";async function Y(e){let t=new ye(e,{apiVersion:"2026-03-25.dahlia"}),n=[],o=await t.products.create({name:"Pro",description:"For growing businesses",metadata:{tier:"pro",features:JSON.stringify(["10,000 API calls/mo","Unlimited projects","Priority support","Advanced analytics"])}}),s=await t.prices.create({product:o.id,unit_amount:2900,currency:"usd",recurring:{interval:"month"},lookup_key:"pro_monthly"});n.push({id:o.id,name:"Pro",priceId:s.id});let i=await t.products.create({name:"Enterprise",description:"For large organizations",metadata:{tier:"enterprise",features:JSON.stringify(["Unlimited API calls","Custom integrations","SLA guarantee","Dedicated support"])}}),u=await t.prices.create({product:i.id,unit_amount:9900,currency:"usd",recurring:{interval:"month"},lookup_key:"enterprise_monthly"});n.push({id:i.id,name:"Enterprise",priceId:u.id});let m=await t.products.create({name:"API Calls",description:"Per-call pricing for API usage",metadata:{type:"usage",unit:"api_call"}}),w=await t.prices.create({product:m.id,unit_amount:1,currency:"usd",recurring:{interval:"month",usage_type:"metered"},lookup_key:"api_calls"});return n.push({id:m.id,name:"API Calls (Usage)",priceId:w.id}),n}import v from"fs-extra";import S from"path";async function q(e,t){let n=process.cwd();switch(e){case"saas":await we(n,t);break;case"api":await ve(n,t);break;case"usage":await Se(n,t);break;case"minimal":break;default:throw new Error(`Unknown template: ${e}`)}}async function we(e,t){let n=`import { PricingTable } from "@/components/billing/pricing-table";

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
`;await v.ensureDir(S.join(e,"app/pricing")),await v.writeFile(S.join(e,"app/pricing/page.tsx"),n);let o=`import { BillingPortalButton } from "@/components/billing/billing-portal-button";
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
`;await v.ensureDir(S.join(e,"app/billing")),await v.writeFile(S.join(e,"app/billing/page.tsx"),o),await v.writeFile(S.join(e,"app/demo/page.tsx"),`"use client";

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
`)}async function ve(e,t){let n=`import { NextRequest, NextResponse } from "next/server";
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
`;await v.ensureDir(S.join(e,"app/api/example")),await v.writeFile(S.join(e,"app/api/example/route.ts"),n),await v.writeFile(S.join(e,"middleware.ts"),`import { NextResponse } from "next/server";
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
`)}async function Se(e,t){let n=`"use client";

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
`;await v.ensureDir(S.join(e,"app/dashboard")),await v.writeFile(S.join(e,"app/dashboard/page.tsx"),n)}import G from"fs-extra";import ke from"path";async function X(e){let t=ke.join(process.cwd(),".env.local"),n="";try{n=await G.readFile(t,"utf-8")}catch{}for(let[o,s]of Object.entries(e)){let i=`${o}=${s}`;n.includes(`${o}=`)?n=n.replace(new RegExp(`${o}=.*`),i):(n+=n.endsWith(`
`)?"":`
`,n+=`${i}
`)}await G.writeFile(t,n)}import{execa as Ie}from"execa";async function J(){try{await Ie("npx",["drizzle-kit","push","--force"],{cwd:process.cwd(),stdio:"pipe"})}catch{throw new Error("Database push failed. Run 'npx drizzle-kit push' manually.")}}import{createHash as xe}from"crypto";import{readFileSync as Pe,existsSync as Q,writeFileSync as Ee,mkdirSync as _e}from"fs";import{homedir as Z}from"os";import{join as ee}from"path";import pt from"chalk";var K=ee(Z(),".drew-billing"),M=ee(K,"telemetry.json"),Ce=process.env.TELEMETRY_ENDPOINT||"https://billing.drew.dev/api/internal/telemetry";function H(){let e=`${Z()}_${process.platform}_${process.arch}`;return xe("sha256").update(e).digest("hex").substring(0,16)}function U(){try{if(Q(M)){let e=JSON.parse(Pe(M,"utf-8"));return{enabled:e.enabled??!1,machineId:e.machineId||H(),optedInAt:e.optedInAt}}}catch{}return{enabled:!1,machineId:H()}}function te(e){try{Q(K)||_e(K,{recursive:!0}),Ee(M,JSON.stringify(e,null,2))}catch{}}function ne(){let e=U();e.enabled=!0,e.optedInAt=new Date().toISOString(),te(e)}function oe(){let e=U();e.enabled=!1,te(e)}function Te(){return`cli_${Math.random().toString(36).substring(2,15)}_${Date.now()}`}function D(e,t){let n=U();if(!n.enabled)return;let o={type:e,timestamp:new Date().toISOString(),machineId:n.machineId,sessionId:Te(),cliVersion:"1.0.0",metadata:t};Ne(o).catch(()=>{})}function se(e,t,n){D(e,{...n,durationMs:t})}async function Ne(e){try{await fetch(Ce,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})}catch{}}var z={CLI_INSTALL:"cli_install",INIT_STARTED:"init_started",INIT_COMPLETED:"init_completed",SANDBOX_STARTED:"sandbox_started",FIRST_CHECKOUT:"first_checkout",FIRST_SUBSCRIPTION:"first_subscription"};function W(e,t){D(`funnel_${e}`,t)}import O from"chalk";import ae from"inquirer";async function re(e,t){console.log(),console.log(O.blue.bold("\u{1F4E3} Quick Feedback")),console.log(O.gray("Your feedback helps us improve.")),console.log();try{let{wasEasy:n}=await ae.prompt([{type:"confirm",name:"wasEasy",message:"Was this easy to set up?",default:!0}]),o;if(!n){let{feedback:s}=await ae.prompt([{type:"input",name:"feedback",message:"What was difficult? (optional, 1 sentence)"}]);o=s}D("feedback_collected",{eventType:e,rating:n?"positive":"negative",feedback:o,...t}),console.log(),console.log(n?O.green("\u2728 Thanks! Glad it went smoothly."):O.yellow("\u{1F4DD} Thanks for the feedback \u2014 we'll use it to improve.")),console.log()}catch{}}async function le(e){console.log(l.blue.bold(`
\u26A1 @drew/billing init
`)),W(z.INIT_STARTED,{template:e.template});let t=Date.now(),n=R("Detecting framework...").start(),o=await $();if(n.succeed(`Detected: ${l.green(o.name)} ${o.version||""}`),o.name!=="nextjs"){console.log(l.yellow(`
\u26A0\uFE0F  Currently only Next.js is fully supported.`)),console.log(l.gray(`Other frameworks coming soon: React, Vue, Svelte, Express
`));let{continueAnyway:p}=await ie.prompt([{type:"confirm",name:"continueAnyway",message:"Continue with manual setup?",default:!1}]);p||(console.log(l.gray(`
Aborted.
`)),process.exit(0))}let s;e.yes?s={stripeSecretKey:process.env.STRIPE_SECRET_KEY||"",stripePublishableKey:process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY||"",webhookSecret:process.env.STRIPE_WEBHOOK_SECRET||"",template:e.template||"saas",createProducts:!e.skipStripe}:s={...await ie.prompt([{type:"input",name:"stripeSecretKey",message:"Stripe Secret Key (sk_test_...):",default:process.env.STRIPE_SECRET_KEY,validate:g=>g.startsWith("sk_test_")||g.startsWith("sk_live_")?!0:"Must start with sk_test_ or sk_live_"},{type:"input",name:"stripePublishableKey",message:"Stripe Publishable Key (pk_test_...):",default:process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,validate:g=>g.startsWith("pk_test_")||g.startsWith("pk_live_")?!0:"Must start with pk_test_ or pk_live_"},{type:"list",name:"template",message:"Choose your template:",choices:[{name:"SaaS Starter (pricing page + auth + dashboard)",value:"saas"},{name:"API Billing (usage-based pricing)",value:"api"},{name:"Simple Usage (metered billing)",value:"usage"},{name:"Minimal (just the SDK)",value:"minimal"}],default:e.template||"saas"},{type:"confirm",name:"createProducts",message:"Create Stripe products automatically?",default:!e.skipStripe}]),webhookSecret:""},console.log(l.blue.bold(`
\u{1F4E6} Setting up @drew/billing...
`));let i=R("Installing dependencies...").start();try{await De("npm",["install","@drew/billing-sdk","stripe"],{cwd:process.cwd(),stdio:"pipe"}),i.succeed("Dependencies installed")}catch{i.fail("Failed to install dependencies"),console.log(l.gray("Run manually: npm install @drew/billing-sdk stripe"))}let u=[];if(s.createProducts){let p=R("Creating Stripe products...").start();try{u=await Y(s.stripeSecretKey),p.succeed(`Created ${u.length} products in Stripe`)}catch{p.fail("Failed to create Stripe products"),console.log(l.gray("You can create them manually in the Stripe Dashboard"))}}let m=R("Setting up database...").start();try{await J(),m.succeed("Database configured")}catch{m.fail("Database setup failed"),console.log(l.gray("Run: npx drizzle-kit push"))}let w=R(`Installing ${s.template} template...`).start();try{await q(s.template,u),w.succeed("Template installed")}catch{w.fail("Template installation failed")}let r=R("Updating environment variables...").start();try{await X({STRIPE_SECRET_KEY:s.stripeSecretKey,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:s.stripePublishableKey,STRIPE_WEBHOOK_SECRET:s.webhookSecret||"whsec_... (run: stripe listen --forward-to localhost:3000/api/webhooks/stripe)",BILLING_API_URL:"http://localhost:3000"}),r.succeed("Environment variables configured")}catch{r.fail("Failed to update .env")}let h=Date.now()-t;W(z.INIT_COMPLETED,{template:s.template,durationMs:h,framework:o.name}),se("init_complete",h),console.log(l.green.bold(`
\u2705 Setup complete!
`)),console.log(l.white(`Next steps:
`)),console.log(l.gray("1."),"Start your dev server:",l.cyan("npm run dev")),console.log(l.gray("2."),"Start Stripe webhook listener:",l.cyan("stripe listen --forward-to http://localhost:3000/api/stripe/webhook")),console.log(l.gray("3."),"Visit",l.cyan("http://localhost:3000/pricing")),console.log(),console.log(l.gray("Documentation:"),l.underline("https://billing.drew.dev/docs")),console.log(l.gray("Diagnostics:"),l.cyan("npx @drew/billing doctor")),console.log(l.gray("Support:"),l.underline("https://github.com/drew/billing/issues")),console.log(),u.length>0&&(console.log(l.gray("Created Stripe products:")),u.forEach(p=>{console.log(l.gray(`  \u2022 ${p.name}: ${p.priceId}`))}),console.log()),console.log(l.blue("\u{1F4CA} Help improve @drew/billing")),console.log(l.gray("Enable anonymous telemetry to help us fix bugs faster.")),console.log(l.gray(`Run: npx @drew/billing telemetry --enable
`)),await re("init_completed",{template:s.template,framework:o.name,durationMs:h})}import k from"chalk";import Re from"ora";import ce from"fs-extra";import pe from"path";var V={"pricing-table":{name:"PricingTable",description:"Beautiful pricing table with Stripe checkout integration",files:["pricing-table.tsx","pricing-table.css"]},"upgrade-button":{name:"UpgradeButton",description:"Smart upgrade button with plan comparison",files:["upgrade-button.tsx"]},"usage-meter":{name:"UsageMeter",description:"Real-time usage visualization with limits",files:["usage-meter.tsx"]},"current-plan":{name:"CurrentPlanBadge",description:"Shows current plan with upgrade CTA",files:["current-plan.tsx"]},"billing-portal":{name:"BillingPortalButton",description:"Opens Stripe customer portal",files:["billing-portal-button.tsx"]},"subscription-gate":{name:"SubscriptionGate",description:"Blocks content based on subscription status",files:["subscription-gate.tsx"]},"trial-banner":{name:"TrialBanner",description:"Shows trial status and countdown",files:["trial-banner.tsx"]},all:{name:"All Components",description:"Install all billing components",files:["pricing-table.tsx","pricing-table.css","upgrade-button.tsx","usage-meter.tsx","current-plan.tsx","billing-portal-button.tsx","subscription-gate.tsx","trial-banner.tsx"]}};async function ge(e,t){console.log(k.blue.bold(`
\u{1F4E6} @drew/billing add
`));let n=Object.keys(V);n.includes(e)||(console.log(k.red(`Invalid component: ${e}
`)),console.log(k.gray("Available components:")),n.forEach(m=>{let w=V[m];console.log(k.gray(`  \u2022 ${m}`)+` - ${w.description}`)}),console.log(),process.exit(1));let o=V[e],s=t.path||"components/billing",i=pe.join(process.cwd(),s);console.log(k.gray(`Installing ${o.name}...
`)),await ce.ensureDir(i);let u=Re("Downloading components...").start();try{for(let m of o.files){let w=Le(m);await ce.writeFile(pe.join(i,m),w)}u.succeed(`Installed ${o.name} to ${s}/`)}catch(m){u.fail("Failed to install component"),console.log(m),process.exit(1)}console.log(k.green.bold(`
\u2705 Component installed!
`)),console.log(k.gray("Usage:")),console.log(k.cyan(`import { ${o.name} } from "${s}/${e}"`)),console.log(),console.log(k.gray("Documentation:"),k.underline("https://billing.drew.dev/docs/components")),console.log()}function Le(e){return{"pricing-table.tsx":`"use client";

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
`,"upgrade-button.tsx":`"use client";

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
`,"usage-meter.tsx":`"use client";

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
`}[e]||`// ${e} - Component template
export function Placeholder() { return null; }`}import d from"chalk";import B from"ora";import L from"fs-extra";import A from"path";async function de(){console.log(d.blue.bold(`
\u{1F50D} @drew/billing verify
`)),console.log(d.gray(`Checking your billing setup...
`));let e=[],t=B("Checking environment variables...").start();try{let r=A.join(process.cwd(),".env.local");if(!await L.pathExists(r))e.push({name:"Environment File",status:"fail",message:".env.local not found"}),t.fail();else{let p=await L.readFile(r,"utf-8"),y=["STRIPE_SECRET_KEY","NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"].filter(I=>!p.includes(I));y.length>0?(e.push({name:"Environment Variables",status:"fail",message:`Missing: ${y.join(", ")}`}),t.fail()):(e.push({name:"Environment Variables",status:"pass",message:"All required variables present"}),t.succeed())}}catch{e.push({name:"Environment Variables",status:"fail",message:"Could not read .env file"}),t.fail()}let n=B("Checking Stripe connection...").start();try{let r=(await import("stripe")).default,p=await new r(process.env.STRIPE_SECRET_KEY,{apiVersion:"2024-12-18.acacia"}).accounts.retrieve();e.push({name:"Stripe API",status:"pass",message:`Connected to ${p.settings?.dashboard?.display_name||"Stripe account"}`}),n.succeed()}catch{e.push({name:"Stripe API",status:"fail",message:"Could not connect to Stripe API"}),n.fail()}let o=B("Checking database...").start();try{let r=await L.pathExists(A.join(process.cwd(),"drizzle.config.ts")),h=await L.pathExists(A.join(process.cwd(),"drizzle/schema.ts"));r&&h?(e.push({name:"Database Setup",status:"pass",message:"Drizzle ORM configured"}),o.succeed()):(e.push({name:"Database Setup",status:"warn",message:"Database configuration not detected"}),o.warn())}catch{e.push({name:"Database Setup",status:"warn",message:"Could not verify database setup"}),o.warn()}let s=B("Checking API routes...").start();try{let r=["api/checkout/route.ts","api/webhooks/stripe/route.ts","api/entitlements/[userId]/route.ts"],h=A.join(process.cwd(),"app"),p=[];for(let g of r){let y=A.join(h,g);await L.pathExists(y)||p.push(g)}p.length>0?(e.push({name:"API Routes",status:"warn",message:`Missing routes: ${p.length}`}),s.warn()):(e.push({name:"API Routes",status:"pass",message:"All required routes present"}),s.succeed())}catch{e.push({name:"API Routes",status:"warn",message:"Could not verify API routes"}),s.warn()}let i=B("Checking SDK...").start();try{let r=await L.readJson(A.join(process.cwd(),"package.json"));r.dependencies?.["@drew/billing-sdk"]||r.devDependencies?.["@drew/billing-sdk"]?(e.push({name:"SDK Installation",status:"pass",message:"@drew/billing-sdk installed"}),i.succeed()):(e.push({name:"SDK Installation",status:"fail",message:"SDK not found in dependencies"}),i.fail())}catch{e.push({name:"SDK Installation",status:"fail",message:"Could not check package.json"}),i.fail()}console.log(d.blue.bold(`
\u{1F4CA} Summary
`));let u=e.filter(r=>r.status==="pass").length,m=e.filter(r=>r.status==="fail").length,w=e.filter(r=>r.status==="warn").length;e.forEach(r=>{let h=r.status==="pass"?d.green("\u2713"):r.status==="fail"?d.red("\u2717"):d.yellow("\u26A0"),p=r.status==="pass"?d.green:r.status==="fail"?d.red:d.yellow;console.log(`${h} ${p(r.name)}`),console.log(d.gray(`  ${r.message}`))}),console.log(),m===0?(console.log(d.green.bold("\u2705 All checks passed!")),console.log(d.gray("Your billing setup looks good."))):m>0&&u>0?(console.log(d.yellow.bold("\u26A0\uFE0F  Some checks failed")),console.log(d.gray("Review the issues above to complete your setup."))):(console.log(d.red.bold("\u274C Setup incomplete")),console.log(d.gray("Run: npx @drew/billing init"))),console.log(),console.log(d.gray("Next steps:")),console.log(d.gray("  \u2022 Start dev server: npm run dev")),console.log(d.gray("  \u2022 Start webhook listener: stripe listen --forward-to localhost:3000/api/webhooks/stripe")),console.log(d.gray("  \u2022 View docs: https://billing.drew.dev/docs")),console.log()}import b from"chalk";import Ae from"ora";import ue from"fs-extra";import Ue from"path";async function me(e){console.log(b.blue.bold(`
\u{1F3D6}\uFE0F  @drew/billing sandbox
`));let t=Ue.join(process.cwd(),".env.local"),n="";try{n=await ue.readFile(t,"utf-8")}catch{}let o;if(e.enable)o=!0;else if(e.disable)o=!1;else{let i=n.match(/BILLING_SANDBOX_MODE=(true|false)/);o=!(i?i[1]==="true":!1)}let s=Ae(o?"Enabling sandbox mode...":"Disabling sandbox mode...").start();try{n.includes("BILLING_SANDBOX_MODE=")?n=n.replace(/BILLING_SANDBOX_MODE=(true|false)/,`BILLING_SANDBOX_MODE=${o}`):n+=`
# Sandbox mode - no real charges
BILLING_SANDBOX_MODE=${o}
`,await ue.writeFile(t,n),s.succeed()}catch(i){s.fail("Failed to update sandbox mode"),console.log(i),process.exit(1)}o?(console.log(b.green.bold(`
\u2705 Sandbox mode ENABLED
`)),console.log(b.gray("What this means:")),console.log(b.gray("  \u2022 No real charges will be processed")),console.log(b.gray("  \u2022 Stripe test mode API keys used")),console.log(b.gray("  \u2022 Webhooks simulated locally")),console.log(b.gray("  \u2022 Usage tracked but not billed")),console.log(),console.log(b.yellow("Perfect for development and testing!"))):(console.log(b.yellow.bold(`
\u26A0\uFE0F  Sandbox mode DISABLED
`)),console.log(b.gray("What this means:")),console.log(b.gray("  \u2022 Real charges will be processed")),console.log(b.gray("  \u2022 Stripe live mode API keys required")),console.log(b.gray("  \u2022 Production webhooks active")),console.log(),console.log(b.red("Make sure you have live Stripe keys configured!"))),console.log(),console.log(b.gray("Switch back anytime:")),console.log(b.cyan("  npx @drew/billing sandbox")),console.log()}import a from"chalk";import T from"fs-extra";import E from"path";async function fe(){console.log(a.blue.bold(`
\u{1F464} @drew/billing whoami
`));try{let g=await T.readJson(E.join(process.cwd(),"package.json"));console.log(a.gray("Project:"),a.white(g.name||"Unknown")),console.log(a.gray("Version:"),a.white(g.version||"Unknown"))}catch{console.log(a.gray("Project:"),a.yellow("Could not read package.json"))}let e=E.join(process.cwd(),".env.local"),t={};try{(await T.readFile(e,"utf-8")).split(`
`).forEach(y=>{let I=y.match(/^([A-Z_]+)=(.+)$/);I&&(t[I[1]]=I[2].replace(/^["']/,"").replace(/["']$/,""))})}catch{}console.log(),console.log(a.gray("Environment:"));let n=t.STRIPE_SECRET_KEY||"",o=n.startsWith("sk_test_"),s=n.startsWith("sk_live_");o?console.log(a.gray("  Stripe:"),a.yellow("TEST MODE")):s?console.log(a.gray("  Stripe:"),a.green("LIVE MODE \u26A0\uFE0F")):console.log(a.gray("  Stripe:"),a.red("Not configured"));let i=t.BILLING_SANDBOX_MODE==="true";console.log(a.gray("  Sandbox:"),i?a.green("Enabled"):a.gray("Disabled"));let u=t.NEXT_PUBLIC_BILLING_API_URL||t.BILLING_API_URL;console.log(a.gray("  API URL:"),u||a.red("Not set"));try{let g=await T.readJson(E.join(process.cwd(),"package.json")),y=g.dependencies?.["@drew/billing-sdk"]||g.devDependencies?.["@drew/billing-sdk"];y?console.log(a.gray("  SDK:"),y):console.log(a.gray("  SDK:"),a.red("Not installed"))}catch{}console.log();let m=E.join(process.cwd(),"components/billing");try{let y=(await T.readdir(m)).filter(I=>I.endsWith(".tsx"));y.length>0?(console.log(a.gray("Installed Components:")),y.forEach(I=>{console.log(a.gray("  \u2022"),I.replace(".tsx",""))})):(console.log(a.gray("Components:"),a.yellow("None installed")),console.log(a.gray("  Install with: npx @drew/billing add <component>")))}catch{console.log(a.gray("Components:"),a.yellow("None installed"))}console.log();let w=await T.pathExists(E.join(process.cwd(),"drizzle.config.ts"));console.log(a.gray("Database:"),w?a.green("Configured"):a.yellow("Not configured"));let r=E.join(process.cwd(),"app/api"),h=await T.pathExists(E.join(r,"checkout/route.ts")),p=await T.pathExists(E.join(r,"webhooks/stripe/route.ts"));console.log(a.gray("API Routes:")),console.log(a.gray("  /api/checkout"),h?a.green("\u2713"):a.red("\u2717")),console.log(a.gray("  /api/webhooks/stripe"),p?a.green("\u2713"):a.red("\u2717")),console.log(),console.log(a.gray("Commands:")),console.log(a.gray("  init       Initialize billing")),console.log(a.gray("  add        Add UI components")),console.log(a.gray("  verify     Verify setup")),console.log(a.gray("  sandbox    Toggle sandbox mode")),console.log()}import c from"chalk";async function be(e){console.log(c.blue.bold(`
\u{1F4CA} Telemetry Settings
`));let t=U();if(e.enable){ne(),console.log(c.green("\u2705 Anonymous telemetry enabled")),console.log(c.gray(`
We collect:`)),console.log(c.gray("  \u2022 Command usage (init, add, verify, etc.)")),console.log(c.gray("  \u2022 Performance metrics (timing)")),console.log(c.gray("  \u2022 Error reports (no stack traces with PII)")),console.log(c.gray(`
We NEVER collect:`)),console.log(c.gray("  \u2022 Personal information")),console.log(c.gray("  \u2022 Stripe keys or API credentials")),console.log(c.gray("  \u2022 Code or project details")),console.log(c.gray("  \u2022 IP addresses")),D("telemetry_enabled");return}if(e.disable){oe(),console.log(c.yellow("\u274C Anonymous telemetry disabled")),console.log(c.gray("You can re-enable anytime with: npx @drew/billing telemetry --enable"));return}console.log(c.white("Current status:")),console.log(`  Enabled: ${t.enabled?c.green("Yes"):c.red("No")}`),t.machineId&&console.log(`  Machine ID: ${c.gray(t.machineId)}`),t.optedInAt&&console.log(`  Decision date: ${c.gray(t.optedInAt)}`),console.log(c.gray(`
Usage:`)),console.log(c.gray("  npx @drew/billing telemetry --enable   # Enable telemetry")),console.log(c.gray("  npx @drew/billing telemetry --disable  # Disable telemetry")),console.log(c.gray(`  npx @drew/billing telemetry            # Show status
`)),t.optedInAt||(console.log(c.blue("\u{1F4A1} Why enable telemetry?")),console.log(c.gray("Anonymous data helps us improve the CLI and catch bugs faster.")),console.log(c.gray(`No personal information is ever collected.
`)))}import f from"chalk";import{readFileSync as j,existsSync as N}from"fs";import{join as _}from"path";import{execa as Be}from"execa";async function he(){console.log(f.blue.bold(`
\u{1F50D} @drew/billing doctor
`)),console.log(f.gray(`Running diagnostics...
`));let e=[];e.push(await je()),e.push(await $e()),e.push(await Oe()),e.push(await Fe()),e.push(await Ke()),e.push(await Me()),e.push(await ze()),We(e)}async function je(){let e=_(process.cwd(),".env.local"),t=_(process.cwd(),".env.example"),n="";N(e)?n=j(e,"utf-8"):N(_(process.cwd(),".env"))&&(n=j(_(process.cwd(),".env"),"utf-8"));let o=["STRIPE_SECRET_KEY","NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY","STRIPE_WEBHOOK_SECRET"],s=o.filter(u=>!n.includes(u));if(s.length===0)return{name:"Environment Variables",status:"pass",message:"All required variables configured"};let i=N(t);return{name:"Environment Variables",status:"fail",message:`Missing: ${s.join(", ")}`,fix:i?"cp .env.example .env.local && edit with your Stripe keys":`Create .env.local with:
${o.map(u=>`${u}=...`).join(`
`)}`}}async function $e(){try{let e=new AbortController,t=setTimeout(()=>e.abort(),2e3),n=await fetch("http://localhost:3000/api/health",{signal:e.signal}).catch(()=>null);return clearTimeout(t),n?.ok?{name:"API Connectivity",status:"pass",message:"Billing API responding at localhost:3000"}:{name:"API Connectivity",status:"warn",message:"Dev server not running or API not accessible",fix:"Start dev server: npm run dev"}}catch{return{name:"API Connectivity",status:"warn",message:"Could not connect to localhost:3000",fix:"Start dev server: npm run dev"}}}async function Oe(){let e=_(process.cwd(),".env.local"),t="";if(N(e)){let o=j(e,"utf-8").match(/STRIPE_WEBHOOK_SECRET=(.+)/);o&&(t=o[1].trim())}return!t||t==="whsec_..."?{name:"Webhook Configuration",status:"fail",message:"Webhook secret not configured",fix:`1. Run: stripe listen --forward-to http://localhost:3000/api/stripe/webhook
2. Copy webhook secret to .env.local`}:t.startsWith("whsec_")?{name:"Webhook Configuration",status:"pass",message:"Webhook secret configured"}:{name:"Webhook Configuration",status:"warn",message:"Webhook secret format looks unusual",fix:"Verify STRIPE_WEBHOOK_SECRET starts with 'whsec_'"}}async function Fe(){try{if(!N(_(process.cwd(),"drizzle.config.ts")))return{name:"Database Connection",status:"fail",message:"No Drizzle config found",fix:"Run: npx @drew/billing init to set up database"};try{return await Be("npx",["drizzle-kit","check"],{cwd:process.cwd(),timeout:1e4,reject:!1}),{name:"Database Connection",status:"pass",message:"Database configuration found"}}catch{return{name:"Database Connection",status:"warn",message:"Database config exists but connection not verified",fix:"Run: npx drizzle-kit push to sync schema"}}}catch{return{name:"Database Connection",status:"warn",message:"Could not verify database connection"}}}async function Ke(){let e=_(process.cwd(),".env.local"),t="";if(N(e)){let o=j(e,"utf-8").match(/STRIPE_SECRET_KEY=(.+)/);o&&(t=o[1].trim())}return t?t.startsWith("sk_test_")?{name:"Stripe Configuration",status:"pass",message:"Test mode Stripe key configured"}:t.startsWith("sk_live_")?{name:"Stripe Configuration",status:"warn",message:"\u26A0\uFE0F Live Stripe key detected",fix:"Use test keys for development: https://dashboard.stripe.com/test/apikeys"}:{name:"Stripe Configuration",status:"fail",message:"Invalid Stripe key format",fix:"Key should start with sk_test_ or sk_live_"}:{name:"Stripe Configuration",status:"fail",message:"STRIPE_SECRET_KEY not found",fix:"Add STRIPE_SECRET_KEY=sk_test_... to .env.local"}}async function Me(){let e=_(process.cwd(),"package.json");if(!N(e))return{name:"Dependencies",status:"fail",message:"No package.json found",fix:"Run: npm init"};try{let t=JSON.parse(j(e,"utf-8")),n={...t.dependencies,...t.devDependencies},s=["@drew/billing-sdk","stripe"].filter(i=>!n[i]);return s.length===0?{name:"Dependencies",status:"pass",message:"All required packages installed"}:{name:"Dependencies",status:"fail",message:`Missing: ${s.join(", ")}`,fix:`npm install ${s.join(" ")}`}}catch{return{name:"Dependencies",status:"warn",message:"Could not parse package.json"}}}async function ze(){let e=await $();return e.name==="nextjs"?{name:"Framework Support",status:"pass",message:`Next.js ${e.version||""} detected`}:{name:"Framework Support",status:"warn",message:`${e.name} detected (limited support)`,fix:"Next.js is fully supported. Other frameworks have basic support."}}function We(e){let t=e.filter(s=>s.status==="pass").length,n=e.filter(s=>s.status==="fail").length,o=e.filter(s=>s.status==="warn").length;console.log(f.white.bold(`Results:
`));for(let s of e){let i=s.status==="pass"?f.green("\u2713"):s.status==="fail"?f.red("\u2717"):f.yellow("\u26A0");console.log(`${i} ${f.white(s.name)}`),console.log(`  ${f.gray(s.message)}`),s.fix&&console.log(`  ${f.cyan("Fix:")} ${s.fix}`),console.log()}console.log(f.white.bold("Summary:")),console.log(`  ${f.green(`${t} passing`)}`),n>0&&console.log(`  ${f.red(`${n} failing`)}`),o>0&&console.log(`  ${f.yellow(`${o} warnings`)}`),n===0&&o===0?console.log(f.green.bold(`
\u2705 All checks passed! Your billing setup looks good.
`)):n===0?console.log(f.yellow(`
\u26A0\uFE0F  Some warnings - review above.
`)):(console.log(f.red(`
\u274C ${n} issue(s) need attention. Run the suggested fixes above.
`)),console.log(f.gray(`Need help? https://billing.drew.dev/docs/troubleshooting
`)))}var x=new Ve;x.name("@drew/billing").description("CLI for @drew/billing - Add subscriptions to your app in 10 minutes").version("1.0.0");x.command("init").description("Initialize @drew/billing in your Next.js project").option("--skip-stripe","Skip Stripe product creation").option("--template <type>","Template type (saas, api, usage)","saas").option("--yes","Skip prompts and use defaults").action(le);x.command("add <component>").description("Add a billing component (pricing-table, upgrade-button, usage-meter)").option("--path <path>","Custom installation path").action(ge);x.command("verify").description("Verify your billing setup is working correctly").action(de);x.command("sandbox").description("Toggle sandbox mode for testing without real charges").option("--enable","Enable sandbox mode").option("--disable","Disable sandbox mode").action(me);x.command("whoami").description("Show current billing configuration").action(fe);x.command("telemetry").description("Manage anonymous usage telemetry").option("--enable","Enable telemetry").option("--disable","Disable telemetry").action(be);x.command("doctor").description("Diagnose billing setup issues").action(he);process.argv.length===2&&(console.log(F.blue.bold(`
\u26A1 @drew/billing
`)),console.log(`Add subscriptions to your app in 10 minutes.
`),console.log(F.gray("Quick start:")),console.log(`  npx @drew/billing init
`),console.log(F.gray("Commands:")),console.log("  init       Initialize billing in your project"),console.log("  add        Add prebuilt UI components"),console.log("  verify     Verify your setup"),console.log("  sandbox    Toggle sandbox mode"),console.log("  whoami     Show current configuration"),console.log("  doctor     Diagnose setup issues"),console.log(`  telemetry  Manage usage telemetry
`),console.log(F.gray("Documentation:")),console.log(`  https://billing.drew.dev/docs
`));x.parse();
//# sourceMappingURL=index.js.map
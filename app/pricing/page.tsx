"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Check,
  Loader2,
  ArrowRight,
  Zap,
  Shield,
  Layers,
  Code,
  Terminal,
  Package,
  Building2,
  Cloud,
  Download,
} from "lucide-react";

type ProductTab = "hosted" | "sdk";

// Drew Billing Cloud (SaaS) - We host your billing infrastructure
const HOSTED_PLANS = [
  {
    id: "free",
    name: "Free",
    description: "For individuals getting started",
    price: 0,
    interval: null,
    priceId: null,
    features: [
      "Up to 100 customers",
      "Basic checkout pages",
      "Stripe integration",
      "Community support",
      "Self-hosted (you manage it)",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing teams",
    price: 29,
    interval: "month",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "price_1TKR4nRZE8Whwvf0J1c7e0Vz",
    features: [
      "Up to 10,000 customers",
      "Hosted billing dashboard",
      "Advanced analytics",
      "Priority email support",
      "Team member access",
      "14-day free trial",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    id: "growth",
    name: "Growth",
    description: "For scaling startups",
    price: 49,
    interval: "month",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH || "price_1TKNcXRZE8Whwvf0LPFCoLvn",
    features: [
      "Up to 50,000 customers",
      "Usage-based billing",
      "Revenue analytics",
      "Priority support",
      "API access",
      "0.5% transaction fee",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
];

// Drew Billing SDK (License) - Embed billing in your own app
const SDK_PLANS = [
  {
    id: "sdk-free",
    name: "Free",
    description: "Try it out in your app",
    price: 0,
    features: [
      "1,000 API calls per month",
      "1 active project",
      "Basic billing features",
      "Self-hosted setup",
      "Community support",
    ],
    cta: "View Docs",
    icon: Package,
  },
  {
    id: "sdk-pro",
    name: "Pro",
    description: "For indie developers",
    price: 29,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SDK_PRO || "price_1TKOSiRZE8Whwvf0DwqOcFUk",
    features: [
      "10,000 API calls per month",
      "5 active projects",
      "All billing features",
      "Email support",
      "Usage analytics",
    ],
    cta: "Buy License",
    popular: true,
    icon: Code,
  },
  {
    id: "sdk-team",
    name: "Team",
    description: "For dev teams & agencies",
    price: 99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SDK_TEAM || "price_1TKOSjRZE8Whwvf0GunJcrO3",
    features: [
      "100,000 API calls per month",
      "20 active projects",
      "Team license sharing",
      "Custom integrations",
      "Priority support",
    ],
    cta: "Buy License",
    icon: Building2,
  },
  {
    id: "sdk-enterprise",
    name: "Enterprise",
    description: "For large platforms",
    price: 499,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_SDK_ENTERPRISE || "price_1TKOSjRZE8Whwvf0EgF5Flpy",
    features: [
      "Unlimited API calls",
      "Unlimited projects",
      "SSO & user management",
      "SLA guarantee",
      "White-glove setup",
    ],
    cta: "Contact Sales",
    icon: Shield,
  },
];

type SubscriptionData = {
  subscription: {
    id: string;
    status: string;
    planId: string | null;
    stripePriceId: string | null;
    planName: string | null;
    currentPeriodEnd: string | null;
  } | null;
  hasSubscription: boolean;
};

const PLAN_PRICE_MAP: Record<string, string> = {
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "price_1TKR4nRZE8Whwvf0J1c7e0Vz",
  growth: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH || "price_1TKNcXRZE8Whwvf0LPFCoLvn",
};

export default function PricingPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [activeTab, setActiveTab] = useState<ProductTab>("hosted");

  useEffect(() => {
    if (session) {
      fetchSubscription();
    }
  }, [session]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData({
          subscription: data.subscription,
          hasSubscription: data.hasSubscription,
        });
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
    }
  };

  const getCurrentPlanId = () => {
    if (!subscriptionData?.subscription?.stripePriceId) return null;
    const priceId = subscriptionData.subscription.stripePriceId;
    for (const [planId, mappedPriceId] of Object.entries(PLAN_PRICE_MAP)) {
      if (mappedPriceId === priceId) return planId;
    }
    const planName = subscriptionData.subscription.planName?.toLowerCase();
    if (planName?.includes("growth")) return "growth";
    if (planName?.includes("pro")) return "pro";
    return null;
  };

  const isCurrentPlan = (planId: string) => {
    const currentPlanId = getCurrentPlanId();
    if (planId === "free" && !subscriptionData?.hasSubscription) return true;
    return currentPlanId === planId;
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubscribe = async (plan: (typeof HOSTED_PLANS)[number]) => {
    if (plan.id === "free") {
      if (!session) {
        router.push("/signin");
      } else {
        router.push("/dashboard");
      }
      return;
    }

    if (!session) {
      router.push("/signin?callbackUrl=/pricing");
      return;
    }

    if (!plan.priceId) {
      setError("Price ID not configured");
      return;
    }

    setLoading(plan.id);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: session.user.id,
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(null);
    }
  };

  const handleSDKLicensePurchase = async (planId: string) => {
    if (!session) {
      router.push("/signin?callbackUrl=/pricing");
      return;
    }

    if (planId === "sdk-free") {
      router.push("/docs/sdk/getting-started");
      return;
    }

    if (planId === "sdk-enterprise") {
      window.location.href = "mailto:sales@monetize-two.vercel.app?subject=SDK Enterprise License";
      return;
    }

    setLoading(planId);
    setError(null);

    // Find the plan to get its priceId
    const plan = SDK_PLANS.find((p) => p.id === planId);
    if (!plan || !plan.priceId) {
      setError("Invalid plan configuration");
      setLoading(null);
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: session.user.id,
          successUrl: `${window.location.origin}/checkout/success?type=sdk_license`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
          metadata: {
            type: "sdk_license",
            tier: planId.replace("sdk-", ""),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="glass fixed left-0 right-0 top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#1c1917] via-[#2d2a28] to-[#1c1917] shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#b8860b]/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/payment-credit.svg" 
                alt="Logo" 
                className="ml-1 h-7 w-7 object-contain [filter:sepia(35%)_saturate(1.4)_hue-rotate(350deg)_brightness(0.95)]"
              />
            </div>
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[#1c1917] transition-colors group-hover:text-[#b8860b]">
              @drewsepsi/billing
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#78716c] transition-all duration-200 hover:bg-[#f5f5f4] hover:text-[#1c1917]"
            >
              Home
            </Link>
            {session ? (
              <Link
                href="/dashboard"
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#78716c] transition-all duration-200 hover:bg-[#f5f5f4] hover:text-[#1c1917]"
              >
                Dashboard
              </Link>
            ) : (
              <Link href="/signin">
                <Button
                  variant="outline"
                  className="border-[#e7e5e4] px-5 py-2 text-sm font-medium text-[#1c1917] hover:bg-[#fafaf9]"
                >
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-32 pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-[#b8860b]/5 to-transparent" />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b8860b]/10 bg-[#b8860b]/8 px-4 py-1.5">
            <Zap className="h-3.5 w-3.5 text-[#b8860b]" />
            <span className="text-sm font-medium text-[#b8860b]">
              Simple, transparent pricing
            </span>
          </div>
          <h1 className="mb-4 font-[family-name:var(--font-display)] text-4xl text-[#1c1917] lg:text-5xl">
            Choose your product
          </h1>
          <p className="mx-auto max-w-xl text-lg text-[#78716c]">
            Two ways to add billing to your business. Pick what works for you.
          </p>
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="mx-auto max-w-6xl px-6 pb-8">
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-red-600">
            {error}
          </div>
        </div>
      )}

      {/* Product Selector Tabs */}
      <section className="mx-auto max-w-4xl px-6 pb-12">
        <div className="flex flex-col items-center gap-6">
          {/* Tab Buttons */}
          <div className="flex rounded-xl border border-[#e7e5e4] bg-[#fafaf9] p-1.5">
            <button
              onClick={() => setActiveTab("hosted")}
              className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 ${
                activeTab === "hosted"
                  ? "bg-white text-[#1c1917] shadow-sm"
                  : "text-[#78716c] hover:text-[#1c1917]"
              }`}
            >
              <Cloud className="h-4 w-4" />
              Drew Billing Cloud
            </button>
            <button
              onClick={() => setActiveTab("sdk")}
              className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all duration-200 ${
                activeTab === "sdk"
                  ? "bg-white text-[#1c1917] shadow-sm"
                  : "text-[#78716c] hover:text-[#1c1917]"
              }`}
            >
              <Download className="h-4 w-4" />
              Drew Billing SDK
            </button>
          </div>

          {/* Product Description */}
          <div className="text-center">
            {activeTab === "hosted" ? (
              <div className="space-y-2">
                <h2 className="font-[family-name:var(--font-display)] text-2xl text-[#1c1917]">
                  We host your billing
                </h2>
                <p className="mx-auto max-w-lg text-[#78716c]">
                  Get a complete billing dashboard and API without managing infrastructure. 
                  Perfect if you&apos;re building a SaaS and want billing handled for you.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h2 className="font-[family-name:var(--font-display)] text-2xl text-[#1c1917]">
                  Embed billing in your app
                </h2>
                <p className="mx-auto max-w-lg text-[#78716c]">
                  License our SDK to add billing capabilities to your own software. 
                  Perfect if you&apos;re building a platform, tool, or agency solution.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        {activeTab === "hosted" ? (
          <div className="grid gap-6 md:grid-cols-3">
            {HOSTED_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border bg-white p-6 shadow-subtle transition-all duration-200 ${
                  plan.popular
                    ? "border-[#b8860b]/30 shadow-elevated"
                    : "border-[#e7e5e4] hover:border-[#d6d3d1]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#b8860b] px-4 py-1 text-xs font-medium text-white">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#b8860b]/10">
                    {plan.id === "free" ? (
                      <Layers className="h-6 w-6 text-[#b8860b]" />
                    ) : plan.id === "pro" ? (
                      <Zap className="h-6 w-6 text-[#b8860b]" />
                    ) : (
                      <Shield className="h-6 w-6 text-[#b8860b]" />
                    )}
                  </div>
                  <h3 className="mb-1 font-[family-name:var(--font-display)] text-xl text-[#1c1917]">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-[#78716c]">{plan.description}</p>
                </div>

                <div className="mb-6">
                  {plan.price !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="font-[family-name:var(--font-display)] text-4xl text-[#1c1917]">
                        ${plan.price}
                      </span>
                      {plan.interval && (
                        <span className="text-[#78716c]">/{plan.interval}</span>
                      )}
                    </div>
                  ) : (
                    <span className="font-[family-name:var(--font-display)] text-2xl text-[#1c1917]">
                      Custom
                    </span>
                  )}
                </div>

                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2d5a3d]/10">
                        <Check className="h-3 w-3 text-[#2d5a3d]" strokeWidth={2.5} />
                      </div>
                      <span className="text-[#44403c]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan.id || sessionPending || isCurrentPlan(plan.id)}
                  className={`group relative w-full overflow-hidden rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
                    isCurrentPlan(plan.id)
                      ? "border border-[#e7e5e4] bg-[#f5f5f4] text-[#78716c]"
                      : plan.popular
                        ? "bg-[#b8860b] text-white shadow-md hover:bg-[#8b6914] hover:shadow-lg"
                        : plan.id === "free"
                          ? "border border-[#2d5a3d]/30 bg-[#2d5a3d]/5 text-[#2d5a3d] hover:bg-[#2d5a3d]/10 hover:shadow-md"
                          : "border border-[#635bff]/30 bg-[#635bff]/5 text-[#635bff] hover:bg-[#635bff]/10 hover:shadow-md"
                  }`}
                >
                  {loading === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </span>
                  ) : isCurrentPlan(plan.id) ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4" />
                      Current plan
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {plan.cta}
                      {plan.popular && <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />}
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-4">
            {SDK_PLANS.map((sdkPlan) => {
              const Icon = sdkPlan.icon;
              return (
                <div
                  key={sdkPlan.id}
                  className={`relative rounded-xl border bg-white p-5 transition-all duration-200 ${
                    sdkPlan.popular
                      ? "border-[#635bff]/30 shadow-md"
                      : "border-[#e7e5e4] hover:border-[#d6d3d1]"
                  }`}
                >
                  {sdkPlan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#635bff] px-3 py-0.5 text-xs font-medium text-white">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#635bff]/10">
                    <Icon className="h-5 w-5 text-[#635bff]" />
                  </div>

                  <h3 className="mb-1 font-[family-name:var(--font-display)] text-lg text-[#1c1917]">
                    {sdkPlan.name}
                  </h3>

                  <div className="mb-4">
                    <span className="font-[family-name:var(--font-display)] text-2xl text-[#1c1917]">
                      ${sdkPlan.price}
                    </span>
                    <span className="text-sm text-[#78716c]">/month</span>
                  </div>

                  <ul className="mb-6 space-y-2">
                    {sdkPlan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-[#2d5a3d]" />
                        <span className="text-[#44403c]">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSDKLicensePurchase(sdkPlan.id)}
                    disabled={loading === sdkPlan.id}
                    className={`w-full rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      sdkPlan.popular
                        ? "bg-[#635bff] text-white hover:bg-[#4f49cc]"
                        : "border border-[#e7e5e4] bg-white text-[#1c1917] hover:bg-[#f5f5f4]"
                    }`}
                  >
                    {loading === sdkPlan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      sdkPlan.cta
                    )}
                  </button>
                </div>
              );
            })}

            {/* Quick Start Box */}
            <div className="col-span-full mt-6 rounded-lg border border-[#e7e5e4] bg-white p-4">
              <div className="flex items-start gap-3">
                <Terminal className="mt-0.5 h-5 w-5 text-[#635bff]" />
                <div>
                  <h4 className="text-sm font-medium text-[#1c1917]">Quick Start with SDK</h4>
                  <code className="mt-2 block rounded bg-[#1c1917] px-3 py-2 text-xs text-[#e7e5e4]">
                    npm install @drewsepsi/billing-sdk<br />
                    <span className="text-[#78716c]"># Set your license key</span><br />
                    export DREW_BILLING_LICENSE_KEY=&quot;DREW-XXXX-XXXX-XXXX-XXXX&quot;
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trust Section */}
        <div className="mt-16 rounded-2xl border border-[#e7e5e4] bg-[#fafaf9] p-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex items-center justify-center md:justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/online-payment.svg" 
                alt="Secure online payment" 
                className="h-32 w-auto object-contain [filter:sepia(35%)_saturate(1.4)_hue-rotate(350deg)_brightness(0.95)]"
              />
            </div>
            <div className="grid gap-6">
              {[
                {
                  icon: Shield,
                  title: "Secure Payments",
                  desc: "PCI compliant, powered by Stripe",
                },
                {
                  icon: Zap,
                  title: "Instant Access",
                  desc: "Start using features immediately",
                },
                {
                  icon: Check,
                  title: "Cancel Anytime",
                  desc: "No long-term contracts",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                    <item.icon className="h-5 w-5 text-[#b8860b]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#1c1917]">{item.title}</h4>
                    <p className="text-sm text-[#78716c]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

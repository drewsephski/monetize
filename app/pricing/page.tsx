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
} from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    description: "For individuals getting started",
    price: 0,
    interval: null,
    features: [
      "Up to 100 customers",
      "Basic checkout",
      "Standard webhooks",
      "Community support",
      "Self-hosted only",
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
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "price_1TKNcWRZE8Whwvf0lLV0ckmi",
    features: [
      "Up to 10,000 customers",
      "Advanced analytics",
      "Priority support",
      "Team collaboration",
      "Custom integrations",
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
      "Advanced analytics",
      "Priority support",
      "API access",
      "0.5% transaction fee",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
];

type SubscriptionData = {
  subscription: {
    id: string;
    status: string;
    planId: string | null;
    planName: string | null;
    currentPeriodEnd: string | null;
  } | null;
  hasSubscription: boolean;
};

// Map plan IDs to price IDs for comparison
const PLAN_PRICE_MAP: Record<string, string> = {
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || "price_1TKNcWRZE8Whwvf0lLV0ckmi",
  growth: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH || "price_1TKNcXRZE8Whwvf0LPFCoLvn",
};

export default function PricingPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);

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
    if (!subscriptionData?.subscription?.planId) return null;
    // Map price ID back to plan ID
    const priceId = subscriptionData.subscription.planId;
    for (const [planId, mappedPriceId] of Object.entries(PLAN_PRICE_MAP)) {
      if (mappedPriceId === priceId) return planId;
    }
    // Fallback: try to match by plan name
    const planName = subscriptionData.subscription.planName?.toLowerCase();
    if (planName?.includes("growth")) return "growth";
    if (planName?.includes("pro")) return "pro";
    if (planName?.includes("enterprise")) return "enterprise";
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

  const handleSubscribe = async (plan: (typeof PLANS)[number]) => {
    if (plan.id === "free") {
      if (!session) {
        router.push("/signin");
      } else {
        router.push("/dashboard");
      }
      return;
    }

    if (plan.id === "enterprise") {
      window.location.href = "mailto:sales@example.com";
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

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="glass fixed left-0 right-0 top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#1c1917] via-[#2d2a28] to-[#1c1917] shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#b8860b]/20">
              <img 
                src="/payment-credit.svg" 
                alt="Logo" 
                className="ml-1 h-7 w-7 object-contain [filter:sepia(35%)_saturate(1.4)_hue-rotate(350deg)_brightness(0.95)]"
              />
            </div>
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[#1c1917] transition-colors group-hover:text-[#b8860b]">
              @drew/billing
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
            Choose your plan
          </h1>
          <p className="mx-auto max-w-xl text-lg text-[#78716c]">
            Start free and scale as you grow. No hidden fees, cancel anytime.
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

      {/* Pricing Grid */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
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
                    {plan.id === "free"}
                    {plan.id === "pro" && <Zap className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />}
                    {plan.id === "enterprise"}
                    {plan.cta}
                    {plan.popular && <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />}
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Trust Section */}
        <div className="mt-16 rounded-2xl border border-[#e7e5e4] bg-[#fafaf9] p-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex items-center justify-center md:justify-center">
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

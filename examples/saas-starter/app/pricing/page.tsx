"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Zap, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";

const plans = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for getting started",
    price: 0,
    interval: "month",
    features: [
      "1 team member",
      "100 API calls/month",
      "Basic analytics",
      "Email support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing businesses",
    price: 19,
    interval: "month",
    features: [
      "10 team members",
      "10,000 API calls/month",
      "Advanced analytics",
      "Priority support",
      "Custom integrations",
      "API access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations",
    price: 99,
    interval: "month",
    features: [
      "Unlimited team members",
      "Unlimited API calls",
      "Custom analytics",
      "24/7 phone support",
      "Dedicated account manager",
      "SLA guarantee",
      "Custom contracts",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSubscribe(planId: string) {
    setLoading(planId);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create checkout");
      }

      const { url } = await response.json();

      // In sandbox mode, show success toast
      if (process.env.NEXT_PUBLIC_BILLING_SANDBOX_MODE === "true") {
        toast.success("Sandbox mode: Checkout would redirect to " + url);
        setLoading(null);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Header */}
      <header className="border-b border-[#e7e5e4] bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit hover:opacity-80 transition-opacity">
            <Zap className="h-6 w-6 text-[#b8860b]" />
            <span className="font-bold text-xl text-[#1c1917]">SaaS Starter</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Back Link */}
        <div className="max-w-6xl mx-auto mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#78716c] hover:text-[#1c1917] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#b8860b]/10 px-3 py-1 text-xs font-medium text-[#b8860b] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl font-bold mb-4 text-[#1c1917]">Choose your plan</h1>
          <p className="text-xl text-[#78716c]">
            Start free, upgrade when you need. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-8 bg-white transition-all duration-200 hover:shadow-lg ${
                plan.popular
                  ? "border-[#b8860b]/50 shadow-lg shadow-[#b8860b]/5"
                  : "border-[#e7e5e4] hover:border-[#b8860b]/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#b8860b] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#1c1917]">{plan.name}</h3>
                <p className="text-sm text-[#78716c]">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-[#1c1917]">${plan.price}</span>
                <span className="text-[#78716c]">/{plan.interval}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-[#44403c]">
                    <Check className="h-4 w-4 text-[#22c55e] mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full h-11 ${
                  plan.popular
                    ? "bg-[#1c1917] hover:bg-[#292524] text-white"
                    : "border-[#e7e5e4] bg-white text-[#1c1917] hover:bg-[#fafaf9] hover:border-[#b8860b]/50"
                }`}
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
              >
                {loading === plan.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  plan.cta
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="text-center mt-16 space-y-4">
          <p className="text-sm text-[#78716c]">
            Secure payments powered by{" "}
            <span className="font-medium text-[#1c1917]">Stripe</span>
          </p>
          <p className="text-xs text-[#a8a29e]">
            30-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </main>
    </div>
  );
}

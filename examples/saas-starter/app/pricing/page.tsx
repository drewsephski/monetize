"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Zap, Loader2 } from "lucide-react";
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
      const response = await fetch("/api/checkout", {
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <Zap className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">SaaS Starter</span>
        </Link>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
          <p className="text-xl text-muted-foreground">
            Start free, upgrade when you need. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl border bg-card p-8 ${
                plan.popular ? "ring-2 ring-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
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
          <p className="text-sm text-muted-foreground">
            Secure payments powered by{" "}
            <span className="font-medium text-foreground">Stripe</span>
          </p>
          <p className="text-xs text-muted-foreground">
            30-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </main>
    </div>
  );
}

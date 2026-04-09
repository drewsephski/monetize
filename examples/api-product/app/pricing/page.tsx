"use client";

import { useState } from "react";
import { Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for testing",
    features: [
      "100 API calls/month",
      "10 requests/minute",
      "1 API key",
      "Email support",
    ],
    cta: "Get Started",
    priceId: "price_free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For growing applications",
    features: [
      "10,000 API calls/month",
      "100 requests/minute",
      "5 API keys",
      "Priority support",
      "Usage analytics",
    ],
    cta: "Subscribe",
    priceId: "price_pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For high-volume usage",
    features: [
      "100,000 API calls/month",
      "1,000 requests/minute",
      "Unlimited API keys",
      "24/7 support",
      "Custom contracts",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    priceId: "price_enterprise",
    popular: false,
  },
];

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: (typeof plans)[0]) => {
    setIsLoading(plan.name);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.priceId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout failed. Try sandbox mode: npm run billing:sandbox");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Usage-Based Pricing</h1>
          <p className="text-lg text-gray-600">
            Pay only for what you use. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border bg-white p-8 ${
                plan.popular ? "ring-2 ring-blue-600 shadow-xl" : "shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <Zap className="w-4 h-4" />
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-gray-500 mt-1">{plan.description}</p>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-gray-500">{plan.period}</span>
                )}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={isLoading === plan.name}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "border border-gray-300 hover:bg-gray-50"
                } ${isLoading === plan.name ? "opacity-50" : ""}`}
              >
                {isLoading === plan.name ? "Loading..." : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500">
            Need more?{" "}
            <a href="mailto:sales@example.com" className="text-blue-600 hover:underline">
              Contact us for custom pricing
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, Loader2, ArrowRight } from "lucide-react";

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
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: Plan) => {
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
    return `${formatter.format(price / 100)}/${interval === "year" ? "yr" : "mo"}`;
  };

  return (
    <div className={cn("grid gap-4 lg:gap-6 lg:grid-cols-3 items-start", className)}>
      {plans.map((plan) => {
        const isCurrentPlan = currentPlanId === plan.id;
        const isLoading = loadingPlan === plan.id;
        const isPopular = plan.popular;
        const isHovered = hoveredPlan === plan.id;

        return (
          <div
            key={plan.id}
            className={cn(
              "relative group transition-all duration-300 ease-out",
              isPopular && "lg:-mt-2 lg:mb-2"
            )}
            onMouseEnter={() => setHoveredPlan(plan.id)}
            onMouseLeave={() => setHoveredPlan(null)}
          >
            {/* Popular Badge */}
            {isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1c1917] px-3 py-1 text-xs font-medium text-white">
                  Most Popular
                </span>
              </div>
            )}

            <div
              className={cn(
                "relative overflow-hidden rounded-2xl border transition-all duration-300",
                isPopular
                  ? "border-[#1c1917] bg-[#1c1917] text-white"
                  : "border-[#e7e5e4] bg-white",
                isHovered && !isPopular && "border-[#b8860b] shadow-lg shadow-[#b8860b]/5",
                isHovered && isPopular && "shadow-2xl shadow-[#1c1917]/20"
              )}
            >
              {/* Plan Header */}
              <div className="p-6 pb-4">
                <div className="flex items-baseline justify-between mb-2">
                  <h3
                    className={cn(
                      "text-lg font-semibold tracking-tight",
                      isPopular ? "text-white" : "text-[#1c1917]"
                    )}
                  >
                    {plan.name}
                  </h3>
                  {isCurrentPlan && (
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        isPopular
                          ? "bg-white/20 text-white"
                          : "bg-[#22c55e]/10 text-[#15803d]"
                      )}
                    >
                      Active
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "text-sm",
                    isPopular ? "text-white/70" : "text-[#78716c]"
                  )}
                >
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="px-6 pb-6">
                <div className="flex items-baseline gap-1">
                  <span
                    className={cn(
                      "text-4xl font-bold tracking-tight",
                      isPopular ? "text-white" : "text-[#1c1917]"
                    )}
                  >
                    {plan.priceLabel || formatPrice(plan.price, plan.currency, plan.interval)}
                  </span>
                  {plan.price > 0 && (
                    <span
                      className={cn(
                        "text-sm",
                        isPopular ? "text-white/60" : "text-[#a8a29e]"
                      )}
                    >
                      /{plan.interval === "year" ? "year" : "month"}
                    </span>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              <div className="px-6 pb-6">
                <Button
                  className={cn(
                    "w-full h-11 text-sm font-medium transition-all duration-200 group/btn",
                    isPopular
                      ? "bg-white text-[#1c1917] hover:bg-white/90"
                      : "bg-[#1c1917] text-white hover:bg-[#292524]",
                    isCurrentPlan && "opacity-60 cursor-not-allowed hover:bg-[#1c1917]"
                  )}
                  disabled={isCurrentPlan || isLoading || plan.disabled}
                  onClick={() => handleSubscribe(plan)}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isCurrentPlan ? (
                    "Current Plan"
                  ) : (
                    <>
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </div>

              {/* Divider */}
              <div
                className={cn(
                  "h-px mx-6",
                  isPopular ? "bg-white/10" : "bg-[#e7e5e4]"
                )}
              />

              {/* Features */}
              <div className="p-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5",
                          isPopular ? "bg-white/20" : "bg-[#22c55e]/10"
                        )}
                      >
                        <Check
                          className={cn(
                            "h-3 w-3",
                            isPopular ? "text-white" : "text-[#15803d]"
                          )}
                          strokeWidth={2.5}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-sm leading-relaxed",
                          isPopular ? "text-white/80" : "text-[#57534e]"
                        )}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionGateProps {
  hasSubscription: boolean;
  isLoading?: boolean;
  requiredPlan?: string;
  children: React.ReactNode;
  onUpgrade?: () => Promise<void> | void;
}

export function SubscriptionGate({
  hasSubscription,
  isLoading,
  requiredPlan = "paid",
  children,
  onUpgrade,
}: SubscriptionGateProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (!onUpgrade) return;
    setIsUpgrading(true);
    try {
      await onUpgrade();
    } finally {
      setIsUpgrading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#e7e5e4] bg-[#fafaf9] p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-12 w-12 rounded-xl bg-[#e7e5e4] mx-auto" />
          <div className="h-6 w-32 bg-[#e7e5e4] mx-auto rounded" />
          <div className="h-4 w-48 bg-[#e7e5e4] mx-auto rounded" />
        </div>
      </div>
    );
  }

  if (hasSubscription) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#e7e5e4] bg-[#fafaf9] p-8">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#b8860b]/5 via-transparent to-transparent" />

      <div className="relative text-center">
        {/* Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1c1917] shadow-lg shadow-[#1c1917]/10">
          <Lock className="h-6 w-6 text-white" />
        </div>

        {/* Content */}
        <h3 className="mt-5 font-semibold text-xl text-[#1c1917] tracking-tight">
          Premium Feature
        </h3>
        <p className="mt-2 text-sm text-[#78716c] max-w-xs mx-auto">
          This feature requires a {requiredPlan} subscription to access
        </p>

        {/* CTA */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <Button
            onClick={handleUpgrade}
            loading={isUpgrading}
            className={cn(
              "h-11 px-6 text-sm font-medium transition-all duration-200 group",
              "bg-[#1c1917] text-white hover:bg-[#292524]"
            )}
          >
            <Sparkles className="mr-2 h-4 w-4 text-[#b8860b]" />
            <span>Upgrade to Unlock</span>
            <ArrowRight className="ml-2 h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </Button>
          <p className="text-xs text-[#a8a29e]">
            Get access to all premium features and priority support
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Timer, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrialBannerProps {
  trialEndsAt: string;
  onUpgrade: () => Promise<void> | void;
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
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await onUpgrade();
    } finally {
      setIsUpgrading(false);
    }
  };

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
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 transition-all duration-200",
        isUrgent
          ? "border-[#f59e0b]/30 bg-[#f59e0b]/5"
          : "border-[#b8860b]/20 bg-[#b8860b]/5",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Icon & Content */}
        <div className="flex items-start gap-4 flex-1">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              isUrgent ? "bg-[#f59e0b]/20" : "bg-[#b8860b]/20"
            )}
          >
            <Timer
              className={cn(
                "h-5 w-5",
                isUrgent ? "text-[#d97706]" : "text-[#b8860b]"
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className={cn(
                "font-semibold text-[#1c1917]",
                isUrgent ? "text-[#92400e]" : "text-[#1c1917]"
              )}
            >
              {daysLeft === 1
                ? "Trial ends tomorrow"
                : `Trial ends in ${daysLeft} days`}
            </h4>
            <p className="mt-0.5 text-sm text-[#78716c]">
              {isUrgent
                ? "Don't lose access to premium features. Upgrade now to keep your subscription active."
                : "You're on a trial. Upgrade anytime to continue using all features."}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3 sm:shrink-0">
          <Button
            size="sm"
            onClick={handleUpgrade}
            loading={isUpgrading}
            className={cn(
              "h-10 sm:h-9 px-4 text-sm font-medium transition-all duration-200 group touch-target",
              isUrgent
                ? "bg-[#f59e0b] text-white hover:bg-[#d97706]"
                : "bg-[#1c1917] text-white hover:bg-[#292524]"
            )}
          >
            <span>Upgrade Now</span>
            <ArrowRight className="ml-1.5 h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden sm:inline" />
          </Button>
          {onDismiss && (
            <button
              onClick={handleDismiss}
              className="p-2 sm:p-2 rounded-lg text-[#a8a29e] hover:text-[#57534e] hover:bg-[#e7e5e4]/50 transition-all touch-target min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

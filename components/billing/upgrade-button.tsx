"use client";

import { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpgradeButtonProps extends Omit<ButtonProps, "onClick"> {
  userId: string;
  currentPlan: string;
  targetPlan: "pro" | "enterprise";
  onUpgrade: (targetPlan: string) => Promise<void>;
  showCurrentLabel?: boolean;
}

export function UpgradeButton({
  currentPlan,
  targetPlan,
  onUpgrade,
  showCurrentLabel = true,
  children,
  className,
  variant = "default",
  ...props
}: UpgradeButtonProps) {
  // Note: userId is available in props for parent tracking/analytics
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
      <Button
        disabled
        variant="outline"
        className={cn(
          "h-11 px-4 border-[#e7e5e4] bg-[#fafaf9] text-[#a8a29e] cursor-not-allowed touch-target",
          className
        )}
        {...props}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Current Plan
      </Button>
    );
  }

  const targetPlanLabel = targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1);

  return (
    <Button
      variant={variant}
      disabled={isLoading || isCurrent}
      onClick={handleUpgrade}
      className={cn(
        "h-11 px-4 text-sm font-medium transition-all duration-200 group touch-target",
        variant === "default" && [
          "bg-[#1c1917] text-white hover:bg-[#292524]",
        ],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4 text-[#b8860b]" />
          <span>{children || `Upgrade to ${targetPlanLabel}`}</span>
          <ArrowRight className="ml-2 h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden sm:inline" />
        </>
      )}
    </Button>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Timer, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrialBannerProps {
  trialEndsAt: string;
  onUpgrade: () => void;
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
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const endDate = new Date(trialEndsAt);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysLeft(Math.max(0, diffDays));
  }, [trialEndsAt]);

  if (dismissed || daysLeft <= 0) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const isUrgent = daysLeft <= 3;

  return (
    <Alert
      className={cn(
        "relative",
        isUrgent
          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
          : "border-primary/20 bg-primary/5",
        className
      )}
    >
      <Timer
        className={cn("h-4 w-4", isUrgent ? "text-amber-600" : "text-primary")}
      />
      <AlertTitle
        className={cn(isUrgent ? "text-amber-800" : "text-primary")}
      >
        {daysLeft === 1
          ? "Trial ends tomorrow"
          : `Trial ends in ${daysLeft} days`}
      </AlertTitle>
      <AlertDescription className="flex items-center gap-4">
        <span className="flex-1">
          {isUrgent
            ? "Don't lose access to premium features. Upgrade now to keep your subscription active."
            : "You're on a trial. Upgrade anytime to continue using all features."}
        </span>
        <Button
          size="sm"
          variant={isUrgent ? "default" : "outline"}
          onClick={onUpgrade}
          className={cn(isUrgent && "bg-amber-600 hover:bg-amber-700")}
        >
          Upgrade Now
        </Button>
      </AlertDescription>
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-sm p-1 opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </Alert>
  );
}

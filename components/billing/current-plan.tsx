"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, Sparkles, Zap, Crown } from "lucide-react";

interface CurrentPlanProps {
  plan: string;
  status?: "active" | "trialing" | "canceled" | "past_due";
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  features?: string[];
  className?: string;
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <Zap className="h-5 w-5" />,
  pro: <Sparkles className="h-5 w-5" />,
  enterprise: <Crown className="h-5 w-5" />,
};

const PLAN_COLORS: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  pro: "bg-primary/10 text-primary",
  enterprise: "bg-amber-500/10 text-amber-600",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/10 text-green-600",
  trialing: "bg-blue-500/10 text-blue-600",
  canceled: "bg-destructive/10 text-destructive",
  past_due: "bg-amber-500/10 text-amber-600",
};

export function CurrentPlanBadge({
  plan,
  status = "active",
  trialEndsAt,
  currentPeriodEnd,
  features,
  className,
}: CurrentPlanProps) {
  const planLower = plan.toLowerCase();
  const isTrial = status === "trialing";

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-lg",
                PLAN_COLORS[planLower] || PLAN_COLORS.free
              )}
            >
              {PLAN_ICONS[planLower] || PLAN_ICONS.free}
            </div>
            <div>
              <h3 className="font-semibold text-lg capitalize">{plan}</h3>
              <Badge variant="secondary" className={STATUS_COLORS[status]}>
                {isTrial ? "Trial" : status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        {isTrial && trialEndsAt && (
          <p className="mt-4 text-sm text-muted-foreground">
            Trial ends on <strong>{formatDate(trialEndsAt)}</strong>
          </p>
        )}

        {!isTrial && currentPeriodEnd && (
          <p className="mt-4 text-sm text-muted-foreground">
            Renews on <strong>{formatDate(currentPeriodEnd)}</strong>
          </p>
        )}

        {features && features.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-medium">Included features:</h4>
            <ul className="space-y-1">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

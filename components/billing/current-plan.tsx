"use client";

import { cn } from "@/lib/utils";
import { Check, Sparkles, Zap, Crown, Calendar } from "lucide-react";

interface CurrentPlanProps {
  plan: string;
  status?: "active" | "trialing" | "canceled" | "past_due";
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  features?: string[];
  className?: string;
}

const PLAN_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  free: {
    bg: "bg-[#fafaf9]",
    border: "border-[#e7e5e4]",
    icon: "text-[#78716c]",
  },
  pro: {
    bg: "bg-[#b8860b]/5",
    border: "border-[#b8860b]/30",
    icon: "text-[#b8860b]",
  },
  enterprise: {
    bg: "bg-[#1c1917]",
    border: "border-[#1c1917]",
    icon: "text-white",
  },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-[#22c55e]/10", text: "text-[#15803d]", label: "Active" },
  trialing: { bg: "bg-[#3b82f6]/10", text: "text-[#2563eb]", label: "Trial" },
  canceled: { bg: "bg-[#ef4444]/10", text: "text-[#dc2626]", label: "Canceled" },
  past_due: { bg: "bg-[#f59e0b]/10", text: "text-[#d97706]", label: "Past Due" },
};

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <Zap className="h-5 w-5" />,
  pro: <Sparkles className="h-5 w-5" />,
  enterprise: <Crown className="h-5 w-5" />,
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
  const isEnterprise = planLower === "enterprise";
  const planStyle = PLAN_STYLES[planLower] || PLAN_STYLES.free;
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.active;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border transition-all duration-200",
        planStyle.bg,
        planStyle.border,
        isEnterprise && "text-white",
        className
      )}
    >
      <div className="p-6">
        {/* Plan Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                isEnterprise ? "bg-white/10" : "bg-white",
                "shadow-sm"
              )}
            >
              <span className={planStyle.icon}>
                {PLAN_ICONS[planLower] || PLAN_ICONS.free}
              </span>
            </div>
            <div>
              <h3
                className={cn(
                  "font-semibold text-lg capitalize tracking-tight",
                  isEnterprise ? "text-white" : "text-[#1c1917]"
                )}
              >
                {plan}
              </h3>
              <span
                className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  statusStyle.bg,
                  statusStyle.text
                )}
              >
                {isTrial ? "Trial" : statusStyle.label}
              </span>
            </div>
          </div>
        </div>

        {/* Date Info */}
        {(trialEndsAt || currentPeriodEnd) && (
          <div className="flex items-center gap-2 mb-6">
            <Calendar
              className={cn(
                "h-4 w-4",
                isEnterprise ? "text-white/60" : "text-[#a8a29e]"
              )}
            />
            <span
              className={cn(
                "text-sm",
                isEnterprise ? "text-white/70" : "text-[#57534e]"
              )}
            >
              {isTrial && trialEndsAt
                ? `Trial ends on ${formatDate(trialEndsAt)}`
                : currentPeriodEnd
                ? `Renews on ${formatDate(currentPeriodEnd)}`
                : ""}
            </span>
          </div>
        )}

        {/* Divider */}
        {features && features.length > 0 && (
          <div
            className={cn(
              "h-px mb-6",
              isEnterprise ? "bg-white/10" : "bg-[#e7e5e4]"
            )}
          />
        )}

        {/* Features */}
        {features && features.length > 0 && (
          <div className="space-y-3">
            <h4
              className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                isEnterprise ? "text-white/50" : "text-[#a8a29e]"
              )}
            >
              Included Features
            </h4>
            <ul className="space-y-2.5">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5",
                      isEnterprise ? "bg-white/20" : "bg-[#22c55e]/10"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-3 w-3",
                        isEnterprise ? "text-white" : "text-[#15803d]"
                      )}
                      strokeWidth={2.5}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-sm leading-relaxed",
                      isEnterprise ? "text-white/80" : "text-[#57534e]"
                    )}
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, TrendingUp } from "lucide-react";

interface UsageMeterProps {
  userId: string;
  feature: string;
  limit: number;
  current?: number;
  label?: string;
  onFetchUsage?: (userId: string, feature: string) => Promise<number>;
  refreshInterval?: number;
  className?: string;
}

export function UsageMeter({
  userId,
  feature,
  limit,
  current: initialCurrent,
  label,
  onFetchUsage,
  refreshInterval = 30000,
  className,
}: UsageMeterProps) {
  const [current, setCurrent] = useState(initialCurrent || 0);
  const [isLoading, setIsLoading] = useState(!initialCurrent && !!onFetchUsage);

  useEffect(() => {
    if (!onFetchUsage || initialCurrent !== undefined) {
      return;
    }

    const fetchUsage = async () => {
      try {
        const usage = await onFetchUsage(userId, feature);
        setCurrent(usage);
      } catch (error) {
        console.error("Failed to fetch usage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsage();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchUsage, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [userId, feature, onFetchUsage, refreshInterval, initialCurrent]);

  const percentage = Math.min((current / limit) * 100, 100);
  const isNearLimit = percentage >= 80 && percentage < 100;
  const isOverLimit = percentage >= 100;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  // Determine progress bar color based on usage
  const getProgressColor = () => {
    if (isOverLimit) return "bg-[#ef4444]";
    if (isNearLimit) return "bg-[#f59e0b]";
    if (percentage >= 60) return "bg-[#b8860b]";
    return "bg-[#22c55e]";
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="h-2 bg-[#e7e5e4] rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-[#e7e5e4] bg-white p-5 transition-all duration-200",
        isNearLimit && "border-[#f59e0b]/30 bg-[#f59e0b]/5",
        isOverLimit && "border-[#ef4444]/30 bg-[#ef4444]/5",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#a8a29e]" />
          <span className="font-medium text-[#1c1917]">{label || feature}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#1c1917]">
            {formatNumber(current)}
          </span>
          <span className="text-sm text-[#a8a29e]">/ {formatNumber(limit)}</span>
          {(isNearLimit || isOverLimit) && (
            <AlertCircle
              className={cn(
                "h-4 w-4",
                isOverLimit ? "text-[#ef4444]" : "text-[#f59e0b]"
              )}
            />
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-[#e7e5e4] rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            getProgressColor()
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-[#a8a29e]">{percentage.toFixed(0)}% used</span>
        {isNearLimit && !isOverLimit && (
          <span className="text-xs font-medium text-[#d97706]">
            Approaching limit
          </span>
        )}
        {isOverLimit && (
          <span className="text-xs font-medium text-[#dc2626]">
            Limit exceeded
          </span>
        )}
      </div>
    </div>
  );
}

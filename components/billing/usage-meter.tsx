"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

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

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="h-2 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label || feature}</span>
        <span className="text-muted-foreground">
          {formatNumber(current)} / {formatNumber(limit)}
        </span>
      </div>

      <div className="relative">
        <Progress
          value={percentage}
          className={cn(
            isOverLimit && "bg-destructive",
            isNearLimit && "bg-amber-500"
          )}
        />
        {(isNearLimit || isOverLimit) && (
          <div className="absolute -right-1 -top-1">
            <AlertCircle
              className={cn(
                "h-4 w-4",
                isOverLimit ? "text-destructive" : "text-amber-500"
              )}
            />
          </div>
        )}
      </div>

      {isNearLimit && !isOverLimit && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Approaching limit - consider upgrading
        </p>
      )}
      {isOverLimit && (
        <p className="text-xs text-destructive">
          Limit exceeded - upgrade required
        </p>
      )}
    </div>
  );
}

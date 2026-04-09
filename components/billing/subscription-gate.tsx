"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";

interface SubscriptionGateProps {
  hasSubscription: boolean;
  isLoading?: boolean;
  requiredPlan?: string;
  children: React.ReactNode;
  onUpgrade?: () => void;
}

export function SubscriptionGate({
  hasSubscription,
  isLoading,
  requiredPlan = "paid",
  children,
  onUpgrade,
}: SubscriptionGateProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-muted rounded-lg" />
      </div>
    );
  }

  if (hasSubscription) {
    return <>{children}</>;
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="mt-4">Premium Feature</CardTitle>
        <CardDescription>
          This feature requires a {requiredPlan} subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <Button onClick={onUpgrade} className="gap-2">
          <Sparkles className="h-4 w-4" />
          Upgrade to Unlock
        </Button>
        <p className="text-xs text-muted-foreground">
          Get access to all premium features and priority support
        </p>
      </CardContent>
    </Card>
  );
}

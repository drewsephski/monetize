"use client";

import { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BillingPortalButtonProps extends Omit<ButtonProps, "onClick"> {
  userId: string;
  returnUrl?: string;
  onOpenPortal: (userId: string, returnUrl?: string) => Promise<string>;
  children?: React.ReactNode;
}

export function BillingPortalButton({
  userId,
  returnUrl,
  onOpenPortal,
  children,
  className,
  variant = "outline",
  ...props
}: BillingPortalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const url = await onOpenPortal(userId, returnUrl || window.location.href);
      window.location.href = url;
    } catch (error) {
      console.error("Failed to open billing portal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          {children || "Manage Billing"}
        </>
      )}
    </Button>
  );
}

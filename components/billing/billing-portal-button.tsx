"use client";

import { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { CreditCard, Loader2, ArrowUpRight } from "lucide-react";
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
      className={cn(
        "h-11 px-4 text-sm font-medium transition-all duration-200 group",
        variant === "outline" && [
          "border-[#e7e5e4] bg-white text-[#1c1917]",
          "hover:border-[#b8860b] hover:bg-[#fafaf9]"
        ],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4 text-[#a8a29e] group-hover:text-[#b8860b] transition-colors" />
          <span>{children || "Manage Billing"}</span>
          <ArrowUpRight className="ml-2 h-3.5 w-3.5 text-[#a8a29e] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </>
      )}
    </Button>
  );
}

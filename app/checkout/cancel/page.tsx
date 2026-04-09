"use client";

import Link from "next/link";
import { XCircle, Sparkles, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafaf9] px-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f59e0b]/10">
            <XCircle className="h-10 w-10 text-[#d97706]" />
          </div>
        </div>

        <div className="mb-4 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#b8860b]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-[family-name:var(--font-display)] text-xl font-medium text-[#1c1917]">
            billing
          </span>
        </div>

        <h1 className="mb-3 font-[family-name:var(--font-display)] text-3xl text-[#1c1917]">
          Checkout Cancelled
        </h1>

        <p className="mb-8 text-[#78716c]">
          No worries! You can upgrade anytime. Your account is still on the Free plan.
        </p>

        <div className="space-y-3">
          <Link href="/pricing">
            <Button className="w-full bg-[#b8860b] py-3 text-base font-medium text-white hover:bg-[#8b6914]">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </Link>

          <Link href="/">
            <Button
              variant="outline"
              className="w-full border-[#e7e5e4] py-3 text-base font-medium text-[#1c1917] hover:bg-[#fafaf9]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

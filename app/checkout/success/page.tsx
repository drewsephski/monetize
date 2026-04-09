"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      router.push("/dashboard?success=true");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafaf9] px-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#2d5a3d]/10">
            <CheckCircle className="h-10 w-10 text-[#2d5a3d]" />
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
          Welcome to Pro!
        </h1>

        <p className="mb-8 text-[#78716c]">
          Your subscription is now active. You now have access to all Pro features.
        </p>

        <div className="space-y-3">
          <Link href="/dashboard">
            <Button className="w-full bg-[#b8860b] py-3 text-base font-medium text-white hover:bg-[#8b6914]">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <p className="text-sm text-[#78716c]">
            Redirecting automatically in 5 seconds...
          </p>
        </div>
      </div>
    </main>
  );
}

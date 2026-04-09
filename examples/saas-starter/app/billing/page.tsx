"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Zap,
  CreditCard,
  BarChart3,
  Loader2,
  Crown,
  ArrowLeft,
  Receipt,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";

interface SubscriptionData {
  plan: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  currentPeriodEnd: string;
  trialEndsAt?: string;
  features: string[];
  usage: {
    apiCalls: { used: number; limit: number };
    storage: { used: number; limit: number };
    team: { used: number; limit: number };
  };
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const userId = "demo-user-" + Math.random().toString(36).slice(2);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch("/api/billing/subscription");
        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        }
      } catch (error) {
        console.error("Failed to fetch subscription:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, []);

  const openBillingPortal = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          returnUrl: `${window.location.origin}/billing`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to open billing portal");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to open billing portal");
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#b8860b]" />
      </div>
    );
  }

  const planColors: Record<string, string> = {
    free: "bg-[#78716c]",
    pro: "bg-[#b8860b]",
    enterprise: "bg-[#1c1917]",
  };

  const statusColors: Record<string, string> = {
    active: "bg-[#22c55e]/10 text-[#15803d]",
    trialing: "bg-[#3b82f6]/10 text-[#1d4ed8]",
    canceled: "bg-[#ef4444]/10 text-[#dc2626]",
    past_due: "bg-[#f59e0b]/10 text-[#d97706]",
  };

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Header */}
      <header className="border-b border-[#e7e5e4] bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Zap className="h-6 w-6 text-[#b8860b]" />
              <span className="font-bold text-xl text-[#1c1917]">SaaS Starter</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#78716c]">user@example.com</span>
              <Button
                variant="outline"
                size="sm"
                className="border-[#e7e5e4] text-[#1c1917] hover:bg-[#fafaf9]"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-[#78716c] hover:text-[#1c1917] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1c1917] tracking-tight mb-2">
            Billing & Subscription
          </h1>
          <p className="text-[#78716c]">
            Manage your plan, payment methods, and billing history
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Plan Card */}
            <Card className="border-[#e7e5e4] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1c1917]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#b8860b]/10">
                    <Crown className="h-4 w-4 text-[#b8860b]" />
                  </div>
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl ${planColors[subscription?.plan || "free"]} flex items-center justify-center`}>
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#1c1917] capitalize">
                      {subscription?.plan || "Free"}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[subscription?.status || "active"]}`}>
                      {subscription?.status === "trialing" ? "Trial" : subscription?.status || "Active"}
                    </span>
                  </div>
                </div>

                {subscription?.currentPeriodEnd && (
                  <div className="flex items-center justify-between py-3 border-t border-[#f5f5f4]">
                    <span className="text-sm text-[#78716c]">Next billing date</span>
                    <span className="text-sm font-medium text-[#1c1917]">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {subscription?.trialEndsAt && (
                  <div className="rounded-xl bg-[#3b82f6]/5 border border-[#3b82f6]/20 p-4">
                    <p className="text-sm text-[#1d4ed8]">
                      Your free trial ends on{" "}
                      <span className="font-medium">
                        {new Date(subscription.trialEndsAt).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage Card */}
            <Card className="border-[#e7e5e4] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1c1917]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22c55e]/10">
                    <BarChart3 className="h-4 w-4 text-[#15803d]" />
                  </div>
                  Usage This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* API Calls */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#44403c] font-medium">API Calls</span>
                    <span className="text-[#78716c]">
                      {subscription?.usage?.apiCalls?.used || 0}{" "}
                      <span className="text-[#a8a29e]">/</span>{" "}
                      {subscription?.usage?.apiCalls?.limit || 100}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#f5f5f4] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#22c55e] transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          ((subscription?.usage?.apiCalls?.used || 0) /
                            (subscription?.usage?.apiCalls?.limit || 100)) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Storage */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#44403c] font-medium">Storage</span>
                    <span className="text-[#78716c]">
                      {subscription?.usage?.storage?.used || 0} MB{" "}
                      <span className="text-[#a8a29e]">/</span>{" "}
                      {subscription?.usage?.storage?.limit || 100} MB
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#f5f5f4] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#3b82f6] transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          ((subscription?.usage?.storage?.used || 0) /
                            (subscription?.usage?.storage?.limit || 100)) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Team Members */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#44403c] font-medium">Team Members</span>
                    <span className="text-[#78716c]">
                      {subscription?.usage?.team?.used || 1}{" "}
                      <span className="text-[#a8a29e]">/</span>{" "}
                      {subscription?.usage?.team?.limit || 1}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#f5f5f4] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#b8860b] transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          ((subscription?.usage?.team?.used || 1) /
                            (subscription?.usage?.team?.limit || 1)) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Billing Portal Card */}
            <Card className="border-[#e7e5e4] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1c1917]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1c1917]/10">
                    <Receipt className="h-4 w-4 text-[#1c1917]" />
                  </div>
                  Billing Portal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-[#78716c]">
                  Manage your payment methods, view invoices, and update billing information through Stripe&apos;s secure customer portal.
                </p>
                <Button
                  onClick={openBillingPortal}
                  disabled={portalLoading}
                  className="w-full h-11 bg-white border border-[#e7e5e4] text-[#1c1917] hover:bg-[#fafaf9] hover:border-[#b8860b]/50 group"
                >
                  {portalLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4 text-[#a8a29e] group-hover:text-[#b8860b] transition-colors" />
                      Manage Billing
                      <ArrowUpRight className="ml-2 h-3.5 w-3.5 text-[#a8a29e] group-hover:text-[#b8860b] transition-all" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Upgrade Card */}
            <Card className="border-[#e7e5e4] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#1c1917]">Want to upgrade?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-[#78716c]">
                  Compare plans and upgrade to unlock more features.
                </p>
                <Link href="/pricing">
                  <Button className="w-full h-11 bg-[#1c1917] hover:bg-[#292524] text-white">
                    View Plans
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Features Card */}
            <Card className="border-[#e7e5e4] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#1c1917]">Included Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(subscription?.features || [
                    "1 user",
                    "100 API calls/month",
                    "Basic support",
                  ]).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-[#44403c]">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#b8860b]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

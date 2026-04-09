"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Zap,
  Play,
  ArrowLeft,
  Loader2,
  TrendingUp,
  CreditCard,
  Receipt,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface SubscriptionData {
  plan: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  features: string[];
  usage: {
    apiCalls: { used: number; limit: number };
  };
}

export default function DemoPage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [apiCalls, setApiCalls] = useState(245);
  const [result, setResult] = useState<string>("");
  const userId = "demo-user-" + Math.random().toString(36).slice(2);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch("/api/billing/subscription");
        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
          setApiCalls(data.usage?.apiCalls?.used || 245);
        }
      } catch (error) {
        console.error("Failed to fetch subscription:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, []);

  const handleSimulateAPICall = async () => {
    setActionLoading("api");
    setTimeout(() => {
      const newCalls = Math.min(apiCalls + 50, subscription?.usage?.apiCalls?.limit || 10000);
      setApiCalls(newCalls);
      setResult(`Simulated API call recorded. New usage: ${newCalls} / ${subscription?.usage?.apiCalls?.limit || 10000}`);
      setActionLoading(null);
    }, 500);
  };

  const handleCheckSubscription = async () => {
    setActionLoading("subscription");
    try {
      const response = await fetch("/api/billing/subscription");
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : "Failed to fetch"}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenPortal = async () => {
    setActionLoading("portal");
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          returnUrl: `${window.location.origin}/demo`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to open portal");
      }

      const { url } = await response.json();
      setResult(`Portal URL: ${url}`);
      toast.success("Portal session created!");
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : "Failed to open portal"}`);
      toast.error(error instanceof Error ? error.message : "Failed to open portal");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#b8860b]" />
      </div>
    );
  }

  const usageLimit = subscription?.usage?.apiCalls?.limit || 10000;
  const usagePercent = Math.min((apiCalls / usageLimit) * 100, 100);

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
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#78716c] hover:text-[#1c1917] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#3b82f6]/10 px-3 py-1 text-xs font-medium text-[#2563eb] mb-4">
            <Play className="h-3.5 w-3.5" />
            Interactive Demo
          </div>
          <h1 className="text-3xl font-bold text-[#1c1917] tracking-tight mb-2">
            Usage & Billing Demo
          </h1>
          <p className="text-[#78716c]">
            Explore the billing system and test different features
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Demo Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Usage Meter Demo */}
            <Card className="border-[#e7e5e4] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1c1917]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22c55e]/10">
                    <TrendingUp className="h-4 w-4 text-[#15803d]" />
                  </div>
                  Live Usage Meter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#44403c] font-medium">API Calls</span>
                    <span className="text-[#78716c]">
                      {apiCalls.toLocaleString()}{" "}
                      <span className="text-[#a8a29e]">/</span>{" "}
                      {usageLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-[#f5f5f4] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        usagePercent > 90
                          ? "bg-[#ef4444]"
                          : usagePercent > 75
                          ? "bg-[#f59e0b]"
                          : "bg-[#22c55e]"
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#78716c]">
                    {usagePercent > 90
                      ? "Warning: Approaching limit!"
                      : usagePercent > 75
                      ? "Getting close to your limit"
                      : "Healthy usage levels"}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={handleSimulateAPICall}
                    disabled={actionLoading === "api"}
                    className="bg-[#1c1917] hover:bg-[#292524] text-white"
                  >
                    {actionLoading === "api" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Simulate +50 API Calls"
                    )}
                  </Button>
                  <Button
                    onClick={() => setApiCalls(Math.max(apiCalls - 50, 0))}
                    variant="outline"
                    className="border-[#e7e5e4] text-[#1c1917] hover:bg-[#fafaf9]"
                  >
                    -50 Calls
                  </Button>
                  <Button
                    onClick={() => setApiCalls(Math.floor(usageLimit * 0.95))}
                    variant="outline"
                    className="border-[#f59e0b]/50 text-[#d97706] hover:bg-[#f59e0b]/10"
                  >
                    Near Limit (95%)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Grid */}
            <Card className="border-[#e7e5e4] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#1c1917]">SDK Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    onClick={handleCheckSubscription}
                    disabled={actionLoading !== null}
                    className="group relative flex items-start gap-4 rounded-xl border border-[#e7e5e4] bg-white p-5 text-left transition-all duration-200 hover:border-[#b8860b]/30 hover:shadow-sm disabled:opacity-50"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e7e5e4] bg-[#fafaf9] shadow-sm group-hover:border-[#b8860b]/25">
                      {actionLoading === "subscription" ? (
                        <Loader2 className="h-5 w-5 animate-spin text-[#b8860b]" />
                      ) : (
                        <Receipt className="h-5 w-5 text-[#b8860b]" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-[#1c1917] group-hover:text-[#b8860b] transition-colors">
                        Get Subscription
                      </div>
                      <div className="text-sm text-[#78716c]">
                        {actionLoading === "subscription" ? "Loading..." : "Check subscription status"}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleOpenPortal}
                    disabled={actionLoading !== null}
                    className="group relative flex items-start gap-4 rounded-xl border border-[#e7e5e4] bg-white p-5 text-left transition-all duration-200 hover:border-[#b8860b]/30 hover:shadow-sm disabled:opacity-50"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e7e5e4] bg-[#fafaf9] shadow-sm group-hover:border-[#b8860b]/25">
                      {actionLoading === "portal" ? (
                        <Loader2 className="h-5 w-5 animate-spin text-[#b8860b]" />
                      ) : (
                        <CreditCard className="h-5 w-5 text-[#b8860b]" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-[#1c1917] group-hover:text-[#b8860b] transition-colors">
                        Customer Portal
                      </div>
                      <div className="text-sm text-[#78716c]">
                        {actionLoading === "portal" ? "Loading..." : "Manage billing"}
                      </div>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Result Panel */}
            {result && (
              <Card className="border-[#e7e5e4] bg-[#1c1917] shadow-sm overflow-hidden">
                <CardHeader className="border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#4ade80]" />
                      <span className="text-sm font-medium text-white">API Response</span>
                    </div>
                    <button
                      onClick={() => setResult("")}
                      className="text-xs text-[#a8a29e] hover:text-white transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-64 overflow-auto p-5">
                    <pre className="font-mono text-sm leading-relaxed text-[#f8fafc]">
                      {result}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Plan */}
            <Card className="border-[#e7e5e4] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1c1917]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#b8860b]/10">
                    <Sparkles className="h-4 w-4 text-[#b8860b]" />
                  </div>
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[#1c1917] mb-4">
                    <Sparkles className="h-8 w-8 text-[#b8860b]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1c1917] capitalize">
                    {subscription?.plan || "Free"}
                  </h3>
                  <span className="inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-medium bg-[#22c55e]/10 text-[#15803d]">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {subscription?.status === "trialing" ? "Trial" : "Active"}
                  </span>
                </div>

                <div className="border-t border-[#f5f5f4] pt-4">
                  <h4 className="text-sm font-medium text-[#1c1917] mb-3">Features</h4>
                  <ul className="space-y-2">
                    {(subscription?.features || [
                      "1,000 API calls/mo",
                      "1 project",
                      "Community support",
                    ]).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-[#44403c]">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Feature Gate Demo */}
            <Card className="border-[#e7e5e4] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1c1917]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ef4444]/10">
                    <Lock className="h-4 w-4 text-[#dc2626]" />
                  </div>
                  Feature Gate
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscription?.plan === "free" ? (
                  <div className="rounded-xl border border-[#e7e5e4] bg-[#fafaf9] p-4 text-center">
                    <Lock className="h-8 w-8 text-[#a8a29e] mx-auto mb-3" />
                    <p className="text-sm text-[#78716c] mb-3">
                      This feature is only available on Pro and Enterprise plans.
                    </p>
                    <Link href="/pricing">
                      <Button size="sm" className="bg-[#b8860b] hover:bg-[#9a7209] text-white">
                        Upgrade to Unlock
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[#22c55e]/30 bg-[#22c55e]/5 p-4">
                    <CheckCircle2 className="h-8 w-8 text-[#22c55e] mx-auto mb-3" />
                    <p className="text-sm text-[#15803d] font-medium text-center">
                      Premium feature unlocked!
                    </p>
                    <p className="text-xs text-[#57534e] text-center mt-1">
                      You have access to this feature with your {subscription?.plan} plan.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

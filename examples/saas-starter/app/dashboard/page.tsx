"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Zap,
  CreditCard,
  BarChart3,
  Users,
  Loader2,
  Crown,
} from "lucide-react";

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

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">SaaS Starter</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">user@example.com</span>
            <Button variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome */}
            <div>
              <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your subscription and view usage
              </p>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold capitalize">
                      {subscription?.plan || "Free"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    API Calls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {subscription?.usage?.apiCalls?.used || 0}
                    <span className="text-sm text-muted-foreground font-normal">
                      /{subscription?.usage?.apiCalls?.limit || 100}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Team Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {subscription?.usage?.team?.used || 1}
                      <span className="text-sm text-muted-foreground font-normal">
                        /{subscription?.usage?.team?.limit || 1}
                      </span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Usage This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>API Calls</span>
                    <span className="text-muted-foreground">
                      {subscription?.usage?.apiCalls?.used || 0} /{" "}
                      {subscription?.usage?.apiCalls?.limit || 100}
                    </span>
                  </div>
                  <Progress
                    value={
                      ((subscription?.usage?.apiCalls?.used || 0) /
                        (subscription?.usage?.apiCalls?.limit || 100)) *
                      100
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage</span>
                    <span className="text-muted-foreground">
                      {subscription?.usage?.storage?.used || 0} MB /{" "}
                      {subscription?.usage?.storage?.limit || 100} MB
                    </span>
                  </div>
                  <Progress
                    value={
                      ((subscription?.usage?.storage?.used || 0) /
                        (subscription?.usage?.storage?.limit || 100)) *
                      100
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      subscription?.status === "active"
                        ? "bg-green-100 text-green-800"
                        : subscription?.status === "trialing"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {subscription?.status || "Free"}
                  </span>
                </div>

                {subscription?.currentPeriodEnd && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Renews</span>
                    <span className="text-sm">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {subscription?.trialEndsAt && (
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="text-sm text-blue-800">
                      Your free trial ends on{" "}
                      {new Date(subscription.trialEndsAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <Link href="/pricing">
                  <Button className="w-full">
                    {subscription?.plan === "free" ? "Upgrade" : "Change Plan"}
                  </Button>
                </Link>

                {subscription?.status === "active" && (
                  <Link href="/api/billing/portal">
                    <Button variant="outline" className="w-full">
                      Manage Billing
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Included Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(subscription?.features || [
                    "1 user",
                    "100 API calls/month",
                    "Basic support",
                  ]).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
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

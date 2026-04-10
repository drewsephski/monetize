"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { MobileNavigation } from "@/components/mobile-navigation";
import { toast } from "sonner";
import {
  CreditCard,
  Settings,
  Loader2,
  User,
  CheckCircle,
  Crown,
  Calendar,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

type SubscriptionData = {
  subscription: {
    id: string;
    status: string;
    planId: string | null;
    stripePriceId: string | null;
    planName: string | null;
    currentPeriodEnd: string | null;
  } | null;
  hasSubscription: boolean;
};

export default function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const { data: session, isPending } = useSession();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingSignOut, setLoadingSignOut] = useState(false);

  useEffect(() => {
    if (session) {
      fetchSubscription();
    }
  }, [session]);

  // Single refresh when returning from successful checkout + auto-dismiss banner
  useEffect(() => {
    if (success && session) {
      // Wait 3 seconds for webhook to process, then refresh once
      const timeout = setTimeout(() => {
        fetchSubscription();
      }, 3000);

      // Auto-dismiss success banner after 5 seconds
      const dismissTimeout = setTimeout(() => {
        router.replace("/dashboard"); // Clear ?success=true from URL
      }, 5000);

      return () => {
        clearTimeout(timeout);
        clearTimeout(dismissTimeout);
      };
    }
  }, [success, session, router]);

  const fetchSubscription = async () => {
    setLoadingSubscription(true);
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData({
          subscription: data.subscription,
          hasSubscription: data.hasSubscription,
        });
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error);
      toast.error("Failed to load subscription data. Please try again.");
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleSignOut = async () => {
    setLoadingSignOut(true);
    await signOut();
    router.push("/");
  };

  const openCustomerPortal = async () => {
    if (!session) return;
    setLoadingPortal(true);
    try {
      const response = await fetch("/api/customer-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          returnUrl: `${window.location.origin}/dashboard`,
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to open portal:", error);
      toast.error("Failed to open billing portal. Please try again.");
    } finally {
      setLoadingPortal(false);
    }
  };

  // Show loading while checking session
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafaf9]">
        <Loader2 className="h-8 w-8 animate-spin text-[#b8860b]" />
      </div>
    );
  }

  // If no session after loading, middleware should have redirected, but just in case
  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#fafaf9] gap-4 px-6">
        <p className="text-[#78716c]">Please sign in to view your dashboard</p>
        <Link href="/signin">
          <Button className="bg-[#b8860b] text-white hover:bg-[#8b6914]">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Header */}
      <nav className="glass sticky top-0 z-50 border-b border-[#e7e5e4]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-2 sm:gap-3">
            <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#1c1917] via-[#2d2a28] to-[#1c1917] shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#b8860b]/20">
              <img
                src="/payment-credit.svg"
                alt="Logo"
                className="ml-0.5 sm:ml-1 h-6 w-6 sm:h-7 sm:w-7 object-contain [filter:sepia(35%)_saturate(1.4)_hue-rotate(350deg)_brightness(0.95)]"
              />
            </div>
            <span className="font-[family-name:var(--font-display)] text-base sm:text-lg font-semibold tracking-tight text-[#1c1917] transition-colors group-hover:text-[#b8860b]">
              <span className="hidden sm:inline">@drewsepsi/billing</span>
              <span className="sm:hidden">Billing</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/pricing"
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#78716c] transition-all duration-200 hover:bg-[#f5f5f4] hover:text-[#1c1917]"
            >
              Pricing
            </Link>
            <div className="mx-2 h-4 w-px bg-[#e7e5e4]" />
            <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm text-[#44403c] shadow-sm">
              <User className="h-4 w-4 text-[#78716c]" />
              <span className="max-w-[150px] truncate">{session.user.email}</span>
            </div>
            <Button
              onClick={handleSignOut}
              loading={loadingSignOut}
              variant="ghost"
              className="text-[#78716c] hover:text-[#1c1917]"
            >
              Sign out
            </Button>
          </div>

          {/* Mobile Navigation */}
          <MobileNavigation
            links={[
              { href: "/pricing", label: "Pricing" },
              { href: "/demo", label: "Playground" },
            ]}
            userEmail={session.user.email}
            onSignOut={handleSignOut}
          />
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        {/* Success Banner */}
        {success && (
          <div className="mb-4 sm:mb-6 rounded-lg sm:rounded-xl border border-[#2d5a3d]/20 bg-[#2d5a3d]/10 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#2d5a3d] shrink-0" />
              <span className="text-xs sm:text-sm lg:text-base text-[#2d5a3d]">
                Welcome to Pro! Your subscription is now active.
              </span>
            </div>
          </div>
        )}

        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl lg:text-3xl text-[#1c1917]">
            Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm lg:text-base text-[#78716c]">
            Manage your subscription and billing
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Subscription Status Card */}
          <div className={`rounded-lg sm:rounded-xl border p-4 sm:p-5 lg:p-6 shadow-subtle ${
            subscriptionData?.hasSubscription 
              ? "border-[#b8860b]/30 bg-gradient-to-br from-[#b8860b]/5 to-white" 
              : "border-[#e7e5e4] bg-white"
          }`}>
            <div className={`mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl ${
              subscriptionData?.hasSubscription ? "bg-[#b8860b]/20" : "bg-[#b8860b]/10"
            }`}>
              {subscriptionData?.hasSubscription ? (
                <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-[#b8860b]" />
              ) : (
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-[#b8860b]" />
              )}
            </div>
            <h2 className="mb-1 font-medium text-[#1c1917] text-sm sm:text-base">
              {subscriptionData?.hasSubscription 
                ? `${subscriptionData.subscription?.planName || "Pro"} Plan`
                : "Free Plan"}
            </h2>
            {loadingSubscription ? (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#78716c]">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading...
              </div>
            ) : subscriptionData?.subscription ? (
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="inline-flex h-2 w-2 rounded-full bg-[#2d5a3d]" />
                  <span className="text-[#2d5a3d]">Active</span>
                </div>
                {subscriptionData.subscription.currentPeriodEnd && (
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-[#78716c]">
                    <Calendar className="h-3 w-3" />
                    Renews {new Date(subscriptionData.subscription.currentPeriodEnd).toLocaleDateString()}
                  </div>
                )}
              </div>
            ) : (
              <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-[#78716c]">
                Upgrade to unlock all features
              </p>
            )}
            <div className="mt-3 sm:mt-4 space-y-2">
              {!loadingSubscription && (
                subscriptionData?.hasSubscription ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={openCustomerPortal}
                      loading={loadingPortal}
                      variant="outline"
                      className="flex-1 border-[#e7e5e4] bg-white text-[#57534e] hover:bg-[#f5f5f4] hover:text-[#1c1917] text-xs sm:text-sm touch-target"
                    >
                      <span className="hidden sm:inline">Manage Subscription</span>
                      <span className="sm:hidden">Manage</span>
                    </Button>
                    <Button
                      onClick={fetchSubscription}
                      loading={loadingSubscription}
                      variant="outline"
                      size="icon"
                      className="border-[#e7e5e4] bg-white text-[#57534e] hover:bg-[#f5f5f4] hover:text-[#1c1917] touch-target"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Link href="/pricing" className="block">
                    <Button className="w-full bg-[#b8860b] text-white hover:bg-[#8b6914] text-xs sm:text-sm touch-target">
                      <span className="hidden sm:inline">Upgrade to Pro</span>
                      <span className="sm:hidden">Upgrade</span>
                      <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Billing Settings */}
          <div className="rounded-lg sm:rounded-xl border border-[#e7e5e4] bg-white p-4 sm:p-5 lg:p-6 shadow-subtle">
            <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-[#2d5a3d]/10">
              <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-[#2d5a3d]" />
            </div>
            <h2 className="mb-1 font-medium text-[#1c1917] text-sm sm:text-base">Billing</h2>
            <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-[#78716c]">
              Payment methods, invoices, and history
            </p>
            <Button
              onClick={openCustomerPortal}
              loading={loadingPortal}
              variant="outline"
              className="w-full border-[#e7e5e4] bg-white text-[#57534e] hover:bg-[#f5f5f4] hover:text-[#1c1917] text-xs sm:text-sm touch-target"
            >
              Billing Portal
            </Button>
          </div>

          {/* Account Info */}
          <div className="rounded-lg sm:rounded-xl border border-[#e7e5e4] bg-white p-4 sm:p-5 lg:p-6 shadow-subtle">
            <div className="mb-3 sm:mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-[#daa520]/10">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-[#daa520]" />
            </div>
            <h2 className="mb-1 font-medium text-[#1c1917] text-sm sm:text-base">Account</h2>
            <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-[#78716c]">
              Your profile information
            </p>
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-[#78716c] shrink-0">Email</span>
                <span className="max-w-[140px] sm:max-w-[180px] truncate text-[#1c1917]" title={session.user.email}>
                  {session.user.email}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#78716c] shrink-0">Name</span>
                <span className="text-[#1c1917] truncate">
                  {(session.user as { name?: string }).name || "Not set"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

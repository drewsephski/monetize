"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MobileNavigation } from "@/components/mobile-navigation"
import {
  ArrowLeft,
  Check,
  CreditCard,
  Shield,
  Zap,
  Users,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react"

const PRICES = [
  {
    id: "starter",
    name: "Starter",
    price: "$9",
    period: "/month",
    description: "Perfect for side projects",
    features: ["1,000 API calls", "Basic analytics", "Email support"],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For growing businesses",
    features: ["10,000 API calls", "Advanced analytics", "Priority support", "Team members"],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$99",
    period: "/month",
    description: "For large organizations",
    features: ["Unlimited API calls", "Custom integrations", "24/7 phone support", "SLA guarantee"],
    popular: false,
  },
]

export default function TryPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [step, setStep] = useState<"pricing" | "checkout" | "processing" | "success">("pricing")
  const [email, setEmail] = useState("demo@example.com")
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSelectPlan = async (planId: string) => {
    setLoadingPlan(planId)
    // Simulate brief loading for UX feedback
    await new Promise(resolve => setTimeout(resolve, 300))
    setSelectedPlan(planId)
    setStep("checkout")
    setLoadingPlan(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStep("processing")
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    setStep("success")
    setIsSubmitting(false)
  }

  const selectedPlanData = PRICES.find((p) => p.id === selectedPlan)

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="glass fixed top-0 right-0 left-0 z-50 border-b border-[#e7e5e4]">
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

          {/* Desktop Back Link */}
          <Link
            href="/"
            className="hidden lg:flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[#78716c] transition-all duration-200 hover:bg-[#f5f5f4] hover:text-[#1c1917]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Mobile Navigation */}
          <MobileNavigation
            links={[
              { href: "/", label: "Home" },
              { href: "/pricing", label: "Pricing" },
              { href: "/demo", label: "Playground" },
            ]}
            cta={{
              href: "/signin",
              label: "Sign in",
            }}
          />
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-24 sm:pt-28 pb-16 sm:pb-24 overflow-x-hidden">
        {/* Demo Banner */}
        <div className="mb-6 sm:mb-8 lg:mb-12 rounded-xl border border-[#b8860b]/20 bg-[#b8860b]/5 px-3 sm:px-6 py-2.5 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-[#b8860b]/10">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-[#b8860b]" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-[family-name:var(--font-display)] font-medium text-[#1c1917] text-xs sm:text-base">
                  Live Demo — Sandbox Mode
                </h2>
                <p className="text-[10px] sm:text-sm text-[#78716c]">
                  Test checkout experience. No actual charges.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm text-[#78716c] sm:justify-end">
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#22c55e]" />
              Test environment
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <div className="flex items-center justify-center">
            {[
              { id: "pricing", label: "Select Plan", shortLabel: "Plan" },
              { id: "checkout", label: "Checkout", shortLabel: "Checkout" },
              { id: "success", label: "Confirmation", shortLabel: "Done" },
            ].map((s, i) => {
              const isActive = step === s.id || (step === "processing" && s.id === "checkout")
              const isCompleted =
                (step === "checkout" && s.id === "pricing") ||
                (step === "processing" && (s.id === "pricing" || s.id === "checkout")) ||
                (step === "success" && s.id !== "success")

              return (
                <div key={s.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-1 sm:gap-1.5 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-[#b8860b] text-white shadow-md shadow-[#b8860b]/20"
                        : isCompleted
                          ? "bg-[#22c55e]/10 text-[#15803d]"
                          : "bg-[#f5f5f4] text-[#78716c]"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                    ) : (
                      <span className="flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full border border-current text-[9px] sm:text-[10px] shrink-0">
                        {i + 1}
                      </span>
                    )}
                    <span className="hidden sm:inline whitespace-nowrap">{s.label}</span>
                    <span className="sm:hidden whitespace-nowrap">{s.shortLabel}</span>
                  </div>
                  {i < 2 && (
                    <div className={`mx-1 sm:mx-1.5 h-px w-3 sm:w-6 transition-all duration-300 ${isCompleted ? "bg-[#22c55e]/30" : "bg-[#e7e5e4]"}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step: Pricing */}
        {step === "pricing" && (
          <div>
            <div className="mb-8 sm:mb-12 text-center">
              <h1 className="mb-3 sm:mb-4 font-[family-name:var(--font-display)] text-2xl sm:text-3xl text-[#1c1917] lg:text-4xl">
                Choose your plan
              </h1>
              <p className="text-base sm:text-lg text-[#78716c]">
                This is how your customers will see your pricing page
              </p>
            </div>

            <div className="grid gap-3 sm:gap-6 md:grid-cols-3">
              {PRICES.map((price) => (
                <div
                  key={price.id}
                  className={`relative rounded-xl border p-4 sm:p-6 transition-all duration-200 ${
                    price.popular
                      ? "border-[#b8860b] bg-[#b8860b]/5 shadow-lg"
                      : "border-[#e7e5e4] bg-white hover:border-[#b8860b]/30 hover:shadow-md"
                  }`}
                >
                  {price.popular && (
                    <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#b8860b] px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-white">
                      Most Popular
                    </div>
                  )}
                  <h3 className="mb-1.5 sm:mb-2 font-[family-name:var(--font-display)] text-base sm:text-lg font-medium text-[#1c1917]">
                    {price.name}
                  </h3>
                  <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-[#78716c]">{price.description}</p>
                  <div className="mb-4 sm:mb-6">
                    <span className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-[#1c1917]">
                      {price.price}
                    </span>
                    <span className="text-xs sm:text-base text-[#78716c]">{price.period}</span>
                  </div>
                  <ul className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
                    {price.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-xs sm:text-sm text-[#57534e]">
                        <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#22c55e] shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleSelectPlan(price.id)}
                    loading={loadingPlan === price.id}
                    className={`w-full text-xs sm:text-sm py-2 sm:py-2.5 ${
                      price.popular
                        ? "bg-[#b8860b] text-white hover:bg-[#8b6914]"
                        : "bg-[#f5f5f4] text-[#1c1917] hover:bg-[#e7e5e4]"
                    }`}
                  >
                    Get Started
                  </Button>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-x-6 sm:gap-y-3 text-xs sm:text-sm text-[#78716c]">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#22c55e]" />
                <span>Secure checkout</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#22c55e]" />
                <span>2,000+ devs</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#22c55e]" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        )}

        {/* Step: Checkout */}
        {(step === "checkout" || step === "processing") && selectedPlanData && (
          <div className="mx-auto max-w-md px-4 sm:px-0">
            <div className="rounded-xl border border-[#e7e5e4] bg-white p-4 sm:p-6">
              <div className="mb-4 sm:mb-6 flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-medium text-[#1c1917]">
                  Checkout
                </h2>
                <button
                  onClick={() => setStep("pricing")}
                  className="rounded-full p-2 text-[#78716c] hover:bg-[#f5f5f4]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 sm:mb-6 rounded-lg bg-[#fafaf9] p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[#1c1917] text-sm sm:text-base truncate">{selectedPlanData.name} Plan</p>
                    <p className="text-xs sm:text-sm text-[#78716c]">{selectedPlanData.description}</p>
                  </div>
                  <p className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-bold text-[#1c1917] shrink-0">
                    {selectedPlanData.price}
                    <span className="text-xs sm:text-sm font-normal text-[#78716c]">{selectedPlanData.period}</span>
                  </p>
                </div>
              </div>

              {step === "processing" ? (
                <div className="py-12 text-center">
                  <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[#b8860b]" />
                  <p className="font-medium text-[#1c1917]">Processing your subscription...</p>
                  <p className="text-sm text-[#78716c]">This would connect to Stripe in production</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-[#1c1917]">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-[#e7e5e4] px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-[#1c1917] transition-all duration-200 hover:border-[#d6d3d1] focus:border-[#b8860b] focus:ring-2 focus:ring-[#b8860b]/15 focus:outline-none"
                    />
                  </div>

                  <div className="mb-4 sm:mb-6 rounded-lg border border-dashed border-[#e7e5e4] bg-[#fafaf9] p-4 sm:p-6 text-center">
                    <img
                      src="/online-payment.svg"
                      alt="Secure payment"
                      className="mx-auto mb-2 sm:mb-3 h-16 sm:h-20 w-auto object-contain"
                    />
                    <p className="text-xs sm:text-sm text-[#78716c]">
                      In production, this would open Stripe Checkout
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#a8a29e]">
                      (Test mode — no real payment required)
                    </p>
                  </div>

                  <Button
                    type="submit"
                    loading={isSubmitting}
                    className="w-full bg-[#b8860b] py-5 sm:py-6 text-sm sm:text-base font-medium text-white hover:bg-[#8b6914]"
                  >
                    Complete Purchase
                  </Button>

                  <p className="mt-3 sm:mt-4 text-center text-[10px] sm:text-xs text-[#a8a29e]">
                    You won&apos;t be charged. This is a demo.
                  </p>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="mx-auto max-w-md text-center px-4 sm:px-0">
            <div className="mb-4 sm:mb-6 flex justify-center">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#22c55e]/10">
                <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-[#22c55e]" />
              </div>
            </div>
            <h2 className="mb-3 sm:mb-4 font-[family-name:var(--font-display)] text-xl sm:text-2xl font-medium text-[#1c1917]">
              Welcome aboard!
            </h2>
            <p className="mb-6 sm:mb-8 text-sm text-[#57534e]">
              Your subscription is now active. In production, this would redirect to your dashboard.
            </p>

            <div className="mb-6 sm:mb-8 rounded-xl border border-[#e7e5e4] bg-[#fafaf9] p-4 sm:p-6">
              <h3 className="mb-3 sm:mb-4 font-[family-name:var(--font-display)] font-medium text-[#1c1917] text-sm sm:text-base">
                What just happened?
              </h3>
              <ul className="space-y-2 sm:space-y-3 text-left text-xs sm:text-sm">
                <li className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-[#22c55e]" />
                  <span className="text-[#57534e]">
                    <strong>Customer record created</strong> — User saved to database with Stripe customer ID
                  </span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-[#22c55e]" />
                  <span className="text-[#57534e]">
                    <strong>Subscription activated</strong> — Status synced from Stripe webhook
                  </span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-[#22c55e]" />
                  <span className="text-[#57534e]">
                    <strong>Entitlements ready</strong> — Feature access calculated and cached
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 sm:gap-3">
              <Link href="/demo">
                <Button className="w-full bg-[#b8860b] py-5 sm:py-6 text-sm sm:text-base font-medium text-white hover:bg-[#8b6914]">
                  <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Try the API Playground
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setStep("pricing")
                  setSelectedPlan(null)
                  setEmail("")
                }}
                className="w-full py-5 sm:py-6 text-sm sm:text-base"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

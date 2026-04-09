"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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
  const [email, setEmail] = useState("")
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
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#1c1917] via-[#2d2a28] to-[#1c1917] shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#b8860b]/20">
              <img 
                src="/payment-credit.svg" 
                alt="Logo" 
                className="ml-1 h-7 w-7 object-contain [filter:sepia(35%)_saturate(1.4)_hue-rotate(350deg)_brightness(0.95)]"
              />
            </div>
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[#1c1917] transition-colors group-hover:text-[#b8860b]">
              @drewsepsi/billing
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[#78716c] transition-all duration-200 hover:bg-[#f5f5f4] hover:text-[#1c1917]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 pt-28 pb-24">
        {/* Demo Banner */}
        <div className="mb-12 rounded-xl border border-[#b8860b]/20 bg-[#b8860b]/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b8860b]/10">
                <Zap className="h-5 w-5 text-[#b8860b]" />
              </div>
              <div>
                <h2 className="font-[family-name:var(--font-display)] font-medium text-[#1c1917]">
                  Live Demo — Sandbox Mode
                </h2>
                <p className="text-sm text-[#78716c]">
                  This is a real checkout experience using test data. No actual charges.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-[#78716c]">
              <Shield className="h-4 w-4 text-[#22c55e]" />
              Test environment
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2">
            {[
              { id: "pricing", label: "Select Plan" },
              { id: "checkout", label: "Checkout" },
              { id: "success", label: "Confirmation" },
            ].map((s, i) => {
              const isActive = step === s.id || (step === "processing" && s.id === "checkout")
              const isCompleted =
                (step === "checkout" && s.id === "pricing") ||
                (step === "processing" && (s.id === "pricing" || s.id === "checkout")) ||
                (step === "success" && s.id !== "success")

              return (
                <div key={s.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                      isActive
                        ? "bg-[#b8860b] text-white"
                        : isCompleted
                          ? "bg-[#22c55e]/10 text-[#15803d]"
                          : "bg-[#f5f5f4] text-[#78716c]"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-xs">
                        {i + 1}
                      </span>
                    )}
                    {s.label}
                  </div>
                  {i < 2 && (
                    <div className="mx-2 h-px w-8 bg-[#e7e5e4]" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step: Pricing */}
        {step === "pricing" && (
          <div>
            <div className="mb-12 text-center">
              <h1 className="mb-4 font-[family-name:var(--font-display)] text-3xl text-[#1c1917] lg:text-4xl">
                Choose your plan
              </h1>
              <p className="text-lg text-[#78716c]">
                This is how your customers will see your pricing page
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {PRICES.map((price) => (
                <div
                  key={price.id}
                  className={`relative rounded-xl border p-6 transition-all duration-200 ${
                    price.popular
                      ? "border-[#b8860b] bg-[#b8860b]/5 shadow-lg"
                      : "border-[#e7e5e4] bg-white hover:border-[#b8860b]/30 hover:shadow-md"
                  }`}
                >
                  {price.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#b8860b] px-3 py-1 text-xs font-medium text-white">
                      Most Popular
                    </div>
                  )}
                  <h3 className="mb-2 font-[family-name:var(--font-display)] text-lg font-medium text-[#1c1917]">
                    {price.name}
                  </h3>
                  <p className="mb-4 text-sm text-[#78716c]">{price.description}</p>
                  <div className="mb-6">
                    <span className="font-[family-name:var(--font-display)] text-4xl font-bold text-[#1c1917]">
                      {price.price}
                    </span>
                    <span className="text-[#78716c]">{price.period}</span>
                  </div>
                  <ul className="mb-6 space-y-3">
                    {price.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-[#57534e]">
                        <Check className="h-4 w-4 text-[#22c55e]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleSelectPlan(price.id)}
                    loading={loadingPlan === price.id}
                    className={`w-full ${
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
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-[#78716c]">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#22c55e]" />
                <span>Secure Stripe checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#22c55e]" />
                <span>2,000+ developers</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#22c55e]" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        )}

        {/* Step: Checkout */}
        {(step === "checkout" || step === "processing") && selectedPlanData && (
          <div className="mx-auto max-w-md">
            <div className="rounded-xl border border-[#e7e5e4] bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-medium text-[#1c1917]">
                  Checkout
                </h2>
                <button
                  onClick={() => setStep("pricing")}
                  className="rounded-full p-2 text-[#78716c] hover:bg-[#f5f5f4]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-6 rounded-lg bg-[#fafaf9] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#1c1917]">{selectedPlanData.name} Plan</p>
                    <p className="text-sm text-[#78716c]">{selectedPlanData.description}</p>
                  </div>
                  <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[#1c1917]">
                    {selectedPlanData.price}
                    <span className="text-sm font-normal text-[#78716c]">{selectedPlanData.period}</span>
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
                    <label className="mb-2 block text-sm font-medium text-[#1c1917]">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-[#e7e5e4] px-4 py-3 text-sm text-[#1c1917] transition-all duration-200 hover:border-[#d6d3d1] focus:border-[#b8860b] focus:ring-2 focus:ring-[#b8860b]/15 focus:outline-none"
                    />
                  </div>

                  <div className="mb-6 rounded-lg border border-dashed border-[#e7e5e4] bg-[#fafaf9] p-6 text-center">
                    <img 
                      src="/online-payment.svg" 
                      alt="Secure payment" 
                      className="mx-auto mb-3 h-20 w-auto object-contain"
                    />
                    <p className="text-sm text-[#78716c]">
                      In production, this would open Stripe Checkout
                    </p>
                    <p className="text-xs text-[#a8a29e]">
                      (Test mode — no real payment required)
                    </p>
                  </div>

                  <Button
                    type="submit"
                    loading={isSubmitting}
                    className="w-full bg-[#b8860b] py-6 text-base font-medium text-white hover:bg-[#8b6914]"
                  >
                    Complete Purchase
                  </Button>

                  <p className="mt-4 text-center text-xs text-[#a8a29e]">
                    You won&apos;t be charged. This is a demo.
                  </p>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <div className="mx-auto max-w-md text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#22c55e]/10">
                <CheckCircle2 className="h-10 w-10 text-[#22c55e]" />
              </div>
            </div>
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-medium text-[#1c1917]">
              Welcome aboard!
            </h2>
            <p className="mb-8 text-[#57534e]">
              Your subscription is now active. In production, this would redirect to your dashboard.
            </p>

            <div className="mb-8 rounded-xl border border-[#e7e5e4] bg-[#fafaf9] p-6">
              <h3 className="mb-4 font-[family-name:var(--font-display)] font-medium text-[#1c1917]">
                What just happened?
              </h3>
              <ul className="space-y-3 text-left text-sm">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#22c55e]" />
                  <span className="text-[#57534e]">
                    <strong>Customer record created</strong> — User saved to database with Stripe customer ID
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#22c55e]" />
                  <span className="text-[#57534e]">
                    <strong>Subscription activated</strong> — Status synced from Stripe webhook
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#22c55e]" />
                  <span className="text-[#57534e]">
                    <strong>Entitlements ready</strong> — Feature access calculated and cached
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/demo">
                <Button className="w-full bg-[#b8860b] py-6 text-base font-medium text-white hover:bg-[#8b6914]">
                  <Zap className="mr-2 h-5 w-5" />
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
                className="w-full py-6 text-base"
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

"use client"

import { useState, useEffect } from "react"
import { BillingSDK } from "@/sdk/src"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  CreditCard,
  Receipt,
  Shield,
  Users,
  Play,
  Loader2,
  Sparkles,
  CheckCircle,
  Terminal,
  User,
  LogIn,
} from "lucide-react"

const billing = new BillingSDK({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
})

export default function DemoPage() {
  const { data: session } = authClient.useSession()
  const [userId, setUserId] = useState(() => crypto.randomUUID())
  const [priceId, setPriceId] = useState("price_test")
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<string>("")

  const handleCheckout = async () => {
    setLoading("checkout")
    try {
      const url = await billing.createCheckout({
        priceId,
        userId,
        successUrl: `${window.location.origin}/demo`,
        cancelUrl: `${window.location.origin}/demo`,
      })
      window.location.href = url
    } catch (err) {
      setResult(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      )
    } finally {
      setLoading(null)
    }
  }

  const checkSubscription = async () => {
    setLoading("subscription")
    try {
      const sub = await billing.getSubscription(userId)
      setResult(JSON.stringify(sub, null, 2))
    } catch (err) {
      setResult(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      )
    } finally {
      setLoading(null)
    }
  }

  const checkEntitlements = async () => {
    setLoading("entitlements")
    try {
      const entitlements = await billing.getEntitlements(userId)
      setResult(JSON.stringify(entitlements, null, 2))
    } catch (err) {
      setResult(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      )
    } finally {
      setLoading(null)
    }
  }

  const openPortal = async () => {
    setLoading("portal")
    try {
      const effectiveUserId = session?.user.id || userId
      const url = await billing.getPortalUrl({
        userId: effectiveUserId,
        returnUrl: `${window.location.origin}/demo`,
      })
      window.location.href = url
    } catch (err) {
      setResult(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      )
    } finally {
      setLoading(null)
    }
  }

  // Update userId when session changes
  useEffect(() => {
    if (session?.user.id) {
      setUserId(session.user.id)
    }
  }, [session])

  const actions = [
    {
      id: "checkout",
      label: "Create Checkout",
      description: "Stripe checkout session",
      icon: CreditCard,
      action: handleCheckout,
      primary: true,
    },
    {
      id: "subscription",
      label: "Get Subscription",
      description: "Check subscription status",
      icon: Receipt,
      action: checkSubscription,
      primary: false,
    },
    {
      id: "entitlements",
      label: "Get Entitlements",
      description: "Feature access & limits",
      icon: Shield,
      action: checkEntitlements,
      primary: false,
    },
    {
      id: "portal",
      label: "Customer Portal",
      description: "Manage billing",
      icon: Users,
      action: openPortal,
      primary: false,
    },
  ]

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="glass fixed top-0 right-0 left-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="group-hover:shadow-glow flex h-8 w-8 items-center justify-center rounded-lg bg-[#b8860b] text-sm font-medium text-white transition-all duration-200 group-hover:scale-105">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-[family-name:var(--font-display)] text-lg font-medium tracking-tight text-[#1c1917]">
              billing
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {session ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-[#fafaf9] px-3 py-1.5 text-sm text-[#44403c]">
                  <User className="h-4 w-4 text-[#78716c]" />
                  <span className="max-w-[150px] truncate">{session.user.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => authClient.signOut()}
                  className="text-xs"
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <Link href="/signin">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Button>
              </Link>
            )}
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[#78716c] transition-all duration-200 hover:bg-[#f5f5f4] hover:text-[#1c1917]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 pt-32 pb-24">
        {/* Header */}
        <div className="mb-12">
          <div className="badge-pulse mb-5 inline-flex items-center gap-2 rounded-full border border-[#635bff]/10 bg-[#b8860b]/8 px-4 py-1.5">
            <Play className="h-3.5 w-3.5 text-[#b8860b]" />
            <span className="text-sm font-medium text-[#b8860b]">
              Interactive Playground
            </span>
          </div>
          <h1 className="mb-3 font-[family-name:var(--font-display)] text-4xl leading-tight tracking-tight text-[#1c1917] lg:text-5xl">
            SDK Demo
          </h1>
          <p className="text-lg text-[#78716c]">
            Test the billing SDK methods against your live backend
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left: Configuration */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <div className="shadow-subtle rounded-xl border border-[#e7e5e4] bg-[#fafaf9] p-6">
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#e7e5e4] bg-white shadow-sm">
                    <Terminal className="h-5 w-5 text-[#b8860b]" />
                  </div>
                  <div>
                    <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-[#1c1917]">
                      Test Configuration
                    </h2>
                    <p className="text-sm text-[#78716c]">
                      These values are used for all SDK method calls below
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <label className="text-sm font-medium text-[#44403c]">
                        User ID
                      </label>
                      <span
                        className="help-tooltip"
                        data-tip="A unique identifier for your customer. We auto-generate one for testing, but in production this would be your actual user ID."
                      >
                        ?
                      </span>
                    </div>
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      className="w-full rounded-lg border border-[#e7e5e4] bg-white px-3 py-2.5 font-mono text-sm text-[#1c1917] transition-all duration-200 hover:border-[#d6d3d1] focus:border-[#b8860b] focus:ring-2 focus:ring-[#b8860b]/15 focus:outline-none"
                    />
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-[#78716c]">
                      <CheckCircle className="h-3 w-3 text-[#10b981]" />
                      Auto-generated for testing
                    </p>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <label className="text-sm font-medium text-[#44403c]">
                        Price ID
                      </label>
                      <span
                        className="help-tooltip"
                        data-tip="Your Stripe Price ID (starts with price_). You can find this in your Stripe Dashboard under Products."
                      >
                        ?
                      </span>
                    </div>
                    <input
                      type="text"
                      value={priceId}
                      onChange={(e) => setPriceId(e.target.value)}
                      placeholder="price_..."
                      className="w-full rounded-lg border border-[#e7e5e4] bg-white px-3 py-2.5 font-mono text-sm text-[#1c1917] transition-all duration-200 hover:border-[#d6d3d1] focus:border-[#b8860b] focus:ring-2 focus:ring-[#b8860b]/15 focus:outline-none"
                    />
                    <p className="mt-1.5 text-xs text-[#78716c]">
                      From your Stripe Dashboard → Products
                    </p>
                  </div>
                </div>
              </div>

              {/* API Base URL */}
              <div className="shadow-subtle card-interactive rounded-xl border border-[#e7e5e4] bg-white p-6">
                <h3 className="mb-4 text-sm font-medium text-[#1c1917]">
                  API Configuration
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between border-b border-[#f5f5f4] py-2">
                    <span className="text-[#78716c]">Base URL</span>
                    <code className="rounded bg-[#fafaf9] px-2 py-1 font-mono text-[#44403c]">
                      localhost:3000
                    </code>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#78716c]">Version</span>
                    <span className="font-medium text-[#1c1917]">v1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions & Results */}
          <div className="lg:col-span-8">
            <div className="space-y-6">
              {/* Action Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {actions.map((action) => {
                  const Icon = action.icon
                  const isLoading = loading === action.id

                  return (
                    <button
                      key={action.id}
                      onClick={action.action}
                      disabled={loading !== null}
                      className={`group relative flex items-start gap-4 rounded-xl border p-5 text-left transition-all duration-200 ${
                        action.primary
                          ? "shadow-elevated btn-interactive border-[#635bff] bg-[#b8860b] text-white hover:border-[#5244e3] hover:bg-[#8b6914]"
                          : "btn-secondary-modern hover:border-[#b8860b]/30"
                      } ${loading !== null && !isLoading ? "opacity-50" : ""}`}
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                          action.primary
                            ? "bg-white/12"
                            : "border border-[#e7e5e4] bg-white shadow-sm group-hover:border-[#b8860b]/25 group-hover:bg-[#b8860b]/8"
                        }`}
                      >
                        {isLoading ? (
                          <Loader2
                            className={`h-5 w-5 animate-spin ${action.primary ? "text-white" : "text-[#b8860b]"}`}
                          />
                        ) : (
                          <Icon
                            className={`h-5 w-5 transition-colors duration-200 ${action.primary ? "text-white" : "text-[#b8860b]"}`}
                            strokeWidth={1.5}
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`mb-1 font-medium ${action.primary ? "text-white" : "text-[#1c1917] group-hover:text-[#b8860b]"} transition-colors duration-200`}
                        >
                          {action.label}
                        </div>
                        <div
                          className={`text-sm ${action.primary ? "text-white/80" : "text-[#78716c] group-hover:text-[#57534e]"} transition-colors duration-200`}
                        >
                          {isLoading ? "Loading..." : action.description}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Results Panel */}
              {result ? (
                <div className="shadow-elevated response-block overflow-hidden rounded-xl bg-[#0f172a]">
                  <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#4ade80]" />
                      <span className="text-sm font-medium text-[#f8fafc]">
                        API Response
                      </span>
                      <span className="ml-2 text-xs text-slate-400">
                        JSON format
                      </span>
                    </div>
                    <button
                      onClick={() => setResult("")}
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-slate-400 transition-colors duration-200 hover:bg-white/10 hover:text-[#f8fafc]"
                    >
                      Clear response
                    </button>
                  </div>
                  <div className="max-h-96 overflow-auto p-5">
                    <pre className="font-mono text-sm leading-relaxed text-[#f8fafc]">
                      {result}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#d6d3d1] bg-[#fafaf9] p-12 text-center">
                  <div className="shadow-subtle mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-[#e7e5e4] bg-white">
                    <Play className="h-5 w-5 text-[#b8860b]" />
                  </div>
                  <p className="mb-1 text-sm font-medium text-[#78716c]">
                    Click any button above to see the result
                  </p>
                  <p className="mx-auto max-w-xs text-xs text-[#78716c]">
                    The API response will appear here in easy-to-read JSON
                    format
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

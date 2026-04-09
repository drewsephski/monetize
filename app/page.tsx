"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  Copy,
  Zap,
  Layers,
  RefreshCw,
  ChevronRight,
  Clock,
  Code2,
  Terminal,
  Play,
  Rocket,
  Database,
  Webhook,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useSession } from "@/lib/auth-client"

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-slide-up")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return ref
}

export default function Page() {
  const heroRef = useScrollReveal()
  const examplesRef = useScrollReveal()
  const howItWorksRef = useScrollReveal()
  const comparisonRef = useScrollReveal()
  const featuresRef = useScrollReveal()
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const { data: session } = useSession()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(null), 2000)
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="glass fixed top-0 right-0 left-0 z-50">
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
              @drew/billing
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/pricing"
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#78716c] transition-all duration-200 hover:bg-[#f5f5f4] hover:text-[#1c1917]"
            >
              Pricing
            </Link>
            <Link
              href="/try"
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#78716c] transition-all duration-200 hover:bg-[#f5f5f4] hover:text-[#1c1917]"
            >
              Live Demo
            </Link>
            <Link
              href="/demo"
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#78716c] transition-all duration-200 hover:bg-[#f5f5f4] hover:text-[#1c1917]"
            >
              Playground
            </Link>
            <div className="mx-2 h-4 w-px bg-[#e7e5e4]" />
            <Link href={session ? "/dashboard" : "/signin"}>
              <Button className="btn-interactive shadow-elevated h-9 bg-[#b8860b] px-5 font-medium text-white hover:bg-[#8b6914]">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero - ABOVE THE FOLD */}
      <section className="relative px-6 pt-28 pb-20 lg:pt-32 lg:pb-24 overflow-hidden bg-gradient-hero" ref={heroRef}>
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#b8860b]/20 bg-[#b8860b]/10 px-4 py-1.5">
              <Clock className="h-4 w-4 text-[#b8860b]" />
              <span className="text-sm font-medium text-[#b8860b]">
                Add subscriptions in 10 minutes
              </span>
            </div>

            {/* Headline */}
            <h1 className="mb-6 max-w-4xl font-[family-name:var(--font-display)] text-4xl leading-[1.1] tracking-tight text-[#1c1917] lg:text-6xl">
              No Stripe headaches.
              <br />
              <span className="text-[#b8860b]">SDK + UI + usage billing included.</span>
            </h1>

            {/* Subtext */}
            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-[#57534e] lg:text-xl">
              Complete billing system for Next.js. CLI setup, pre-built components,
              and automatic webhook handling. Stop wrestling with Stripe docs.
            </p>

            {/* CTAs */}
            <div className="mb-12 flex flex-col gap-3 sm:flex-row">
              <Link href="/try">
                <Button className="group btn-interactive shadow-elevated bg-[#b8860b] px-8 py-6 text-lg font-medium text-white hover:bg-[#8b6914]">
                  <Play className="mr-2 h-5 w-5" />
                  Try Live Demo
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link href="/setup-visual">
                <Button className="group py-6 bg-[#1c1917] px-8 text-lg font-medium text-white hover:bg-[#292524]">
                  <Rocket className="mr-2 h-5 w-5" />
                  See How It Works
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </div>

            {/* Command Copy */}
            <div className="mb-8 flex justify-center">
              <button
                onClick={() => copyToClipboard("npx drew-billing-cli init")}
                className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-[#e7e5e4] bg-white px-6 py-3 font-mono text-sm font-medium text-[#44403c] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-[#d4d4d8] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] active:scale-[0.98]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#fafaf9] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fafaf9] text-[#78716c] ring-1 ring-[#e7e5e4] transition-all duration-300 group-hover:bg-[#f5f5f4] group-hover:text-[#57534e] group-hover:ring-[#d4d4d8]">
                  <Terminal className="h-4 w-4" />
                </span>
                <span className="relative tracking-tight">npx drew-billing-cli init</span>
                <span className="relative ml-2 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300">
                  {copiedText === "npx drew-billing-cli init" ? (
                    <span className="absolute inset-0 rounded-full bg-[#dcfce7] ring-1 ring-[#86efac]/50 animate-in zoom-in-50 duration-200">
                      <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-[#16a34a]" />
                    </span>
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-[#a8a29e] transition-all duration-300 group-hover:text-[#78716c] group-hover:scale-105" />
                  )}
                </span>
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#78716c]">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#22c55e]" />
                <span>10-min setup</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#22c55e]" />
                <span>Open source</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#22c55e]" />
                <span>TypeScript SDK</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#22c55e]" />
                <span>No vendor lock-in</span>
              </div>
            </div>
          </div>

          {/* Code Block - Centered Below */}
          <div className="mt-16 mx-auto max-w-3xl">
            <div className="group relative overflow-hidden rounded-xl bg-[#141210] shadow-[0_8px_30px_rgba(0,0,0,0.12),0_0_1px_rgba(0,0,0,0.2)] ring-1 ring-[#292524] transition-all duration-500 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15),0_0_1px_rgba(0,0,0,0.2)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b8860b]/30 to-transparent" />
              <div className="flex items-center justify-between border-b border-[#292524] bg-[#1c1917]/50 px-4 py-3.5 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#ef4444]/80 ring-1 ring-[#ef4444]/20" />
                    <div className="h-3 w-3 rounded-full bg-[#eab308]/80 ring-1 ring-[#eab308]/20" />
                    <div className="h-3 w-3 rounded-full bg-[#22c55e]/80 ring-1 ring-[#22c55e]/20" />
                  </div>
                  <div className="ml-2 flex items-center gap-2 rounded-md bg-[#292524]/50 px-2 py-1">
                    <Terminal className="h-3 w-3 text-[#78716c]" />
                    <span className="font-mono text-xs text-[#78716c]">terminal</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#b8860b]/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[#b8860b]">bash</span>
                </div>
              </div>
              <div className="relative p-5 font-mono text-sm leading-relaxed">
                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#b8860b]/20 via-transparent to-transparent" />
                <div className="text-[#a8a29e]">
                  <span className="text-[#78716c]">$</span> npx drew-billing-cli init
                </div>
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-[#4ade80]">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#22c55e]/10 text-[10px]">✓</span>
                    <span>Detected: Next.js 16</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#4ade80]">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#22c55e]/10 text-[10px]">✓</span>
                    <span>Dependencies installed</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#4ade80]">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#22c55e]/10 text-[10px]">✓</span>
                    <span>Database configured</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#4ade80]">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#22c55e]/10 text-[10px]">✓</span>
                    <span>Templates ready</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[#f59e0b]">
                  <span className="text-[#b8860b]">→</span>
                  <span>Visit http://localhost:3000/pricing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Example Apps */}
      <section className="px-6 py-20 lg:py-28 bg-[#fafaf9]" ref={examplesRef}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-3xl text-[#1c1917] lg:text-4xl">
              3 ways to bill your customers
            </h2>
            <p className="text-lg text-[#78716c]">
              Start with a complete example, customize from there
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* SaaS Starter */}
            <div className="group card-interactive rounded-xl border border-[#e7e5e4] bg-white p-6 transition-all duration-200 hover:border-[#b8860b]/30 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#b8860b]/10">
                <Rocket className="h-6 w-6 text-[#b8860b]" />
              </div>
              <h3 className="mb-2 font-[family-name:var(--font-display)] text-lg font-medium text-[#1c1917]">
                SaaS Starter
              </h3>
              <p className="mb-4 text-sm text-[#78716c]">
                Complete SaaS template with auth, pricing page, and customer dashboard. Deploy in 10 minutes.
              </p>
              <div className="space-y-2">
                {["Better Auth integration", "Pricing page", "Customer portal"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-[#57534e]">
                    <Check className="h-4 w-4 text-[#22c55e]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* API Billing */}
            <div className="group card-interactive rounded-xl border border-[#e7e5e4] bg-white p-6 transition-all duration-200 hover:border-[#b8860b]/30 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#4a7c59]/10">
                <Code2 className="h-6 w-6 text-[#4a7c59]" />
              </div>
              <h3 className="mb-2 font-[family-name:var(--font-display)] text-lg font-medium text-[#1c1917]">
                API Billing
              </h3>
              <p className="mb-4 text-sm text-[#78716c]">
                Usage-based billing for APIs. Track requests, bill by usage tier, manage API keys.
              </p>
              <div className="space-y-2">
                {["Usage tracking", "API key management", "Metered billing"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-[#57534e]">
                    <Check className="h-4 w-4 text-[#22c55e]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Credits */}
            <div className="group card-interactive rounded-xl border border-[#e7e5e4] bg-white p-6 transition-all duration-200 hover:border-[#b8860b]/30 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#8b5cf6]/10">
                <Zap className="h-6 w-6 text-[#8b5cf6]" />
              </div>
              <h3 className="mb-2 font-[family-name:var(--font-display)] text-lg font-medium text-[#1c1917]">
                AI Credits
              </h3>
              <p className="mb-4 text-sm text-[#78716c]">
                Credit-based billing for AI apps. Pre-purchase credits, track consumption, top-up flows.
              </p>
              <div className="space-y-2">
                {["Credit system", "Usage analytics", "Top-up UI"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-[#57534e]">
                    <Check className="h-4 w-4 text-[#22c55e]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Steps */}
      <section className="px-6 py-20 lg:py-28" ref={howItWorksRef}>
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-3xl text-[#1c1917] lg:text-4xl">
              How it works
            </h2>
            <p className="text-lg text-[#78716c]">
              From zero to billing in 3 simple steps
            </p>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b8860b] text-lg font-bold text-white">
                  1
                </div>
                <div className="mt-4 h-full w-px bg-[#e7e5e4]" />
              </div>
              <div className="flex-1 pb-8">
                <h3 className="mb-2 font-[family-name:var(--font-display)] text-xl font-medium text-[#1c1917]">
                  Run the CLI
                </h3>
                <p className="mb-4 text-[#57534e]">
                  One command detects your framework, installs dependencies, and sets up your database.
                </p>
                <button
                  onClick={() => copyToClipboard("npx drew-billing-cli init")}
                  className="group relative flex w-3/8 items-center justify-between overflow-hidden rounded-lg bg-[#1c1917] p-4 font-mono text-sm text-[#a8a29e] transition-all duration-200 hover:bg-[#252220]"
                >
                  <span>$ npx drew-billing-cli init</span>
                  <span className="relative flex h-7 w-7 items-center justify-center rounded-md bg-[#292524]/50 transition-all duration-200 group-hover:bg-[#363230]">
                    {copiedText === "npx drew-billing-cli init" ? (
                      <Check className="h-3.5 w-3.5 text-[#22c55e] animate-in zoom-in-50 duration-200" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-[#78716c] transition-all duration-200 group-hover:text-[#a8a29e]" />
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#b8860b] text-lg font-bold text-white">
                  2
                </div>
                <div className="mt-4 h-full w-px bg-[#e7e5e4]" />
              </div>
              <div className="flex-1 pb-8">
                <h3 className="mb-2 font-[family-name:var(--font-display)] text-xl font-medium text-[#1c1917]">
                  Connect Stripe
                </h3>
                <p className="mb-4 text-[#57534e]">
                  Paste your Stripe keys. We create products, set up webhooks, and configure everything.
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 rounded-lg border border-[#e7e5e4] bg-white px-4 py-2 text-sm text-[#57534e]">
                    <Database className="h-4 w-4 text-[#b8860b]" />
                    Auto-migrations
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-[#e7e5e4] bg-white px-4 py-2 text-sm text-[#57534e]">
                    <Webhook className="h-4 w-4 text-[#b8860b]" />
                    Webhooks ready
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#22c55e] text-lg font-bold text-white">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="mb-2 font-[family-name:var(--font-display)] text-xl font-medium text-[#1c1917]">
                  Ship your pricing page
                </h3>
                <p className="mb-4 text-[#57534e]">
                  Pre-built components ready to customize. Deploy and start accepting payments.
                </p>
                <div className="text-center w-2/7 rounded-lg border border-[#22c55e]/20 bg-[#22c55e]/5 px-4 py-3 text-sm text-[#15803d]">
                  ✓ Visit /pricing — you&apos;re live!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison vs Stripe */}
      <section className="px-6 py-20 lg:py-28 bg-[#fafaf9]" ref={comparisonRef}>
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-3xl text-[#1c1917] lg:text-4xl">
              Why not just use Stripe?
            </h2>
            <p className="text-lg text-[#78716c]">
              You can. But here&apos;s what you&apos;re signing up for:
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#e7e5e4] bg-white shadow-sm">
            <table className="w-full">
              <thead className="bg-[#fafaf9]">
                <tr>
                  <th className="px-6 py-4 text-left font-[family-name:var(--font-display)] font-medium text-[#1c1917]">
                    What you need to do
                  </th>
                  <th className="px-6 py-4 text-center font-medium text-[#78716c]">
                    Stripe Only
                  </th>
                  <th className="px-6 py-4 text-center font-medium text-[#b8860b]">
                    @drew/billing
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e5e4]">
                {[
                  { task: "Database schema for subscriptions", stripe: "Build yourself", billing: "✓ Included", highlight: true },
                  { task: "Webhook handling & retries", stripe: "Build yourself", billing: "✓ Automatic", highlight: true },
                  { task: "Customer portal UI", stripe: "Build yourself", billing: "✓ Pre-built", highlight: false },
                  { task: "Usage-based billing", stripe: "Complex API calls", billing: "✓ One line", highlight: true },
                  { task: "Subscription state management", stripe: "Manual sync", billing: "✓ Automatic", highlight: false },
                  { task: "Time to first payment", stripe: "2-3 weeks", billing: "10 minutes", highlight: true },
                ].map((row, i) => (
                  <tr key={i} className={row.highlight ? "bg-[#b8860b]/5" : ""}>
                    <td className="px-6 py-4 text-[#1c1917]">{row.task}</td>
                    <td className="px-6 py-4 text-center text-sm text-[#78716c]">{row.stripe}</td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-[#b8860b]">{row.billing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-center text-sm text-[#78716c]">
            @drew/billing uses Stripe under the hood. We just handle the hard parts so you don&apos;t have to.
          </p>
        </div>
      </section>

      <div className="section-divider" />

      {/* Features Section - Refined Editorial Layout */}
      <section className="px-6 py-24 lg:py-32" ref={featuresRef}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-20 max-w-2xl lg:mb-24">
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-3xl leading-tight text-[#1c1917] lg:text-4xl">
              Everything you need to bill customers
            </h2>
            <p className="text-lg text-[#78716c]">
              A complete subscription platform that handles the complexity so
              you can focus on your product.
            </p>
          </div>

          {/* Feature 1: Webhook Handling */}
          <div className="mb-24 grid items-center gap-16 lg:mb-32 lg:grid-cols-2 lg:gap-24">
            <div className="order-2 lg:order-1">
              <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-[#635bff]/10 bg-[#b8860b]/8 px-3 py-1.5">
                <Zap className="h-4 w-4 text-[#b8860b]" />
                <span className="text-sm font-semibold text-[#b8860b]">
                  Webhooks
                </span>
              </div>
              <h3 className="mb-4 font-[family-name:var(--font-display)] text-2xl leading-tight text-[#1c1917] lg:text-3xl">
                Process events exactly once
              </h3>
              <p className="mb-6 text-lg leading-relaxed text-[#78716c]">
                Our idempotency layer prevents duplicate subscription updates,
                ensuring your database stays in perfect sync with Stripe.
              </p>
              <ul className="space-y-3">
                {[
                  "Automatic deduplication by event ID",
                  "Subscription lifecycle state machine",
                  "Automatic retry with exponential backoff",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#44403c]">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2d5a3d]/10">
                      <Check
                        className="h-3 w-3 text-[#2d5a3d]"
                        strokeWidth={2.5}
                      />
                    </div>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2">
              <div className="shadow-subtle card-interactive rounded-xl border border-[#e7e5e4] bg-[#fafaf9] p-8">
                <div className="mb-6 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#4a7c59]" />
                  <span className="font-mono text-xs text-[#78716c]">
                    POST /api/stripe/webhook
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="group flex items-center justify-between rounded-lg border border-[#e7e5e4] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-[#b8860b]/30 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#dcfce7] text-[10px] font-bold text-[#16a34a]">✓</span>
                      <span className="font-mono text-sm text-[#44403c]">checkout.session.completed</span>
                    </div>
                    <span className="rounded-full bg-[#dcfce7] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#16a34a]">
                      processed
                    </span>
                  </div>
                  <div className="group flex items-center justify-between rounded-lg border border-[#e7e5e4] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-[#b8860b]/30 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#dcfce7] text-[10px] font-bold text-[#16a34a]">✓</span>
                      <span className="font-mono text-sm text-[#44403c]">customer.subscription.updated</span>
                    </div>
                    <span className="rounded-full bg-[#dcfce7] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#16a34a]">
                      processed
                    </span>
                  </div>
                  <div className="group flex items-center justify-between rounded-lg border border-[#e7e5e4] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-[#b8860b]/30 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#fef3c7] text-[10px] font-bold text-[#d97706]">↻</span>
                      <span className="font-mono text-sm text-[#44403c]">invoice.payment_failed</span>
                    </div>
                    <span className="rounded-full bg-[#fef3c7] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#d97706]">
                      retry #2
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: SDK */}
          <div className="mb-24 grid items-center gap-16 lg:mb-32 lg:grid-cols-2 lg:gap-24">
            <div>
              <div className="group relative overflow-hidden rounded-xl bg-[#141210] shadow-[0_8px_30px_rgba(0,0,0,0.12),0_0_1px_rgba(0,0,0,0.2)] ring-1 ring-[#292524] transition-all duration-500 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15),0_0_1px_rgba(0,0,0,0.2)]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b8860b]/30 to-transparent" />
                <div className="flex items-center justify-between border-b border-[#292524] bg-[#1c1917]/50 px-5 py-3.5 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-md bg-[#292524]/50 px-2.5 py-1">
                      <Terminal className="h-3 w-3 text-[#78716c]" />
                      <span className="font-mono text-xs text-[#78716c]">npm</span>
                    </div>
                    <span className="font-mono text-xs text-[#a8a29e]">install @drew/billing</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard("npm install @drew/billing")}
                    className="group/copy relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-[#1c1917]/60 text-[#a8a29e] ring-1 ring-white/10 backdrop-blur-sm transition-all duration-300 hover:bg-[#292524]/80 hover:text-[#f5f5f4] hover:ring-[#b8860b]/30 hover:shadow-[0_0_12px_rgba(184,134,11,0.15)] active:scale-95"
                  >
                    <span className="absolute inset-0 bg-gradient-to-br from-[#b8860b]/10 to-transparent opacity-0 transition-opacity duration-300 group-hover/copy:opacity-100" />
                    {copiedText === "npm install @drew/billing" ? (
                      <Check className="relative h-4 w-4 text-[#22c55e] animate-in zoom-in-50 duration-200" />
                    ) : (
                      <Copy className="relative h-4 w-4 transition-transform duration-300 group-hover/copy:scale-105" />
                    )}
                  </button>
                </div>
                <div className="overflow-x-auto p-6 leading-relaxed">
                  <div className="mb-2 text-sm text-[#94a3b8]">
                    {"// Install with npm, yarn, or pnpm"}
                  </div>
                  <div className="mb-6">
                    <span className="token-keyword">import</span>{" "}
                    <span className="token-operator">{"{"}</span>{" "}
                    <span className="token-variable">BillingSDK</span>{" "}
                    <span className="token-operator">{"}"}</span>{" "}
                    <span className="token-keyword">from</span>{" "}
                    <span className="token-string">
                      &quot;@drew/billing&quot;
                    </span>
                    <span className="token-operator">;</span>
                  </div>

                  <div className="mb-2 text-sm text-[#94a3b8]">
                    {"// Check if user has an active subscription"}
                  </div>
                  <div className="mb-5">
                    <span className="token-keyword">const</span>{" "}
                    <span className="token-operator">{"{"}</span>{" "}
                    <span className="token-property">hasSubscription</span>{" "}
                    <span className="token-operator">{"}"}</span>{" "}
                    <span className="token-operator">=</span>{" "}
                    <span className="token-keyword">await</span>{" "}
                    <span className="token-variable">billing</span>
                    <span className="token-operator">.</span>
                    <span className="token-function">getSubscription</span>
                    <span className="token-operator">(</span>
                    <span className="token-variable">userId</span>
                    <span className="token-operator">)</span>
                    <span className="token-operator">;</span>
                  </div>

                  <div className="mb-2 text-sm text-[#94a3b8]">
                    {"// Get user feature access & limits"}
                  </div>
                  <div>
                    <span className="token-keyword">const</span>{" "}
                    <span className="token-operator">{"{"}</span>{" "}
                    <span className="token-property">features</span>
                    <span className="token-operator">,</span>{" "}
                    <span className="token-property">limits</span>{" "}
                    <span className="token-operator">{"}"}</span>{" "}
                    <span className="token-operator">=</span>{" "}
                    <span className="token-keyword">await</span>{" "}
                    <span className="token-variable">billing</span>
                    <span className="token-operator">.</span>
                    <span className="token-function">getEntitlements</span>
                    <span className="token-operator">(</span>
                    <span className="token-variable">userId</span>
                    <span className="token-operator">)</span>
                    <span className="token-operator">;</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-[#635bff]/10 bg-[#b8860b]/8 px-3 py-1.5">
                <Layers className="h-4 w-4 text-[#b8860b]" />
                <span className="text-sm font-semibold text-[#b8860b]">
                  TypeScript SDK
                </span>
              </div>
              <h3 className="mb-4 font-[family-name:var(--font-display)] text-2xl leading-tight text-[#1c1917] lg:text-3xl">
                Code that writes itself
              </h3>
              <p className="mb-6 text-lg leading-relaxed text-[#78716c]">
                Full autocomplete and type checking right out of the box. Your
                editor shows you exactly what&apos;s available—no guessing
                needed.
              </p>

              {/* User-friendly feature highlights */}
              <div className="mb-6 space-y-2.5">
                {[
                  {
                    label: "Install in seconds",
                    desc: "Just one npm command",
                    icon: Check,
                  },
                  {
                    label: "Works with any framework",
                    desc: "React, Vue, Svelte, vanilla JS",
                    icon: Check,
                  },
                  {
                    label: "Clear error messages",
                    desc: "Know immediately what went wrong",
                    icon: Check,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="group flex items-start gap-3 rounded-lg border border-[#e7e5e4] bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-[#b8860b]/30 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#dcfce7] ring-1 ring-[#86efac]/20 transition-all duration-300 group-hover:bg-[#bbf7d0] group-hover:ring-[#4ade80]/30">
                      <item.icon
                        className="h-4 w-4 text-[#16a34a]"
                        strokeWidth={2.5}
                      />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#1c1917]">
                        {item.label}
                      </div>
                      <div className="text-xs text-[#78716c]">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature 3: Retry System */}
          <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
            <div className="order-2 lg:order-1">
              <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-[#635bff]/10 bg-[#b8860b]/8 px-3 py-1.5">
                <RefreshCw className="h-4 w-4 text-[#b8860b]" />
                <span className="text-sm font-semibold text-[#b8860b]">
                  Resilience
                </span>
              </div>
              <h3 className="mb-4 font-[family-name:var(--font-display)] text-2xl leading-tight text-[#1c1917] lg:text-3xl">
                Never lose a webhook
              </h3>
              <p className="mb-6 text-lg leading-relaxed text-[#78716c]">
                Failed webhooks don&apos;t mean lost data. Our retry system runs
                every 5 minutes with exponential backoff up to 5 attempts.
              </p>
              <div className="flex items-center gap-4 rounded-xl border border-[#e7e5e4] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-[#b8860b]/30 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fef3c7] ring-1 ring-[#fcd34d]/30">
                  <RefreshCw
                    className="h-6 w-6 text-[#d97706]"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#1c1917]">
                    Vercel Cron
                  </div>
                  <div className="mt-0.5 font-mono text-xs text-[#78716c]">
                    */5 * * * *
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="rounded-xl border border-[#e7e5e4] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#fef3c7] ring-1 ring-[#fcd34d]/30">
                      <RefreshCw className="h-3.5 w-3.5 text-[#d97706]" />
                    </div>
                    <span className="text-sm font-semibold text-[#1c1917]">
                      Retry Queue
                    </span>
                  </div>
                  <span className="rounded-full bg-[#fafaf9] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#78716c] ring-1 ring-[#e7e5e4]">
                    Max 5 attempts
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-xs font-semibold text-[#78716c]">
                      Attempt 1
                    </div>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#f5f5f4] ring-1 ring-[#e7e5e4]">
                      <div className="h-full w-full rounded-full bg-gradient-to-r from-[#ef4444] to-[#f87171] shadow-sm" />
                    </div>
                    <span className="rounded-full bg-[#fef2f2] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#dc2626] ring-1 ring-[#fecaca]">
                      Failed
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-xs font-semibold text-[#78716c]">
                      Attempt 2
                    </div>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#f5f5f4] ring-1 ring-[#e7e5e4]">
                      <div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] shadow-sm" />
                    </div>
                    <span className="rounded-full bg-[#fef3c7] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#b45309] ring-1 ring-[#fcd34d]">
                      Retrying...
                    </span>
                  </div>
                  <div className="flex items-center gap-4 opacity-50">
                    <div className="w-20 text-xs font-semibold text-[#78716c]">
                      Attempt 3
                    </div>
                    <div className="h-2.5 flex-1 rounded-full bg-[#f5f5f4] ring-1 ring-[#e7e5e4]" />
                    <span className="rounded-full bg-[#fafaf9] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#78716c] ring-1 ring-[#e7e5e4]">
                      Pending
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* API Preview Section */}
      <section className="bg-[#fafaf9] px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 max-w-2xl lg:mb-20">
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-3xl leading-tight text-[#1c1917] lg:text-4xl">
              Clean, predictable APIs
            </h2>
            <p className="text-lg text-[#78716c]">
              RESTful endpoints that return exactly what you need. No surprises.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                method: "POST",
                path: "/api/checkout",
                desc: "Create Stripe checkout session",
                color: "#4a7c59",
                bg: "#4a7c59",
              },
              {
                method: "GET",
                path: "/api/subscription/:userId",
                desc: "Get subscription status",
                color: "#b8860b",
                bg: "#b8860b",
              },
              {
                method: "GET",
                path: "/api/entitlements/:userId",
                desc: "Check feature access",
                color: "#daa520",
                bg: "#daa520",
              },
            ].map((endpoint, i) => (
              <div
                key={i}
                className="group card-interactive cursor-pointer rounded-xl border border-[#e7e5e4] bg-white p-6 transition-colors duration-200 hover:border-[#d6d3d1]"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className="rounded-md px-2.5 py-1 font-mono text-xs font-semibold"
                    style={{
                      backgroundColor: `${endpoint.bg}12`,
                      color: endpoint.color,
                    }}
                  >
                    {endpoint.method}
                  </span>
                  <code className="font-mono text-sm text-[#44403c] transition-colors duration-200 group-hover:text-[#b8860b]">
                    {endpoint.path}
                  </code>
                </div>
                <p className="text-sm text-[#78716c]">{endpoint.desc}</p>
                <div className="mt-4 flex items-center gap-1 border-t border-[#f5f5f4] pt-4 text-xs font-medium text-[#b8860b] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  View docs <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#22c55e]/20 bg-[#22c55e]/10 px-4 py-1.5">
            <Check className="h-4 w-4 text-[#22c55e]" />
            <span className="text-sm font-medium text-[#15803d]">
              Free. Open source. No vendor lock-in.
            </span>
          </div>
          <h2 className="mb-6 font-[family-name:var(--font-display)] text-4xl leading-tight text-[#1c1917] lg:text-5xl">
            Stop wrestling with Stripe.
            <br />
            <span className="text-[#b8860b]">Start billing in 10 minutes.</span>
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-[#78716c] lg:text-xl">
            Join developers who ship faster. No credit card required to try.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/try">
              <Button className="group btn-interactive shadow-elevated bg-[#b8860b] px-8 py-6 text-base font-medium text-white hover:bg-[#8b6914]">
                <Play className="mr-2 h-4 w-4" />
                Try Live Demo
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <button
              onClick={() => copyToClipboard("npx drew-billing-cli init")}
              className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-[#e7e5e4] bg-white px-4 py-1 text-sm font-semibold text-[#44403c] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-[#d4d4d8] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#fafaf9] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fafaf9] text-[#78716c] ring-1 ring-[#e7e5e4] transition-all duration-300 group-hover:bg-[#f5f5f4] group-hover:text-[#57534e] group-hover:ring-[#d4d4d8]">
                <Terminal className="h-4 w-4" />
              </span>
              <span className="relative tracking-tight">Copy Install Command</span>
              <span className="relative ml-2 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300">
                {copiedText === "npx drew-billing-cli init" ? (
                  <span className="absolute inset-0 rounded-full bg-[#dcfce7] ring-1 ring-[#86efac]/50 animate-in zoom-in-50 duration-200">
                    <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-[#16a34a]" />
                  </span>
                ) : (
                  <Copy className="h-3.5 w-3.5 text-[#a8a29e] transition-all duration-300 group-hover:text-[#78716c] group-hover:scale-105" />
                )}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e7e5e4] bg-[#fafaf9] px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <img 
                src="/online-payment.svg" 
                alt="Logo" 
                className="h-10 w-10 object-contain [filter:sepia(35%)_saturate(1.4)_hue-rotate(350deg)_brightness(0.95)]"
              />
              <span className="font-[family-name:var(--font-display)] font-medium text-[#1c1917]">
                @drew/billing
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              {[
                { label: "Pricing", href: "/pricing" },
                { label: "Live Demo", href: "/try" },
                { label: "Playground", href: "/demo" },
                { label: "How It Works", href: "/setup-visual" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-lg px-4 py-2 text-sm text-[#78716c] transition-all duration-200 hover:bg-[#e7e5e4]/50 hover:text-[#1c1917]"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <p className="text-sm text-[#78716c]">
              © 2026 billing. MIT License.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

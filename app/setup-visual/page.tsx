"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  Copy,
  Terminal,
  Rocket,
  Database,
  CreditCard,
  Webhook,
  Globe,
  ChevronRight,
  Zap,
  Server,
  Shield,
  Play,
  Clock,
  Menu,
  X,
} from "lucide-react"
import { useState, useEffect } from "react"

export default function SetupVisualPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(null), 2000)
  }

  const handleStepChange = (newStep: number) => {
    if (newStep === activeStep) return
    setIsAnimating(true)
    setTimeout(() => {
      setActiveStep(newStep)
      setIsAnimating(false)
    }, 150)
  }

  const steps = [
    {
      id: "init",
      icon: Terminal,
      title: "Initialize",
      subtitle: "One command",
      color: "#b8860b",
      command: "npx drew-billing-cli init",
      description: "Scaffolds Next.js app, installs dependencies, creates Stripe products",
      outputs: [
        "✓ Next.js project created",
        "✓ Stripe products: Pro ($29), Enterprise ($99)",
        "✓ Database schema pushed",
        "✓ Templates installed",
      ],
      time: "~2 minutes",
    },
    {
      id: "env",
      icon: Database,
      title: "Connect Database",
      subtitle: "Neon Postgres",
      color: "#4a7c59",
      command: "DATABASE_URL=postgresql://...",
      description: "Paste your Neon connection string. We handle migrations and schema setup.",
      outputs: [
        "✓ Customers table ready",
        "✓ Subscriptions table ready",
        "✓ Webhook events table ready",
        "✓ Usage tracking enabled",
      ],
      time: "~1 minute",
    },
    {
      id: "stripe",
      icon: CreditCard,
      title: "Add Stripe Keys",
      subtitle: "Test or Live mode",
      color: "#635bff",
      command: "STRIPE_SECRET_KEY=sk_test_...",
      description: "Paste your Stripe keys. CLI validates and creates webhook endpoint.",
      outputs: [
        "✓ Stripe API connected",
        "✓ Webhook endpoint ready",
        "✓ Products configured",
        "✓ Pricing page live",
      ],
      time: "~1 minute",
    },
    {
      id: "dev",
      icon: Zap,
      title: "Dev Server",
      subtitle: "Local testing",
      color: "#f59e0b",
      command: "npm run dev",
      description: "Start the dev server. Test checkout flow in sandbox mode instantly.",
      outputs: [
        "✓ Sandbox mode active",
        "✓ http://localhost:3000/pricing",
        "✓ Test checkout ready",
        "✓ Database syncing",
      ],
      time: "~30 seconds",
    },
    {
      id: "webhook",
      icon: Webhook,
      title: "Webhooks",
      subtitle: "Local or Production",
      color: "#8b5cf6",
      command: "stripe listen --forward-to localhost:3000/api/billing/webhook",
      description: "Forward Stripe webhooks locally. Test real subscription lifecycle events.",
      outputs: [
        "✓ Webhook forwarding active",
        "✓ Events: checkout.session.completed",
        "✓ Events: subscription.updated",
        "✓ Database auto-updates",
      ],
      time: "~1 minute",
    },
    {
      id: "deploy",
      icon: Globe,
      title: "Deploy",
      subtitle: "Vercel",
      color: "#000000",
      command: "git push && vercel --prod",
      description: "Push to GitHub, deploy to Vercel. Add env vars, go live.",
      outputs: [
        "✓ Production URL ready",
        "✓ Stripe live mode connected",
        "✓ Webhook endpoint configured",
        "✓ Accepting real payments",
      ],
      time: "~3 minutes",
    },
  ]

  const totalTime = "~10 minutes"

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 right-0 left-0 z-50 border-b border-[#e7e5e4]/60 bg-white/90 backdrop-blur-xl">
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
          <div className="hidden md:flex items-center gap-3">
            <Link 
              href="/" 
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#57534e] transition-colors hover:bg-[#f5f5f4] hover:text-[#1c1917]"
            >
              Back to Home
            </Link>
            <Link href="/try">
              <Button className="h-10 bg-[#b8860b] px-5 font-semibold text-white shadow-sm transition-all hover:bg-[#8b6914] hover:shadow-md">
                Try Demo
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#1c1917] relative h-10 w-10 touch-target flex items-center justify-center rounded-lg hover:bg-[#f5f5f4] transition-colors"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <div className="relative h-5 w-5">
              <Menu className={`absolute inset-0 h-5 w-5 transition-all duration-200 ${mobileMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`} />
              <X className={`absolute inset-0 h-5 w-5 transition-all duration-200 ${mobileMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu Panel */}
        <div className={`md:hidden absolute top-full left-0 right-0 z-50 bg-white border-b border-[#e7e5e4] shadow-lg transition-all duration-300 ${mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
          <div className="px-4 py-4 space-y-2">
            <Link 
              href="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#57534e] transition-colors hover:bg-[#f5f5f4] hover:text-[#1c1917]"
            >
              Back to Home
            </Link>
            <Link 
              href="/try" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#b8860b] transition-colors hover:bg-[#b8860b]/5"
            >
              <Play className="h-4 w-4" />
              Try Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero - Slimmer on mobile */}
      <section className="relative px-3 sm:px-6 pt-24 sm:pt-32 pb-8 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#fafaf9] via-white to-white" />
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-3 sm:mb-6 inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#b8860b]/20 bg-[#b8860b]/5 px-2.5 sm:px-4 py-1 sm:py-2">
            <Rocket className="h-3 w-3 sm:h-4 sm:w-4 text-[#b8860b]" />
            <span className="text-[11px] sm:text-sm font-semibold text-[#b8860b]">
              From zero to production in {totalTime}
            </span>
          </div>
          <h1 className="mb-3 sm:mb-6 font-[family-name:var(--font-display)] text-2xl sm:text-4xl lg:text-5xl leading-[1.15] tracking-tight text-[#1c1917]">
            The simplest way to add
            <br />
            <span className="text-[#b8860b]">payments to your app</span>
          </h1>
          <p className="mx-auto max-w-2xl text-sm sm:text-lg text-[#57534e] leading-relaxed px-1 sm:px-0">
            No more wrestling with Stripe docs. One command scaffolds everything: 
            Next.js app, database, Stripe products, webhooks, and pre-built UI components.
          </p>
        </div>
      </section>

      {/* Interactive Setup Timeline - Slimmer mobile padding */}
      <section className="px-3 sm:px-6 py-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          {/* Progress Bar */}
          <div className="mb-6 sm:mb-10">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-sm font-semibold text-[#1c1917]">Setup Progress</span>
              <span className="text-sm font-medium text-[#78716c]">
                Step {activeStep + 1} of {steps.length}
              </span>
            </div>
            <div className="h-2 sm:h-2.5 rounded-full bg-[#e7e5e4] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4a520] transition-all duration-500 ease-out"
                style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:gap-8 lg:grid-cols-[280px_1fr]">
            {/* Step Navigation - Compact dots on mobile, sidebar on desktop */}
            <div className="lg:space-y-2">
              {/* Mobile: Ultra-compact numbered step dots */}
              <div className="lg:hidden">
                {/* Step counter */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-sm font-semibold text-[#1c1917]">
                    {steps[activeStep].title}
                  </span>
                  <span className="text-xs text-[#78716c]">
                    {activeStep + 1}/{steps.length}
                  </span>
                </div>
                
                {/* Compact step dots - Smaller size */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
                  {steps.map((step, index) => {
                    const isActive = index === activeStep
                    const isCompleted = index < activeStep

                    return (
                      <button
                        key={step.id}
                        onClick={() => handleStepChange(index)}
                        className={`flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-200 touch-target ${
                          isActive
                            ? "w-11 h-11 bg-[#b8860b] text-white shadow-sm"
                            : isCompleted
                            ? "w-10 h-10 bg-[#22c55e] text-white"
                            : "w-10 h-10 bg-[#e7e5e4] text-[#78716c] hover:bg-[#d4d4d8]"
                        }`}
                        aria-label={`Step ${index + 1}: ${step.title}`}
                      >
                        {isCompleted ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <span className={`font-semibold ${isActive ? "text-sm" : "text-xs"}`}>
                            {index + 1}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Desktop: Full sidebar navigation */}
              <div className="hidden lg:block space-y-2">
                {steps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = index === activeStep
                  const isCompleted = index < activeStep

                  return (
                    <button
                      key={step.id}
                      onClick={() => handleStepChange(index)}
                      className={`group w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 ${
                        isActive
                          ? "border-[#b8860b] bg-[#b8860b]/5 shadow-sm ring-1 ring-[#b8860b]/10"
                          : isCompleted
                          ? "border-[#22c55e]/30 bg-[#22c55e]/5 hover:border-[#22c55e]/50"
                          : "border-[#e7e5e4] bg-white hover:border-[#d4d4d8] hover:shadow-sm"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-[#b8860b] text-white shadow-sm"
                            : isCompleted
                            ? "bg-[#22c55e] text-white"
                            : "bg-[#f5f5f4] text-[#78716c] group-hover:bg-[#e7e5e4]"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#1c1917] text-sm truncate">{step.title}</div>
                        <div className="text-xs text-[#78716c] truncate">{step.subtitle}</div>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                          isActive ? "text-[#b8860b] rotate-90" : "text-[#a8a29e] group-hover:text-[#78716c]"
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Active Step Detail - Slimmer on mobile */}
            <div className="rounded-xl sm:rounded-2xl border border-[#e7e5e4] bg-[#fafaf9] p-3 sm:p-6 lg:p-8 shadow-sm">
              <div 
                className={`transition-all duration-150 ${
                  isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                }`}
              >
                {(() => {
                  const step = steps[activeStep]
                  const Icon = step.icon

                  return (
                    <div className="space-y-5 sm:space-y-7">
                      {/* Header - Compact on mobile */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-2.5 sm:gap-4">
                          <div
                            className="flex h-9 w-9 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-lg sm:rounded-xl text-white shadow-sm"
                            style={{ backgroundColor: step.color }}
                          >
                            <Icon className="h-4 w-4 sm:h-7 sm:w-7" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h2 className="text-lg sm:text-2xl font-[family-name:var(--font-display)] font-semibold text-[#1c1917] truncate">
                              {step.title}
                            </h2>
                            <p className="text-xs sm:text-sm text-[#78716c] mt-0 sm:mt-1 line-clamp-2">{step.description}</p>
                          </div>
                        </div>
                        <div className="flex sm:shrink-0 items-center gap-1.5 sm:gap-2 rounded-full bg-[#f5f5f4] px-2 sm:px-3 py-1 text-[11px] sm:text-sm font-medium text-[#78716c] self-start sm:self-auto">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          {step.time}
                        </div>
                      </div>

                      {/* Command - Compact on mobile */}
                      <div className="rounded-lg sm:rounded-xl bg-[#1c1917] p-2.5 sm:p-5 shadow-inner">
                        <div className="flex items-center justify-between mb-2 sm:mb-4">
                          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#78716c]">
                            Command
                          </span>
                          <button
                            onClick={() => copyToClipboard(step.command)}
                            className="flex items-center gap-1 sm:gap-2 rounded-md px-1.5 py-0.5 sm:px-2.5 sm:py-1.5 text-[11px] sm:text-xs font-medium text-[#a8a29e] transition-all hover:bg-white/10 hover:text-white touch-target"
                          >
                            {copiedText === step.command ? (
                              <>
                                <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#22c55e]" />
                                <span className="text-[#22c55e]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <code className="block font-mono text-[11px] sm:text-sm text-[#a8a29e] break-all">
                          <span className="text-[#78716c]">$</span> {step.command}
                        </code>
                      </div>

                      {/* Outputs - Compact on mobile */}
                      <div>
                        <h3 className="mb-2 sm:mb-4 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#78716c]">
                          What happens
                        </h3>
                        <div className="space-y-1.5 sm:space-y-2.5">
                          {step.outputs.map((output, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 sm:gap-3 rounded-lg border border-[#e7e5e4] bg-white px-2.5 sm:px-4 py-2 sm:py-3.5 shadow-sm"
                            >
                              <span className="flex h-3.5 w-3.5 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full bg-[#22c55e]/10 text-[#22c55e]">
                                <Check className="h-2 w-2 sm:h-3 sm:w-3" strokeWidth={3} />
                              </span>
                              <span className="text-[11px] sm:text-sm text-[#57534e] font-medium">{output}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Navigation - Compact on mobile */}
                      <div className="flex items-center justify-between gap-2 sm:gap-4 pt-1 sm:pt-2">
                        <button
                          onClick={() => handleStepChange(Math.max(0, activeStep - 1))}
                          disabled={activeStep === 0}
                          className="flex items-center gap-1 sm:gap-2 rounded-lg border border-transparent px-2 sm:px-4 py-1.5 sm:py-2.5 text-[11px] sm:text-sm font-semibold text-[#57534e] transition-all hover:bg-[#e7e5e4] hover:text-[#1c1917] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent touch-target"
                        >
                          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 rotate-180" />
                          <span className="hidden sm:inline">Previous</span>
                          <span className="sm:hidden">Prev</span>
                        </button>
                        
                        {/* Step Indicators - Hidden on very small screens */}
                        <div className="hidden sm:flex items-center gap-1.5">
                          {steps.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => handleStepChange(index)}
                              className={`h-1.5 sm:h-2 rounded-full transition-all duration-200 ${
                                index === activeStep
                                  ? "w-4 sm:w-6 bg-[#b8860b]"
                                  : index < activeStep
                                  ? "w-1.5 sm:w-2 bg-[#22c55e]"
                                  : "w-1.5 sm:w-2 bg-[#d4d4d8] hover:bg-[#a8a29e]"
                              }`}
                              aria-label={`Go to step ${index + 1}`}
                            />
                          ))}
                        </div>

                        <button
                          onClick={() => handleStepChange(Math.min(steps.length - 1, activeStep + 1))}
                          disabled={activeStep === steps.length - 1}
                          className="flex items-center gap-1 sm:gap-2 rounded-lg bg-[#b8860b] px-2.5 sm:px-5 py-1.5 sm:py-2.5 text-[11px] sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#8b6914] hover:shadow-md hover:translate-y-[-1px] active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#b8860b] disabled:hover:shadow-none disabled:hover:translate-y-0 touch-target"
                        >
                          <span className="hidden sm:inline">Next Step</span>
                          <span className="sm:hidden">Next</span>
                          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start CTA - Slimmer on mobile */}
      <section className="px-3 sm:px-6 py-10 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="relative rounded-xl sm:rounded-3xl border border-[#e7e5e4] bg-gradient-to-br from-[#fafaf9] via-white to-[#fafaf9] p-4 sm:p-10 lg:p-14 text-center shadow-sm overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#b8860b]/5 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-[#4a7c59]/5 blur-3xl" />
            
            <div className="relative">
              <div className="mx-auto mb-3 sm:mb-6 flex h-10 w-10 sm:h-16 sm:w-16 items-center justify-center rounded-lg sm:rounded-2xl bg-gradient-to-br from-[#b8860b] to-[#8b6914] text-white shadow-lg">
                <Rocket className="h-5 w-5 sm:h-8 sm:w-8" />
              </div>
              <h2 className="mb-2 sm:mb-4 font-[family-name:var(--font-display)] text-lg sm:text-2xl lg:text-3xl font-semibold text-[#1c1917]">
                Ready to ship your billing?
              </h2>
              <p className="mx-auto mb-4 sm:mb-10 max-w-lg text-xs sm:text-base text-[#57534e] leading-relaxed px-1 sm:px-0">
                Join developers who skip the Stripe setup headache. One command, full billing system.
              </p>
              
              {/* Buttons Container - Slimmer on mobile */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-4">
                {/* Copy Command Button */}
                <button
                  onClick={() => copyToClipboard("npx drew-billing-cli init")}
                  className="group relative flex items-center justify-between gap-2 sm:gap-4 rounded-lg sm:rounded-xl border border-[#e7e5e4] bg-white px-2.5 sm:px-4 py-2.5 sm:py-3 font-mono text-[11px] sm:text-sm font-medium text-[#44403c] shadow-sm transition-all duration-200 hover:border-[#d4d4d8] hover:shadow-md sm:w-auto sm:min-w-[340px] touch-target"
                >
                  <span className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="flex h-7 w-7 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-md sm:rounded-lg bg-[#fafaf9] text-[#78716c] transition-colors group-hover:bg-[#f0efed]">
                      <Terminal className="h-3 w-3 sm:h-4 sm:w-4" />
                    </span>
                    <span className="text-[#57534e] truncate">npx drew-billing-cli init</span>
                  </span>
                  <span className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[#f5f5f4] transition-colors group-hover:bg-[#e7e5e4]">
                    {copiedText === "npx drew-billing-cli init" ? (
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-[#22c55e]" />
                    ) : (
                      <Copy className="h-3 w-3 sm:h-4 sm:w-4 text-[#a8a29e]" />
                    )}
                  </span>
                </button>
                
                {/* Try Demo Button */}
                <Link href="/try" className="sm:self-stretch">
                  <button className="h-full min-h-[44px] sm:min-h-[58px] w-full sm:w-auto bg-[#1c1917] px-4 sm:px-8 py-2.5 sm:py-0 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base text-white shadow-sm transition-all hover:bg-[#292524] hover:shadow-md hover:translate-y-[-1px] active:translate-y-0 touch-target flex items-center justify-center">
                    <Play className="mr-2 h-3.5 w-3.5 sm:h-5 sm:w-5 fill-current" />
                    Try Live Demo
                  </button>
                </Link>
              </div>
              
              <p className="mt-3 sm:mt-6 text-[10px] sm:text-xs text-[#a8a29e]">
                No signup required. Works with test Stripe keys.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section - Slimmer on mobile */}
      <section className="border-t border-[#e7e5e4] bg-[#fafaf9] px-3 sm:px-6 py-10 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 sm:gap-8 text-center sm:grid-cols-2 lg:grid-cols-3">
            <div className="group space-y-2 sm:space-y-4">
              <div className="mx-auto flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-lg sm:rounded-2xl bg-[#b8860b]/10 transition-transform duration-300 group-hover:scale-105">
                <Shield className="h-5 w-5 sm:h-7 sm:w-7 text-[#b8860b]" />
              </div>
              <h3 className="font-semibold text-[#1c1917] text-sm sm:text-base">Production Ready</h3>
              <p className="mx-auto max-w-xs text-[11px] sm:text-sm leading-relaxed text-[#78716c]">
                Webhooks, idempotency, retries, and error handling included
              </p>
            </div>
            <div className="group space-y-2 sm:space-y-4">
              <div className="mx-auto flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-lg sm:rounded-2xl bg-[#4a7c59]/10 transition-transform duration-300 group-hover:scale-105">
                <Server className="h-5 w-5 sm:h-7 sm:w-7 text-[#4a7c59]" />
              </div>
              <h3 className="font-semibold text-[#1c1917] text-sm sm:text-base">Full Stack</h3>
              <p className="mx-auto max-w-xs text-[11px] sm:text-sm leading-relaxed text-[#78716c]">
                Frontend components, API routes, database schema, and SDK
              </p>
            </div>
            <div className="group space-y-2 sm:space-y-4 sm:col-span-2 lg:col-span-1">
              <div className="mx-auto flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-lg sm:rounded-2xl bg-[#635bff]/10 transition-transform duration-300 group-hover:scale-105">
                <CreditCard className="h-5 w-5 sm:h-7 sm:w-7 text-[#635bff]" />
              </div>
              <h3 className="font-semibold text-[#1c1917] text-sm sm:text-base">Stripe Powered</h3>
              <p className="mx-auto max-w-xs text-[11px] sm:text-sm leading-relaxed text-[#78716c]">
                Enterprise-grade payments without the complexity
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}


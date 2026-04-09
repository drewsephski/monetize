import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">SaaS Starter</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/signin" className="text-muted-foreground hover:text-foreground">
            Sign In
          </Link>
          <Link href="/pricing">
            <Button>Pricing</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8">
          <Zap className="h-4 w-4" />
          Powered by @drew/billing
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Build your SaaS
          <br />
          <span className="text-primary">in 10 minutes</span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Complete starter with auth, billing, and dashboard.
          Skip the boilerplate and focus on your product.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/pricing">
            <Button size="lg" className="gap-2">
              <Zap className="h-5 w-5" />
              Get Started
            </Button>
          </Link>
          <Link href="https://github.com/drew/billing" target="_blank">
            <Button variant="outline" size="lg">
              View on GitHub
            </Button>
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-left">
          <div className="p-6 rounded-lg bg-card border">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">10-Minute Setup</h3>
            <p className="text-muted-foreground text-sm">
              One command and you have working billing. No Stripe webhook configuration.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card border">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Usage-Based Billing</h3>
            <p className="text-muted-foreground text-sm">
              Metered billing built-in. Track API calls, storage, or any metric.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-card border">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Feature Entitlements</h3>
            <p className="text-muted-foreground text-sm">
              Gate features by plan. Free vs Pro access control out of the box.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground text-sm">
        <p>
          Built with{" "}
          <a href="https://billing.drew.dev" className="text-primary hover:underline">
            @drew/billing
          </a>
        </p>
      </footer>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, Zap, Shield, Code, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <section className="py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          Add subscriptions to your app
          <span className="text-primary"> in 10 minutes</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          The complete billing infrastructure for Stripe. Subscriptions, usage-based billing,
          and entitlements - with drop-in UI components.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="https://github.com/drew/billing"
            className="inline-flex items-center gap-2 px-6 py-3 border rounded-md font-medium hover:bg-muted"
          >
            View on GitHub
          </Link>
        </div>
      </section>

      {/* Code preview */}
      <section className="mb-20">
        <div className="bg-slate-900 rounded-lg p-6 overflow-x-auto">
          <pre className="text-sm text-slate-100">
            <code>{`npx @drew/billing init

// Then in your app:
import { PricingTable } from "@/components/billing";

export default function PricingPage() {
  return <PricingTable plans={plans} onSubscribe={handleSubscribe} />;
}`}</code>
          </pre>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold">10-Minute Setup</h3>
          <p className="text-sm text-muted-foreground">
            One command sets up everything: Stripe products, API routes, and UI components.
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold">Usage Billing</h3>
          <p className="text-sm text-muted-foreground">
            Bill by API calls, storage, compute - any metric you want. Automatic Stripe sync.
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold">Battle-Tested</h3>
          <p className="text-sm text-muted-foreground">
            Production-ready with idempotency, retries, and webhook reliability built in.
          </p>
        </div>

        <div className="space-y-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Code className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold">Drop-in Components</h3>
          <p className="text-sm text-muted-foreground">
            Prebuilt React components: pricing tables, usage meters, subscription gates.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-12 border-t">
        <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-muted-foreground mb-6">
          Join thousands of developers shipping billing faster.
        </p>
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90"
        >
          Read the Docs
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}

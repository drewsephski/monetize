import Link from "next/link";
import { Zap, Shield, BarChart3, Code } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg">API Product</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            <Link href="/docs" className="text-gray-600 hover:text-gray-900">
              Docs
            </Link>
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            API Product Starter
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A complete API product with usage-based billing, API keys, and rate limiting.
            Built with @drew/billing in 10 minutes.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              Get Started
            </Link>
            <Link
              href="/docs"
              className="border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50"
            >
              View Docs
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-blue-600" />}
              title="API Key Management"
              description="Create, revoke, and manage API keys for your users with secure key hashing."
            />
            <FeatureCard
              icon={<BarChart3 className="w-8 h-8 text-green-600" />}
              title="Usage-Based Billing"
              description="Track API usage and bill per call with metered billing integration."
            />
            <FeatureCard
              icon={<Code className="w-8 h-8 text-purple-600" />}
              title="Rate Limiting"
              description="Tier-based rate limits tied to subscription plans."
            />
          </div>
        </div>
      </section>

      {/* API Preview */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Simple API</h2>
          <div className="bg-slate-900 rounded-xl p-6 overflow-x-auto">
            <pre className="text-sm text-green-400">
              <code>{`# Get API status
curl https://api.example.com/v1/status \\
  -H "X-API-Key: your_api_key"

# Generate content (uses 1 credit)
curl -X POST https://api.example.com/v1/generate \\
  -H "X-API-Key: your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "Hello world"}'

# Check usage
curl https://api.example.com/v1/usage \\
  -H "X-API-Key: your_api_key"`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-gray-500">
          <p>Built with @drew/billing</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl border bg-white hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

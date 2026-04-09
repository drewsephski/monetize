import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Documentation - Drew Billing',
  description: 'Getting started with Drew Billing SDK and CLI',
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Documentation</h1>
              <p className="text-muted-foreground mt-1">
                Everything you need to integrate Drew Billing
              </p>
            </div>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-[280px_1fr] gap-12">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <nav className="sticky top-6 space-y-8">
              <div>
                <h3 className="font-semibold mb-3 text-sm">Getting Started</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#quickstart" className="text-muted-foreground hover:text-foreground transition-colors">
                      Quick Start
                    </a>
                  </li>
                  <li>
                    <a href="#installation" className="text-muted-foreground hover:text-foreground transition-colors">
                      Installation
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-sm">SDK</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#sdk-usage" className="text-muted-foreground hover:text-foreground transition-colors">
                      Usage
                    </a>
                  </li>
                  <li>
                    <a href="#sdk-api" className="text-muted-foreground hover:text-foreground transition-colors">
                      API Reference
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-sm">CLI</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#cli-usage" className="text-muted-foreground hover:text-foreground transition-colors">
                      Commands
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-sm">API</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#license-verify" className="text-muted-foreground hover:text-foreground transition-colors">
                      License Verification
                    </a>
                  </li>
                  <li>
                    <a href="#usage-tracking" className="text-muted-foreground hover:text-foreground transition-colors">
                      Usage Tracking
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-sm">License Keys</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#key-management" className="text-muted-foreground hover:text-foreground transition-colors">
                      Management
                    </a>
                  </li>
                  <li>
                    <a href="#key-format" className="text-muted-foreground hover:text-foreground transition-colors">
                      Key Format
                    </a>
                  </li>
                </ul>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="space-y-16">
            {/* Quick Start */}
            <section id="quickstart">
              <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
              <p className="text-muted-foreground mb-6">
                Drew Billing provides a complete billing infrastructure for your applications. 
                Choose between our <strong>SDK</strong> for programmatic access or the <strong>CLI</strong> for command-line workflows.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="p-6 border rounded-lg bg-card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <h3 className="font-semibold">SDK</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Integrate billing directly into your application code.
                  </p>
                  <code className="block bg-muted p-3 rounded text-sm font-mono">
                    npm install @drewsepsi/billing-sdk
                  </code>
                </div>

                <div className="p-6 border rounded-lg bg-card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <svg className="w-5 h-5 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold">CLI</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage billing from the command line.
                  </p>
                  <code className="block bg-muted p-3 rounded text-sm font-mono">
                    npx @drewsepsi/billing-cli init
                  </code>
                </div>
              </div>
            </section>

            {/* Installation */}
            <section id="installation">
              <h2 className="text-2xl font-bold mb-4">Installation</h2>
              
              <h3 className="text-lg font-semibold mb-3">SDK Installation</h3>
              <div className="bg-muted rounded-lg p-4 mb-6">
                <pre className="text-sm font-mono overflow-x-auto">
                  <code>{`# npm
npm install @drewsepsi/billing-sdk

# yarn
yarn add @drewsepsi/billing-sdk

# pnpm
pnpm add @drewsepsi/billing-sdk

# bun
bun add @drewsepsi/billing-sdk`}</code>
                </pre>
              </div>

              <h3 className="text-lg font-semibold mb-3">CLI Installation</h3>
              <div className="bg-muted rounded-lg p-4 mb-6">
                <pre className="text-sm font-mono overflow-x-auto">
                  <code>{`# Run without installing
npx @drewsepsi/billing-cli init

# Or install globally
npm install -g @drewsepsi/billing-cli
drew-billing init`}</code>
                </pre>
              </div>
            </section>

            {/* SDK Usage */}
            <section id="sdk-usage">
              <h2 className="text-2xl font-bold mb-4">SDK Usage</h2>
              
              <p className="text-muted-foreground mb-4">
                The SDK provides methods to verify licenses, track usage, and check entitlements.
              </p>

              <h3 className="text-lg font-semibold mb-3">Initialize the SDK</h3>
              <div className="bg-muted rounded-lg p-4 mb-6">
                <pre className="text-sm font-mono overflow-x-auto">
                  <code>{`import { DrewBillingSDK } from '@drewsepsi/billing-sdk';

const sdk = new DrewBillingSDK({
  licenseKey: process.env.DREW_BILLING_LICENSE_KEY,
  baseUrl: 'https://monetize-two.vercel.app',
});`}</code>
                </pre>
              </div>

              <h3 className="text-lg font-semibold mb-3">Verify License</h3>
              <div className="bg-muted rounded-lg p-4 mb-6">
                <pre className="text-sm font-mono overflow-x-auto">
                  <code>{`// Verify your license key
const result = await sdk.verifyLicense({
  machineId: 'unique-machine-id', // Optional: track unique installations
});

if (result.valid) {
  console.log('License tier:', result.license.tier);
  console.log('Features:', result.license.features);
} else {
  console.error('License invalid:', result.error);
}`}</code>
                </pre>
              </div>
            </section>

            {/* SDK API Reference */}
            <section id="sdk-api">
              <h2 className="text-2xl font-bold mb-4">SDK API Reference</h2>

              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold font-mono text-sm mb-2">verifyLicense(options)</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Verifies a license key and returns license details.
                  </p>
                  <table className="w-full text-sm">
                    <thead className="text-left border-b">
                      <tr>
                        <th className="pb-2">Parameter</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Required</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b">
                        <td className="py-2 font-mono">machineId</td>
                        <td className="py-2">string</td>
                        <td className="py-2">No</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold font-mono text-sm mb-2">trackUsage(eventType, metadata)</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Track API usage. Automatically enforces tier limits.
                  </p>
                  <table className="w-full text-sm">
                    <thead className="text-left border-b">
                      <tr>
                        <th className="pb-2">Parameter</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Required</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b">
                        <td className="py-2 font-mono">eventType</td>
                        <td className="py-2">string</td>
                        <td className="py-2">Yes</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono">metadata</td>
                        <td className="py-2">object</td>
                        <td className="py-2">No</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* CLI Usage */}
            <section id="cli-usage">
              <h2 className="text-2xl font-bold mb-4">CLI Commands</h2>

              <div className="bg-muted rounded-lg p-4 mb-6">
                <pre className="text-sm font-mono overflow-x-auto">
                  <code>{`# Initialize Drew Billing in your project
drew-billing init

# Check your license status
drew-billing status

# Validate a license key
drew-billing validate --key DREW-XXXX-XXXX-XXXX

# Get help
drew-billing --help`}</code>
                </pre>
              </div>

              <h3 className="text-lg font-semibold mb-3">Environment Variables</h3>
              <p className="text-muted-foreground mb-4">
                The CLI reads configuration from environment variables:
              </p>
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-sm font-mono overflow-x-auto">
                  <code>{`# Required
export DREW_BILLING_LICENSE_KEY="DREW-XXXX-XXXX-XXXX"

# Optional
export DREW_BILLING_API_URL="https://monetize-two.vercel.app"`}</code>
                </pre>
              </div>
            </section>

            {/* License Verification API */}
            <section id="license-verify">
              <h2 className="text-2xl font-bold mb-4">License Verification API</h2>

              <p className="text-muted-foreground mb-4">
                Direct HTTP API for license verification (used by SDK/CLI internally).
              </p>

              <div className="border rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">POST</span>
                  <code className="text-sm font-mono">/api/license/verify</code>
                </div>
                
                <h4 className="font-semibold text-sm mb-2">Request Body</h4>
                <div className="bg-muted rounded p-3 mb-4">
                  <pre className="text-sm font-mono">
                    <code>{`{
  "licenseKey": "DREW-XXXX-XXXX-XXXX",
  "machineId": "optional-machine-id",
  "eventType": "verify"
}`}</code>
                  </pre>
                </div>

                <h4 className="font-semibold text-sm mb-2">Response</h4>
                <div className="bg-muted rounded p-3">
                  <pre className="text-sm font-mono">
                    <code>{`{
  "valid": true,
  "license": {
    "id": "uuid",
    "tier": "pro",
    "status": "active",
    "features": ["usage_based_billing", "advanced_analytics"],
    "usageLimits": { "apiCalls": 10000 }
  }
}`}</code>
                  </pre>
                </div>
              </div>
            </section>

            {/* Usage Tracking API */}
            <section id="usage-tracking">
              <h2 className="text-2xl font-bold mb-4">Usage Tracking API</h2>

              <div className="border rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">POST</span>
                  <code className="text-sm font-mono">/api/license/track</code>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  Tracks usage and enforces tier limits. Returns 429 when limit exceeded.
                </p>

                <h4 className="font-semibold text-sm mb-2">Request Body</h4>
                <div className="bg-muted rounded p-3 mb-4">
                  <pre className="text-sm font-mono">
                    <code>{`{
  "licenseKey": "DREW-XXXX-XXXX-XXXX",
  "eventType": "api_call",
  "machineId": "optional-machine-id"
}`}</code>
                  </pre>
                </div>

                <h4 className="font-semibold text-sm mb-2">Response Headers</h4>
                <div className="bg-muted rounded p-3">
                  <pre className="text-sm font-mono">
                    <code>{`X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9999
X-RateLimit-Reset: 2026-05-01T00:00:00.000Z`}</code>
                  </pre>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">GET</span>
                  <code className="text-sm font-mono">/api/license/track?licenseKey=xxx</code>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Check current usage without incrementing the counter.
                </p>
              </div>
            </section>

            {/* License Key Management */}
            <section id="key-management">
              <h2 className="text-2xl font-bold mb-4">License Key Management</h2>

              <p className="text-muted-foreground mb-4">
                Manage your license keys through the dashboard at{' '}
                <Link href="/dashboard/licenses" className="text-primary hover:underline">
                  /dashboard/licenses
                </Link>
              </p>

              <h3 className="text-lg font-semibold mb-3">Dashboard Features</h3>
              <ul className="space-y-2 text-muted-foreground mb-6">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>View all your license keys</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Copy keys to clipboard (masked by default)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Track usage statistics with visual progress bars</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Regenerate keys (invalidates old key)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Receive email notifications for new/regenerated keys</span>
                </li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">Regenerating Keys</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Warning:</strong> Regenerating a key immediately invalidates the old key. 
                  A new key will be emailed to you. Make sure to update your applications with the new key.
                </p>
              </div>
            </section>

            {/* License Key Format */}
            <section id="key-format">
              <h2 className="text-2xl font-bold mb-4">License Key Format</h2>

              <p className="text-muted-foreground mb-4">
                Drew Billing license keys follow a consistent format:
              </p>

              <div className="bg-muted rounded-lg p-4 mb-6">
                <code className="text-lg font-mono">DREW-XXXX-XXXX-XXXX</code>
              </div>

              <h3 className="text-lg font-semibold mb-3">Key Components</h3>
              <ul className="space-y-2 text-muted-foreground mb-6">
                <li><strong>Prefix:</strong> <code>DREW-</code> - Identifies the key type</li>
                <li><strong>Segments:</strong> Three 4-character hexadecimal segments</li>
                <li><strong>Format:</strong> Uppercase letters and numbers</li>
                <li><strong>Total Length:</strong> 19 characters</li>
              </ul>

              <h3 className="text-lg font-semibold mb-3">Example Key</h3>
              <code className="block bg-muted p-3 rounded font-mono text-sm mb-6">
                DREW-A1B2-C3D4-E5F6
              </code>

              <h3 className="text-lg font-semibold mb-3">Security</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Cryptographically random generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Unique per license</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Immediately invalidated on regeneration</span>
                </li>
              </ul>
            </section>

            {/* Footer */}
            <footer className="pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                Need help? Contact us at{' '}
                <a href="mailto:support@drew.dev" className="text-primary hover:underline">
                  support@drew.dev
                </a>
              </p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}

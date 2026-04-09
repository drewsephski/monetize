import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "@drew/billing - Documentation",
  description: "Add subscriptions to your app in 10 minutes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto px-4 h-14 flex items-center justify-between">
              <Link href="/" className="font-bold text-lg">
                @drew/billing
              </Link>
              <nav className="flex gap-4 text-sm">
                <Link href="/docs" className="text-muted-foreground hover:text-foreground">
                  Docs
                </Link>
                <Link
                  href="https://github.com/drew/billing"
                  className="text-muted-foreground hover:text-foreground"
                >
                  GitHub
                </Link>
              </nav>
            </div>
          </header>
          <div className="container mx-auto px-4 py-8">
            <div className="flex gap-8">
              <aside className="w-64 shrink-0 hidden md:block">
                <nav className="space-y-1">
                  <Link href="/docs" className="block px-3 py-2 rounded-md hover:bg-muted">
                    Getting Started
                  </Link>
                  <Link href="/docs/subscriptions" className="block px-3 py-2 rounded-md hover:bg-muted">
                    Subscriptions
                  </Link>
                  <Link href="/docs/usage" className="block px-3 py-2 rounded-md hover:bg-muted">
                    Usage Billing
                  </Link>
                  <Link href="/docs/entitlements" className="block px-3 py-2 rounded-md hover:bg-muted">
                    Entitlements
                  </Link>
                  <Link href="/docs/api" className="block px-3 py-2 rounded-md hover:bg-muted">
                    API Reference
                  </Link>
                </nav>
              </aside>
              <main className="flex-1 max-w-3xl prose prose-slate">
                {children}
              </main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SignInForm } from "./signin-form";

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInSkeleton />}>
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="glass fixed left-0 right-0 top-0 z-50">
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

      <div className="mx-auto max-w-md px-6 pt-32 pb-24">
        <div className="mb-8 text-center">
          <h1 className="mb-3 font-[family-name:var(--font-display)] text-3xl text-[#1c1917]">
            Welcome back
          </h1>
          <p className="text-[#78716c]">
            Sign in to your account to manage subscriptions
          </p>
        </div>

        <SignInForm />

        <p className="mt-6 text-center text-sm text-[#78716c]">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-[#b8860b] hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

function SignInSkeleton() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="glass fixed left-0 right-0 top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="h-9 w-9 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </nav>
      <div className="mx-auto max-w-md px-6 pt-32 pb-24">
        <div className="space-y-4">
          <div className="h-8 animate-pulse rounded bg-gray-200" />
          <div className="h-12 animate-pulse rounded bg-gray-200" />
          <div className="h-12 animate-pulse rounded bg-gray-200" />
          <div className="h-12 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </main>
  );
}

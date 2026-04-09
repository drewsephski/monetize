"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/dashboard",
    });

    if (result.error) {
      setError(result.error.message || "Failed to sign up");
      setLoading(false);
    } else {
      // Signup successful - with autoSignIn and requireEmailVerification: false,
      // user is automatically signed in and redirected to callbackURL
      setSuccess(true);
      setLoading(false);
      // Small delay to show success message, then redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-white">
        <nav className="glass fixed left-0 right-0 top-0 z-50">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#1c1917] via-[#2d2a28] to-[#1c1917] shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#b8860b]/20">
                <img 
                  src="/payment-credit.svg" 
                  alt="Logo" 
                  className="h-8 w-8 object-contain [filter:sepia(35%)_saturate(1.4)_hue-rotate(350deg)_brightness(0.95)]"
                />
              </div>
              <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[#1c1917] transition-colors group-hover:text-[#b8860b]">
                @drewsepsi/billing
              </span>
            </Link>
          </div>
        </nav>

        <div className="mx-auto max-w-md px-6 pt-32 pb-24 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#2d5a3d]/10">
            <CheckCircle className="h-8 w-8 text-[#2d5a3d]" />
          </div>
          <h1 className="mb-3 font-[family-name:var(--font-display)] text-3xl text-[#1c1917]">
            Account created!
          </h1>
          <p className="mb-8 text-[#78716c]">
            Welcome! Redirecting you to your dashboard...
          </p>
          <Link href="/signin">
            <Button className="bg-[#b8860b] px-8 py-3 text-base font-medium text-white hover:bg-[#8b6914]">
              Sign in
            </Button>
          </Link>
        </div>
      </main>
    );
  }

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
            Create your account
          </h1>
          <p className="text-[#78716c]">
            Get started with subscriptions in minutes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#44403c]">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="w-full rounded-lg border border-[#e7e5e4] bg-white px-4 py-3 text-[#1c1917] transition-all duration-200 hover:border-[#d6d3d1] focus:border-[#b8860b] focus:ring-2 focus:ring-[#b8860b]/15 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#44403c]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-[#e7e5e4] bg-white px-4 py-3 text-[#1c1917] transition-all duration-200 hover:border-[#d6d3d1] focus:border-[#b8860b] focus:ring-2 focus:ring-[#b8860b]/15 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#44403c]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              className="w-full rounded-lg border border-[#e7e5e4] bg-white px-4 py-3 text-[#1c1917] transition-all duration-200 hover:border-[#d6d3d1] focus:border-[#b8860b] focus:ring-2 focus:ring-[#b8860b]/15 focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-[#78716c]">
              Must be at least 8 characters
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#b8860b] py-3 text-base font-medium text-white hover:bg-[#8b6914]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#78716c]">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-medium text-[#b8860b] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

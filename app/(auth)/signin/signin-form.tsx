"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await authClient.signIn.email({
      email,
      password,
      callbackURL: callbackUrl,
    });

    if (result.error) {
      setError(result.error.message || "Failed to sign in");
      setLoading(false);
    }
    // onSuccess: redirect happens automatically via callbackURL
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          placeholder="••••••••"
          className="w-full rounded-lg border border-[#e7e5e4] bg-white px-4 py-3 text-[#1c1917] transition-all duration-200 hover:border-[#d6d3d1] focus:border-[#b8860b] focus:ring-2 focus:ring-[#b8860b]/15 focus:outline-none"
        />
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
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SignUpForm } from "./signup-form";

export default async function SignUpPage() {
  // Server-side auth check - redirect immediately if already logged in
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (session?.user?.id) {
    // Already signed in - go to dashboard
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-white">
      <SignUpForm />
    </main>
  );
}

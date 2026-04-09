import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "AI Credits",
  description: "AI credits billing example with top-up flow, entitlements, and sandbox checkout.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans text-[color:var(--ink-1)]">
        {children}
      </body>
    </html>
  );
}

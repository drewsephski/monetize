import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Credits - Usage-Based Billing Example",
  description: "Credit-based AI app with usage billing, built with @drew/billing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

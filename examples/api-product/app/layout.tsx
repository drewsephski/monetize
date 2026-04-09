import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "API Product - Usage-Based Billing Example",
  description: "A complete API product with usage-based billing, built with @drew/billing",
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

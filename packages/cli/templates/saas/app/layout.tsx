import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "__APP_NAME__",
  description: "Subscription billing starter with polished overview, pricing, and dashboard flows.",
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

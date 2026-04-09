import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "__APP_NAME__",
  description: "Usage-based API billing example with keys, protected endpoints, and sandbox mode.",
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

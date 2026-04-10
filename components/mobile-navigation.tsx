"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
}

interface MobileNavigationProps {
  links: NavLink[];
  cta?: {
    href: string;
    label: string;
  };
  userEmail?: string;
  onSignOut?: () => void;
}

export function MobileNavigation({ links, cta, userEmail, onSignOut }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden">
      {/* Menu Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-xl",
          "transition-all duration-300 ease-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b8860b]/30",
          isOpen
            ? "bg-[#1c1917] text-white"
            : "bg-[#fafaf9] text-[#1c1917] hover:bg-[#f5f5f4]"
        )}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <div className="relative h-5 w-5">
          <span
            className={cn(
              "absolute left-0 block h-0.5 w-5 bg-current transition-all duration-300",
              isOpen ? "top-2 rotate-45" : "top-0.5"
            )}
          />
          <span
            className={cn(
              "absolute left-0 top-2.5 block h-0.5 w-5 bg-current transition-all duration-300",
              isOpen ? "opacity-0 translate-x-2" : "opacity-100"
            )}
          />
          <span
            className={cn(
              "absolute left-0 block h-0.5 w-5 bg-current transition-all duration-300",
              isOpen ? "top-2 -rotate-45" : "top-4"
            )}
          />
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition-all duration-500",
          isOpen ? "visible" : "invisible pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-[#1c1917]/20 backdrop-blur-sm transition-opacity duration-500",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={cn(
            "absolute right-0 top-0 h-full w-[80%] max-w-[320px] bg-white shadow-2xl",
            "transition-transform duration-500 ease-out",
            isOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          {/* Decorative Top Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#b8860b] via-[#d4a84b] to-[#b8860b]" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e7e5e4] px-5 py-4">
            <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#1c1917]">
              Menu
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#78716c] transition-colors hover:bg-[#f5f5f4] hover:text-[#1c1917]"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 p-3">
            {links.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-4 py-3.5",
                  "text-[15px] font-medium text-[#57534e]",
                  "transition-all duration-200 ease-out",
                  "hover:bg-[#fafaf9] hover:text-[#1c1917]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b8860b]/20"
                )}
                style={{
                  transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
                }}
              >
                <span>{link.label}</span>
                <ArrowRight className="h-4 w-4 text-[#a8a29e] transition-all duration-200 group-hover:translate-x-1 group-hover:text-[#b8860b]" />
              </Link>
            ))}
          </nav>

          {/* Footer Section - CTA or User */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-[#e7e5e4] bg-white p-5">
            {userEmail ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-[#fafaf9] px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#b8860b]/10">
                    <User className="h-4 w-4 text-[#b8860b]" />
                  </div>
                  <span className="truncate text-sm font-medium text-[#1c1917]">
                    {userEmail}
                  </span>
                </div>
                <Button
                  onClick={() => {
                    handleLinkClick();
                    onSignOut?.();
                  }}
                  variant="outline"
                  className={cn(
                    "w-full justify-center gap-2 border-[#e7e5e4] py-5 text-[15px] font-medium text-[#57534e]",
                    "transition-all duration-300",
                    "hover:bg-[#f5f5f4] hover:text-[#1c1917]"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            ) : cta ? (
              <Link href={cta.href} onClick={handleLinkClick} className="block">
                <Button
                  className={cn(
                    "w-full justify-center gap-2 bg-[#b8860b] py-5 text-[15px] font-medium text-white",
                    "transition-all duration-300",
                    "hover:bg-[#8b6914] hover:shadow-lg hover:shadow-[#b8860b]/20"
                  )}
                >
                  {cta.label}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

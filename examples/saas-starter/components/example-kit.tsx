import Link from "next/link";
import { ArrowRight, Check, ExternalLink, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export type SiteRoute = {
  href: string;
  label: string;
  description: string;
  nav?: boolean;
};

export type SiteConfig = {
  name: string;
  eyebrow: string;
  description: string;
  docsUrl: string;
  githubUrl: string;
  examplesUrl: string;
  routes: SiteRoute[];
};

function ExternalAnchor({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const external = href.startsWith("http");

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function SiteShell({
  site,
  activePath,
  children,
}: {
  site: SiteConfig;
  activePath: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[color:var(--surface-3)]/80 bg-white/88 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 md:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-[1.1rem] border border-[color:var(--surface-3)] bg-[color:var(--accent)]/10 text-[color:var(--accent)] transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
              <Sparkles className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-3)]">
                {site.eyebrow}
              </div>
              <div className="font-[family-name:var(--font-display)] text-[1.2rem] tracking-[-0.03em] text-[color:var(--ink-1)]">
                {site.name}
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {site.routes.filter((route) => route.nav).map((route) => {
              const active = activePath === route.href;

              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                    active
                      ? "bg-[color:var(--accent)]/12 text-[color:var(--accent)]"
                      : "text-[color:var(--ink-2)] hover:bg-white hover:text-[color:var(--ink-1)]"
                  )}
                >
                  {route.label}
                </Link>
              );
            })}
            <a
              href={site.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full px-4 py-2 text-sm font-medium text-[color:var(--ink-2)] transition-colors duration-200 hover:bg-white hover:text-[color:var(--ink-1)]"
            >
              Docs
            </a>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-[color:var(--surface-3)]/80 bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-[color:var(--ink-2)] md:flex-row md:items-center md:justify-between md:px-8">
          <p className="max-w-xl">
            {site.description}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a href={site.githubUrl} target="_blank" rel="noreferrer" className="hover:text-[color:var(--ink-1)]">
              GitHub
            </a>
            <a href={site.docsUrl} target="_blank" rel="noreferrer" className="hover:text-[color:var(--ink-1)]">
              Docs
            </a>
            <a href={site.examplesUrl} target="_blank" rel="noreferrer" className="hover:text-[color:var(--ink-1)]">
              Examples
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PageSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={cn("mx-auto max-w-7xl px-5 md:px-8", className)}>{children}</section>;
}

export function PageHero({
  badge,
  title,
  description,
  actions,
  aside,
}: {
  badge: string;
  title: ReactNode;
  description: string;
  actions: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <PageSection className="relative overflow-hidden py-16 md:py-20">
      <div className="pointer-events-none absolute inset-0 grid-wash opacity-60" />
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)] lg:items-start">
        <div className="motion-rise">
          <div className="signal-pill">{badge}</div>
          <h1 className="mt-6 max-w-4xl font-[family-name:var(--font-display)] text-[clamp(2.7rem,5vw,5.25rem)] leading-[0.94] tracking-[-0.055em] text-[color:var(--ink-1)]">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-[1.05rem] leading-8 text-[color:var(--ink-2)] md:text-[1.12rem]">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">{actions}</div>
        </div>

        {aside ? <div className="motion-rise lg:pt-8">{aside}</div> : null}
      </div>
    </PageSection>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const shared =
    "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5";
  const variants = {
    primary:
      "bg-[color:var(--accent)] text-white shadow-[0_16px_38px_-22px_color-mix(in_srgb,var(--accent)_70%,transparent)] hover:bg-[color:color-mix(in_srgb,var(--accent)_88%,black)]",
    secondary:
      "border border-[color:var(--surface-3)] bg-white text-[color:var(--ink-1)] hover:border-[color:var(--accent)]/35 hover:text-[color:var(--accent)]",
    ghost:
      "text-[color:var(--ink-2)] hover:bg-white hover:text-[color:var(--ink-1)]",
  } as const;

  return (
    <ExternalAnchor href={href} className={cn(shared, variants[variant], className)}>
      <span>{children}</span>
      <ArrowRight className="size-4" />
    </ExternalAnchor>
  );
}

export function Surface({
  children,
  className,
  strong = false,
}: {
  children: ReactNode;
  className?: string;
  strong?: boolean;
}) {
  return (
    <div className={cn(strong ? "soft-panel-strong" : "soft-panel", className)}>{children}</div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <div className="signal-pill">{eyebrow}</div>
      <h2 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.25rem)] leading-[0.96] tracking-[-0.045em]">
        {title}
      </h2>
      <p className="mt-4 text-[1rem] leading-7 text-[color:var(--ink-2)]">{description}</p>
    </div>
  );
}

export function FeatureGrid({
  items,
}: {
  items: Array<{ title: string; description: string; icon: LucideIcon; tag?: string }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Surface key={item.title} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex size-11 items-center justify-center rounded-[1rem] bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
                <Icon className="size-5" />
              </div>
              {item.tag ? (
                <span className="rounded-full bg-[color:var(--surface-1)] px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--ink-3)]">
                  {item.tag}
                </span>
              ) : null}
            </div>
            <h3 className="mt-6 text-lg font-semibold tracking-[-0.02em] text-[color:var(--ink-1)]">
              {item.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[color:var(--ink-2)]">{item.description}</p>
          </Surface>
        );
      })}
    </div>
  );
}

export function RouteRail({
  routes,
}: {
  routes: Array<{ href: string; label: string; description: string }>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className="group rounded-[1.35rem] border border-[color:var(--surface-3)] bg-white/85 p-5 shadow-[0_10px_24px_-24px_rgba(15,23,42,0.65)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--accent)]/25 hover:shadow-[0_20px_42px_-26px_rgba(37,99,235,0.28)]"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold text-[color:var(--ink-1)]">{route.label}</span>
            <ArrowRight className="size-4 text-[color:var(--ink-3)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[color:var(--accent)]" />
          </div>
          <p className="mt-3 text-sm leading-6 text-[color:var(--ink-2)]">{route.description}</p>
        </Link>
      ))}
    </div>
  );
}

export function FlowSteps({
  steps,
}: {
  steps: Array<{ title: string; description: string }>;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {steps.map((step, index) => (
        <Surface key={step.title} className="p-5" strong={index === 1}>
          <div className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
            Step {index + 1}
          </div>
          <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-[color:var(--ink-1)]">
            {step.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-[color:var(--ink-2)]">{step.description}</p>
        </Surface>
      ))}
    </div>
  );
}

export function StatGrid({
  items,
}: {
  items: Array<{ label: string; value: string; detail: string }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <Surface key={item.label} className="p-5">
          <div className="text-sm font-medium text-[color:var(--ink-3)]">{item.label}</div>
          <div className="metric-value mt-5 text-[color:var(--ink-1)]">{item.value}</div>
          <p className="mt-3 text-sm leading-6 text-[color:var(--ink-2)]">{item.detail}</p>
        </Surface>
      ))}
    </div>
  );
}

export function UsageBar({
  label,
  used,
  total,
  detail,
}: {
  label: string;
  used: number;
  total: number;
  detail: string;
}) {
  const percentage = total === 0 ? 0 : Math.min(100, Math.round((used / total) * 100));

  return (
    <div className="rounded-[1.15rem] border border-[color:var(--surface-3)] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-[color:var(--ink-1)]">{label}</div>
          <div className="mt-1 text-sm text-[color:var(--ink-2)]">{detail}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold tracking-[-0.03em] text-[color:var(--ink-1)]">
            {used.toLocaleString()} / {total.toLocaleString()}
          </div>
          <div className="text-xs uppercase tracking-[0.14em] text-[color:var(--ink-3)]">{percentage}% used</div>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[color:var(--surface-2)]">
        <div
          className={cn(
            "h-full rounded-full bg-[color:var(--accent)] transition-[width] duration-300",
            percentage > 90 && "bg-[color:var(--danger)]",
            percentage > 70 && percentage <= 90 && "bg-[color:var(--warning)]"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  secondary,
}: {
  title: string;
  description: string;
  action: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <Surface className="p-8" strong>
      <div className="signal-pill">Next Step</div>
      <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[color:var(--ink-1)]">
        {title}
      </h3>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--ink-2)]">{description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        {action}
        {secondary}
      </div>
    </Surface>
  );
}

export function StatusCard({
  label,
  value,
  tone = "default",
  description,
}: {
  label: string;
  value: string;
  tone?: "default" | "good" | "warning";
  description: string;
}) {
  const toneClass = {
    default: "bg-[color:var(--surface-1)] text-[color:var(--ink-2)]",
    good: "bg-[color:var(--success)]/12 text-[color:var(--success)]",
    warning: "bg-[color:var(--warning)]/14 text-[color:color-mix(in_srgb,var(--warning)_80%,black)]",
  } as const;

  return (
    <Surface className="p-5">
      <div className="text-sm font-medium text-[color:var(--ink-3)]">{label}</div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--ink-1)]">{value}</div>
        <span className={cn("rounded-full px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.12em]", toneClass[tone])}>
          {tone}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[color:var(--ink-2)]">{description}</p>
    </Surface>
  );
}

export function LoadingCard({ label }: { label: string }) {
  return (
    <Surface className="p-5">
      <div className="h-3 w-28 animate-pulse rounded-full bg-[color:var(--surface-2)]" />
      <div className="mt-4 h-8 w-32 animate-pulse rounded-xl bg-[color:var(--surface-2)]" />
      <div className="mt-4 h-2 w-full animate-pulse rounded-full bg-[color:var(--surface-2)]" />
      <div className="mt-2 text-xs uppercase tracking-[0.14em] text-[color:var(--ink-3)]">{label}</div>
    </Surface>
  );
}

export function CheckList({
  items,
}: {
  items: string[];
}) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-6 text-[color:var(--ink-2)]">
          <span className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
            <Check className="size-3.5" />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LinkRow({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  const external = href.startsWith("http");

  return (
    <ExternalAnchor
      href={href}
      className="group flex items-center justify-between gap-4 rounded-[1.15rem] border border-[color:var(--surface-3)] bg-white px-4 py-3 transition-all duration-200 hover:border-[color:var(--accent)]/25"
    >
      <div>
        <div className="text-sm font-semibold text-[color:var(--ink-1)]">{label}</div>
        <div className="mt-1 text-sm text-[color:var(--ink-2)]">{description}</div>
      </div>
      {external ? (
        <ExternalLink className="size-4 text-[color:var(--ink-3)] group-hover:text-[color:var(--accent)]" />
      ) : (
        <ArrowRight className="size-4 text-[color:var(--ink-3)] group-hover:text-[color:var(--accent)]" />
      )}
    </ExternalAnchor>
  );
}

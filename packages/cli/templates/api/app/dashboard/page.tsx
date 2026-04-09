"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ButtonLink,
  EmptyState,
  PageSection,
  SectionHeading,
  SiteShell,
  StatusCard,
  Surface,
  UsageBar,
} from "@/components/example-kit";
import { getPlanLimits } from "@/lib/api-keys";
import { siteConfig } from "@/lib/site";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[color:var(--surface-0)]" />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "free";
  const limits = getPlanLimits(plan);

  return (
    <SiteShell site={siteConfig} activePath="/dashboard">
      <PageSection className="py-14 md:py-18">
        <SectionHeading
          eyebrow="Dashboard"
          title="Account state explains the next operational step."
          description="After checkout the dashboard highlights plan state, quota, and the recommended next action: create a key and make a request."
        />
      </PageSection>

      <PageSection className="pb-12">
        {plan === "free" ? (
          <EmptyState
            title="No paid API workspace yet."
            description="A new developer landing here should know exactly what is missing: they have not chosen a paid plan, so they have the base quota and no clear production path yet."
            action={<ButtonLink href="/pricing">View Pricing</ButtonLink>}
            secondary={
              <ButtonLink href="/api-keys" variant="secondary">
                Explore API Keys
              </ButtonLink>
            }
          />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <StatusCard
                label="Workspace plan"
                value={plan}
                tone="good"
                description="Plan context is also injected into protected API requests by middleware."
              />
              <StatusCard
                label="Monthly quota"
                value={limits.monthly.toLocaleString()}
                description="This is what `/api/v1/usage` reports back after the first authenticated request."
              />
              <StatusCard
                label="Rate limit"
                value={`${limits.rate}/min`}
                tone="warning"
                description="Use this to validate upgrade messaging and per-tier throughput copy."
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <Surface className="p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--ink-3)]">Usage preview</div>
                <div className="mt-6 space-y-4">
                  <UsageBar
                    label="Monthly calls"
                    used={Math.max(12, Math.round(limits.monthly * 0.42))}
                    total={limits.monthly}
                    detail="Illustrative monthly consumption shown as a post-checkout starting point."
                  />
                  <UsageBar
                    label="Burst traffic"
                    used={Math.max(3, Math.round(limits.rate * 0.36))}
                    total={limits.rate}
                    detail="A quick proxy for how the plan feels under load."
                  />
                </div>
              </Surface>

              <Surface className="p-6" strong>
                <div className="signal-pill">Quick actions</div>
                <div className="mt-6 flex flex-col gap-3">
                  <ButtonLink href={`/api-keys?plan=${plan}`}>Create API Key</ButtonLink>
                  <ButtonLink href={`/usage?plan=${plan}`} variant="secondary">
                    Review Usage
                  </ButtonLink>
                  <ButtonLink href="/pricing" variant="ghost">
                    Compare plans
                  </ButtonLink>
                </div>
              </Surface>
            </div>
          </div>
        )}
      </PageSection>
    </SiteShell>
  );
}

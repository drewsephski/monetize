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
import { siteConfig } from "@/lib/site";

const creditsByPlan: Record<string, number> = {
  starter: 25,
  studio: 500,
  scale: 2000,
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[color:var(--surface-0)]" />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "starter";
  const credits = Number(searchParams.get("credits") || creditsByPlan[plan] || 25);

  return (
    <SiteShell site={siteConfig} activePath="/dashboard">
      <PageSection className="py-14 md:py-18">
        <SectionHeading
          eyebrow="Dashboard"
          title="Credit state and next actions stay in the open."
          description="After checkout or top-up, the dashboard confirms the active plan, available credits, and which screen the developer should visit next."
        />
      </PageSection>

      <PageSection className="pb-12">
        {plan === "starter" && credits <= 25 ? (
          <EmptyState
            title="You are still on the starter credit lane."
            description="This empty state teaches the developer that they have limited initial credits and should open pricing or usage to inspect the refill and paywall experience."
            action={<ButtonLink href="/pricing">View Pricing</ButtonLink>}
            secondary={
              <ButtonLink href="/usage" variant="secondary">
                Spend starter credits
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
                description="Plan context determines the baseline monthly credit pool and refill messaging."
              />
              <StatusCard
                label="Available credits"
                value={credits.toLocaleString()}
                description="This balance is intentionally front-and-center so the billing state feels operational."
              />
              <StatusCard
                label="Top-up lane"
                value="Enabled"
                tone="warning"
                description="Use the usage page to test the low-credit warning and top-up flow."
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <Surface className="p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--ink-3)]">Usage posture</div>
                <div className="mt-6 space-y-4">
                  <UsageBar
                    label="Credits remaining"
                    used={(creditsByPlan[plan] || 25) - credits + 1}
                    total={creditsByPlan[plan] || 25}
                    detail="A visual proxy for how much of the current monthly pool has already been spent."
                  />
                  <UsageBar
                    label="Prompt depth"
                    used={plan === "scale" ? 8 : plan === "studio" ? 5 : 2}
                    total={8}
                    detail="A simple entitlement signal tied to the active subscription tier."
                  />
                </div>
              </Surface>

              <Surface className="p-6" strong>
                <div className="signal-pill">Quick actions</div>
                <div className="mt-6 flex flex-col gap-3">
                  <ButtonLink href={`/usage?plan=${plan}&credits=${credits}`}>Use credits</ButtonLink>
                  <ButtonLink href="/pricing" variant="secondary">
                    Compare plans
                  </ButtonLink>
                  <ButtonLink href="/" variant="ghost">
                    Review overview
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

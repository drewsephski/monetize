"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ButtonLink,
  EmptyState,
  LoadingCard,
  PageSection,
  SectionHeading,
  SiteShell,
  StatusCard,
  Surface,
  UsageBar,
} from "@/components/example-kit";
import { siteConfig } from "@/lib/site";

type DashboardState = {
  plan: string;
  status: "trialing" | "active" | "starter";
  periodLabel: string;
  seats: { used: number; total: number };
  events: { used: number; total: number };
  automations: { used: number; total: number };
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
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<DashboardState | null>(null);

  useEffect(() => {
    const plan = searchParams.get("plan") || "starter";

    async function loadState() {
      try {
        const response = await fetch(`/api/billing/subscription?plan=${plan}`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load dashboard state.");
        }

        setState(payload);
      } catch {
        setState(null);
      } finally {
        setLoading(false);
      }
    }

    const timer = window.setTimeout(loadState, 420);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchParams]);

  return (
    <SiteShell site={siteConfig} activePath="/dashboard">
      <PageSection className="py-14 md:py-18">
        <SectionHeading
          eyebrow="Dashboard"
          title="The post-checkout state explains itself."
          description="This screen is designed to answer the first developer questions quickly: what plan is active, what did it unlock, and which action should happen next."
        />
      </PageSection>

      <PageSection className="pb-12">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            <LoadingCard label="Subscription state" />
            <LoadingCard label="Usage state" />
            <LoadingCard label="Next action" />
          </div>
        ) : state?.plan === "starter" || !state ? (
          <EmptyState
            title="No paid subscription yet."
            description="This empty state is intentional. A first-time developer should understand immediately that they have not completed checkout yet, and they should see the shortest path to do it."
            action={<ButtonLink href="/pricing">View Pricing</ButtonLink>}
            secondary={
              <ButtonLink href="/pricing?intent=checkout" variant="secondary">
                Test Checkout
              </ButtonLink>
            }
          />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <StatusCard
                label="Subscription status"
                value={state.plan}
                tone="good"
                description={`State: ${state.status}. ${state.periodLabel}`}
              />
              <StatusCard
                label="Entitlement pack"
                value="Advanced"
                description="Growth unlocks the stronger feature set and customer portal lane in this example."
              />
              <StatusCard
                label="Quick action"
                value="Manage"
                tone="warning"
                description="Use the manage billing action to review portal flow copy and renewal messaging."
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <Surface className="p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--ink-3)]">Usage overview</div>
                <div className="mt-6 space-y-4">
                  <UsageBar
                    label="Seats"
                    used={state.seats.used}
                    total={state.seats.total}
                    detail="Capacity unlocked by the active subscription."
                  />
                  <UsageBar
                    label="Events"
                    used={state.events.used}
                    total={state.events.total}
                    detail="Illustrative monthly throughput tied to the current plan."
                  />
                  <UsageBar
                    label="Automations"
                    used={state.automations.used}
                    total={state.automations.total}
                    detail="A simple entitlement signal for premium workflow capacity."
                  />
                </div>
              </Surface>

              <Surface className="p-6" strong>
                <div className="signal-pill">Quick actions</div>
                <div className="mt-6 flex flex-col gap-3">
                  <ButtonLink href="/pricing">Upgrade plan</ButtonLink>
                  <ButtonLink href="/api/billing/portal" variant="secondary">
                    Manage billing
                  </ButtonLink>
                  <ButtonLink href="/" variant="ghost">
                    Review overview
                  </ButtonLink>
                </div>
                <p className="mt-6 text-sm leading-7 text-[color:var(--ink-2)]">
                  If you land here from sandbox checkout, compare the tone of this state against the empty state above. That transition is the core onboarding payoff.
                </p>
              </Surface>
            </div>
          </div>
        )}
      </PageSection>
    </SiteShell>
  );
}

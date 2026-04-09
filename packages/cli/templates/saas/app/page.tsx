import { BarChart3, CreditCard, Lock, ShieldCheck } from "lucide-react";
import {
  ButtonLink,
  FeatureGrid,
  FlowSteps,
  LinkRow,
  PageHero,
  PageSection,
  RouteRail,
  SectionHeading,
  SiteShell,
  StatGrid,
  Surface,
} from "@/components/example-kit";
import { featureItems, flowSteps, siteConfig } from "../lib/site";

export default function HomePage() {
  return (
    <SiteShell site={siteConfig} activePath="/">
      <PageHero
        badge="SaaS billing example"
        title={
          <>
            Understand the billing model
            <br />
            before you read a line of code.
          </>
        }
        description="This app demonstrates a polished subscription flow for a SaaS product: plan selection, entitlement messaging, sandbox checkout, and a dashboard that tells the developer what happened next."
        actions={
          <>
            <ButtonLink href="/pricing">View Pricing</ButtonLink>
            <ButtonLink href="/dashboard" variant="secondary">
              Go to Dashboard
            </ButtonLink>
            <ButtonLink href="/pricing?intent=checkout" variant="ghost">
              Test Checkout
            </ButtonLink>
          </>
        }
        aside={
          <Surface className="overflow-hidden p-6" strong>
            <div className="signal-pill">What this demonstrates</div>
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.2rem] border border-[color:var(--surface-3)] bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
                    <CreditCard className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[color:var(--ink-1)]">Structured pricing</div>
                    <div className="mt-1 text-sm text-[color:var(--ink-2)]">A real plan hierarchy with obvious upgrade language.</div>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.2rem] border border-[color:var(--surface-3)] bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
                    <Lock className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[color:var(--ink-1)]">Entitlements</div>
                    <div className="mt-1 text-sm text-[color:var(--ink-2)]">Copy that teaches what each plan unlocks instead of listing vague bullets.</div>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.2rem] border border-[color:var(--surface-3)] bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[color:var(--ink-1)]">Sandbox-first</div>
                    <div className="mt-1 text-sm text-[color:var(--ink-2)]">No broken redirect path when Stripe is not wired yet.</div>
                  </div>
                </div>
              </div>
            </div>
          </Surface>
        }
      />

      <PageSection className="pb-8">
        <StatGrid
          items={[
            {
              label: "Primary routes",
              value: "3",
              detail: "Overview, pricing, and dashboard are all reachable from first render.",
            },
            {
              label: "Time to first flow",
              value: "<10m",
              detail: "Sandbox mode keeps the first checkout and state transition local.",
            },
            {
              label: "Dead ends",
              value: "0",
              detail: "Every page points to the next useful action instead of stopping at placeholder copy.",
            },
          ]}
        />
      </PageSection>

      <PageSection className="py-10">
        <SectionHeading
          eyebrow="Feature surface"
          title="Four product concerns are visible immediately."
          description="A developer opening the app should understand the core billing primitives before they open the source: subscriptions, entitlements, sandbox behavior, and the product shell around them."
        />
        <div className="mt-8">
          <FeatureGrid items={featureItems} />
        </div>
      </PageSection>

      <PageSection className="py-10">
        <SectionHeading
          eyebrow="Major routes"
          title="Every important screen is one click away."
          description="The route rail mirrors the key surfaces a developer cares about during setup and review."
        />
        <div className="mt-8">
          <RouteRail routes={siteConfig.routes} />
        </div>
      </PageSection>

      <PageSection className="py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div>
            <SectionHeading
              eyebrow="How this works"
              title="A tight billing flow, not a scattered demo."
              description="The overview teaches the billing story in the same order the developer will experience it."
            />
            <div className="mt-8">
              <FlowSteps steps={flowSteps} />
            </div>
          </div>

          <Surface className="p-6">
            <div className="signal-pill">Inspect next</div>
            <div className="mt-6 space-y-3">
              <LinkRow href="/pricing" label="Pricing page" description="Inspect the most-popular plan, comparison rows, and sandbox checkout trigger." />
              <LinkRow href="/dashboard" label="Dashboard" description="See how the empty state changes after a sandbox checkout." />
              <LinkRow href={siteConfig.docsUrl} label="Central docs" description="Open the shared docs destination used by the generated apps." />
            </div>
            <div className="section-rule mt-6" />
            <div className="mt-6 rounded-[1.2rem] border border-[color:var(--surface-3)] bg-[color:var(--surface-1)] p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-white text-[color:var(--accent)]">
                  <BarChart3 className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[color:var(--ink-1)]">Suggested first action</div>
                  <div className="mt-1 text-sm text-[color:var(--ink-2)]">Open `/pricing`, trigger sandbox checkout, then verify the dashboard state change.</div>
                </div>
              </div>
            </div>
          </Surface>
        </div>
      </PageSection>
    </SiteShell>
  );
}

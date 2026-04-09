import { Coins, Sparkles, WandSparkles } from "lucide-react";
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
import { featureItems, flowSteps, siteConfig } from "@/lib/site";

export default function HomePage() {
  return (
    <SiteShell site={siteConfig} activePath="/">
      <PageHero
        badge="AI credits example"
        title={
          <>
            The paywall and the
            <br />
            product should tell the same story.
          </>
        }
        description="This example demonstrates prepaid AI usage with a polished product shell: recurring plans, credit consumption, low-balance warnings, and a sandbox top-up path that turns into a clear dashboard state."
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
          <Surface className="p-6" strong>
            <div className="signal-pill">What you can validate</div>
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.2rem] border border-[color:var(--surface-3)] bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
                    <Coins className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[color:var(--ink-1)]">Visible credit ledger</div>
                    <div className="mt-1 text-sm text-[color:var(--ink-2)]">Credits are surfaced as product state, not just internal counters.</div>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.2rem] border border-[color:var(--surface-3)] bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
                    <WandSparkles className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[color:var(--ink-1)]">Generation paywall</div>
                    <div className="mt-1 text-sm text-[color:var(--ink-2)]">Low-credit and zero-credit states are visible and teach the next action.</div>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.2rem] border border-[color:var(--surface-3)] bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[color:var(--ink-1)]">Top-up loop</div>
                    <div className="mt-1 text-sm text-[color:var(--ink-2)]">Sandbox checkout feeds directly back into the app with more credits.</div>
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
              value: "4",
              detail: "Overview, pricing, dashboard, and usage all exist and guide the first-run journey.",
            },
            {
              label: "Sandbox top-up",
              value: "ready",
              detail: "Checkout stays local and returns the developer to the product immediately.",
            },
            {
              label: "State clarity",
              value: "high",
              detail: "Low balance, no balance, and post-top-up states are all intentionally designed.",
            },
          ]}
        />
      </PageSection>

      <PageSection className="py-10">
        <SectionHeading
          eyebrow="Feature surface"
          title="Credits are treated as product UX, not just billing data."
          description="The example keeps planing, usage, entitlements, and sandbox behavior connected, so the billing model feels integrated into the AI experience."
        />
        <div className="mt-8">
          <FeatureGrid items={featureItems} />
        </div>
      </PageSection>

      <PageSection className="py-10">
        <SectionHeading
          eyebrow="Major routes"
          title="The product map stays simple."
          description="Developers can move from overview to pricing to usage states without hitting a placeholder screen."
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
              title="The first ten minutes tell the whole billing story."
              description="You can pick a plan, generate usage, hit the credit warning, and top up without leaving the product or hunting for missing routes."
            />
            <div className="mt-8">
              <FlowSteps steps={flowSteps} />
            </div>
          </div>
          <Surface className="p-6">
            <div className="signal-pill">Inspect next</div>
            <div className="mt-6 space-y-3">
              <LinkRow href="/pricing" label="Pricing page" description="Compare monthly plans, top-up language, and checkout entry points." />
              <LinkRow href="/usage" label="Usage loop" description="Spend credits, hit warnings, and top up in one screen." />
              <LinkRow href="/dashboard" label="Dashboard" description="Review the before-and-after account state around a top-up." />
            </div>
          </Surface>
        </div>
      </PageSection>
    </SiteShell>
  );
}

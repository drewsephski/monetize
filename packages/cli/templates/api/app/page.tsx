import { Activity, DatabaseZap, KeyRound } from "lucide-react";
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
        badge="API billing example"
        title={
          <>
            Usage billing that feels like a
            <br />
            real API product on day one.
          </>
        }
        description="This example demonstrates the developer product loop for an API: plan selection, sandbox checkout, API key creation, protected endpoints, and a usage view that explains the quota model without forcing extra setup."
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
            <div className="signal-pill">Fast path</div>
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.2rem] border border-[color:var(--surface-3)] bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
                    <DatabaseZap className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[color:var(--ink-1)]">Protected endpoints</div>
                    <div className="mt-1 text-sm text-[color:var(--ink-2)]">Middleware accepts sandbox keys and annotates requests with plan context.</div>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.2rem] border border-[color:var(--surface-3)] bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
                    <KeyRound className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[color:var(--ink-1)]">Key creation flow</div>
                    <div className="mt-1 text-sm text-[color:var(--ink-2)]">The `/api-keys` route teaches the auth header contract with a concrete curl example.</div>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.2rem] border border-[color:var(--surface-3)] bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
                    <Activity className="size-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[color:var(--ink-1)]">Usage reporting</div>
                    <div className="mt-1 text-sm text-[color:var(--ink-2)]">Quota messaging is visible as product UI, not buried inside code comments.</div>
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
              value: "5",
              detail: "Overview, pricing, dashboard, API keys, and usage all exist and connect to each other.",
            },
            {
              label: "Sandbox auth",
              value: "ready",
              detail: "Any generated `sandbox_key_*` credential passes middleware in local mode.",
            },
            {
              label: "First request",
              value: "<5m",
              detail: "Pricing to key creation to curl works without touching a database.",
            },
          ]}
        />
      </PageSection>

      <PageSection className="py-10">
        <SectionHeading
          eyebrow="Feature surface"
          title="The billing story matches the API story."
          description="The overview keeps planing, auth, usage, and sandbox behavior visible at the same time so the product feels coherent."
        />
        <div className="mt-8">
          <FeatureGrid items={featureItems} />
        </div>
      </PageSection>

      <PageSection className="py-10">
        <SectionHeading
          eyebrow="Major routes"
          title="The product map stays legible."
          description="A developer should know exactly where to go next after checkout, after key creation, and after the first request."
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
              title="The product loop stays inside the app."
              description="Checkout, key generation, and usage validation all connect without dumping the developer into an unfinished screen."
            />
            <div className="mt-8">
              <FlowSteps steps={flowSteps} />
            </div>
          </div>
          <Surface className="p-6">
            <div className="signal-pill">Inspect next</div>
            <div className="mt-6 space-y-3">
              <LinkRow href="/pricing" label="Pricing page" description="Check plan language, limits, and the default Pro checkout path." />
              <LinkRow href="/api-keys" label="API key flow" description="Generate a key and copy a ready-made curl example." />
              <LinkRow href="/usage" label="Usage page" description="See how quota and endpoint counts are presented after auth." />
            </div>
          </Surface>
        </div>
      </PageSection>
    </SiteShell>
  );
}

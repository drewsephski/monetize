"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, Loader2 } from "lucide-react";
import {
  ButtonLink,
  CheckList,
  PageSection,
  SectionHeading,
  SiteShell,
  Surface,
} from "@/components/example-kit";
import { comparisonRows, plans, siteConfig } from "@/lib/site";

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[color:var(--surface-0)]" />}>
      <PricingContent />
    </Suspense>
  );
}

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const preferredPlan = useMemo(() => searchParams.get("intent") === "checkout" ? "growth" : null, [searchParams]);

  async function startCheckout(planId: string) {
    setLoadingPlan(planId);
    setError(null);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to start checkout.");
      }

      router.push(payload.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unable to start checkout.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <SiteShell site={siteConfig} activePath="/pricing">
      <PageSection className="py-14 md:py-18">
        <SectionHeading
          eyebrow="Pricing"
          title="A pricing surface that feels ready to ship."
          description="The cards below are structured for product understanding first: clear plan story, highlighted default option, feature comparisons, and a checkout action that stays local in sandbox mode."
        />
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/dashboard" variant="secondary">
            Go to Dashboard
          </ButtonLink>
          <ButtonLink href="/" variant="ghost">
            Back to Overview
          </ButtonLink>
        </div>
      </PageSection>

      <PageSection className="pb-8">
        {error ? (
          <div className="rounded-[1.2rem] border border-[color:var(--danger)]/30 bg-[color:var(--danger)]/8 px-5 py-4 text-sm text-[color:color-mix(in_srgb,var(--danger)_88%,black)]">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-3">
          {plans.map((plan) => {
            const loading = loadingPlan === plan.id;
            const highlighted = plan.mostPopular || preferredPlan === plan.id;

            return (
              <Surface key={plan.id} className="flex h-full flex-col p-6" strong={highlighted}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--ink-3)]">
                      {plan.name}
                    </div>
                    <div className="mt-4 text-5xl font-[family-name:var(--font-display)] tracking-[-0.05em] text-[color:var(--ink-1)]">
                      {plan.price}
                    </div>
                    <div className="mt-2 text-sm text-[color:var(--ink-3)]">{plan.cadence}</div>
                  </div>
                  {highlighted ? (
                    <span className="signal-pill">Most Popular</span>
                  ) : null}
                </div>

                <p className="mt-5 text-sm leading-7 text-[color:var(--ink-2)]">{plan.summary}</p>

                <div className="mt-6">
                  <CheckList items={plan.highlights} />
                </div>

                <button
                  type="button"
                  onClick={() => startCheckout(plan.id)}
                  disabled={loading}
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[color:color-mix(in_srgb,var(--accent)_88%,black)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Starting checkout
                    </>
                  ) : (
                    <>
                      {plan.cta}
                      <ArrowUpRight className="size-4" />
                    </>
                  )}
                </button>
              </Surface>
            );
          })}
        </div>
      </PageSection>

      <PageSection className="py-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Surface className="overflow-hidden p-6">
            <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--ink-3)]">Feature comparison</div>
            <div className="mt-5 overflow-hidden rounded-[1.2rem] border border-[color:var(--surface-3)]">
              <table className="w-full border-collapse text-left">
                <thead className="bg-[color:var(--surface-1)] text-sm text-[color:var(--ink-3)]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Capability</th>
                    <th className="px-4 py-3 font-semibold">Starter</th>
                    <th className="px-4 py-3 font-semibold">Growth</th>
                    <th className="px-4 py-3 font-semibold">Scale</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-[color:var(--ink-2)]">
                  {comparisonRows.map((row) => (
                    <tr key={row[0]} className="border-t border-[color:var(--surface-3)] bg-white">
                      {row.map((cell) => (
                        <td key={cell} className="px-4 py-3">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Surface>

          <Surface className="p-6" strong>
            <div className="signal-pill">How to validate</div>
            <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[color:var(--ink-1)]">
              Smooth upgrade flow
            </h3>
            <p className="mt-4 text-sm leading-7 text-[color:var(--ink-2)]">
              In sandbox mode the checkout action returns to the dashboard with an upgraded plan query, so the developer can validate the state change immediately.
            </p>
            <div className="section-rule mt-6" />
            <p className="mt-6 text-sm leading-7 text-[color:var(--ink-2)]">
              Suggested path: click Growth, land on the dashboard, review entitlement messaging, then come back to pricing to compare against Scale.
            </p>
          </Surface>
        </div>
      </PageSection>
    </SiteShell>
  );
}

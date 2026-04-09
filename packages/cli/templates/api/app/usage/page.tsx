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
  Surface,
  UsageBar,
} from "@/components/example-kit";
import { siteConfig } from "@/lib/site";

type UsageResponse = {
  success: boolean;
  data: {
    totalCalls: number;
    remaining: number;
    limit: number;
    byEndpoint: Array<{ endpoint: string; method: string; count: number }>;
  };
};

export default function UsagePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[color:var(--surface-0)]" />}>
      <UsageContent />
    </Suspense>
  );
}

function UsageContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "pro";
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<UsageResponse["data"] | null>(null);

  useEffect(() => {
    async function loadUsage() {
      const response = await fetch("/api/v1/usage", {
        headers: {
          "x-api-key": `sandbox_key_${plan}_preview`,
        },
      });

      const payload: UsageResponse = await response.json();
      setUsage(payload.data);
      setLoading(false);
    }

    void loadUsage();
  }, [plan]);

  return (
    <SiteShell site={siteConfig} activePath="/usage">
      <PageSection className="py-14 md:py-18">
        <SectionHeading
          eyebrow="Usage"
          title="Quota and endpoint data should feel like product UI."
          description="Usage billing only works when developers can see what happened after requests hit the API. This page surfaces quota, remaining balance, and the top endpoints clearly."
        />
      </PageSection>

      <PageSection className="pb-12">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            <LoadingCard label="Calls used" />
            <LoadingCard label="Quota remaining" />
            <LoadingCard label="Endpoint mix" />
          </div>
        ) : !usage ? (
          <EmptyState
            title="No usage data yet."
            description="When usage is empty, the page should tell the developer to generate a key and make a request instead of leaving them on a blank screen."
            action={<ButtonLink href="/api-keys">Create API Key</ButtonLink>}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Surface className="p-6">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--ink-3)]">Current period</div>
              <div className="mt-6 space-y-4">
                <UsageBar
                  label="API calls"
                  used={usage.totalCalls}
                  total={usage.limit}
                  detail="Tracked usage from authenticated requests in the current period."
                />
                <UsageBar
                  label="Remaining balance"
                  used={usage.limit - usage.remaining}
                  total={usage.limit}
                  detail="The visible inverse of remaining quota helps explain approaching limits."
                />
              </div>

              <div className="mt-6 overflow-hidden rounded-[1.2rem] border border-[color:var(--surface-3)]">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-[color:var(--surface-1)] text-sm text-[color:var(--ink-3)]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Endpoint</th>
                      <th className="px-4 py-3 font-semibold">Method</th>
                      <th className="px-4 py-3 font-semibold">Calls</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white text-sm text-[color:var(--ink-2)]">
                    {usage.byEndpoint.map((item) => (
                      <tr key={item.endpoint} className="border-t border-[color:var(--surface-3)]">
                        <td className="px-4 py-3">{item.endpoint}</td>
                        <td className="px-4 py-3">{item.method}</td>
                        <td className="px-4 py-3">{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Surface>

            <Surface className="p-6" strong>
              <div className="signal-pill">Next actions</div>
              <div className="mt-6 flex flex-col gap-3">
                <ButtonLink href={`/api-keys?plan=${plan}`}>Generate new key</ButtonLink>
                <ButtonLink href="/pricing" variant="secondary">
                  Compare plans
                </ButtonLink>
                <ButtonLink href="/" variant="ghost">
                  Review overview
                </ButtonLink>
              </div>
            </Surface>
          </div>
        )}
      </PageSection>
    </SiteShell>
  );
}

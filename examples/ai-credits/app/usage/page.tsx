"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import {
  ButtonLink,
  EmptyState,
  PageSection,
  SectionHeading,
  SiteShell,
  Surface,
  UsageBar,
} from "@/components/example-kit";
import { siteConfig, topUpPacks } from "@/lib/site";

const generationCost = 5;

export default function UsagePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[color:var(--surface-0)]" />}>
      <UsageContent />
    </Suspense>
  );
}

function UsageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "studio";
  const initialCredits = Number(searchParams.get("credits") || (plan === "scale" ? 2000 : plan === "studio" ? 500 : 25));
  const [credits, setCredits] = useState(initialCredits);
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastOutput, setLastOutput] = useState<string | null>(null);

  const lowCredits = credits > 0 && credits <= 20;
  const outOfCredits = credits <= 0;
  const generationsLeft = useMemo(() => Math.max(0, Math.floor(credits / generationCost)), [credits]);

  async function generateSample() {
    if (credits < generationCost) {
      return;
    }

    setIsGenerating(true);
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    setCredits((value) => value - generationCost);
    setLastOutput("Structured release notes for a billing launch with entitlement checks and sandbox messaging.");
    setIsGenerating(false);
  }

  async function topUp(packId: string, amount: number) {
    setLoadingPack(packId);

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: plan, credits: amount }),
    });

    const payload = await response.json();
    setLoadingPack(null);
    router.push(payload.url);
  }

  return (
    <SiteShell site={siteConfig} activePath="/usage">
      <PageSection className="py-14 md:py-18">
        <SectionHeading
          eyebrow="Usage"
          title="Spend credits, hit the warning, top up, repeat."
          description="The product loop is intentional here: generation spends credits, low balance changes the tone, and top-up paths stay obvious instead of feeling bolted on."
        />
      </PageSection>

      <PageSection className="pb-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Surface className="p-6">
            <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--ink-3)]">Current balance</div>
            <div className="mt-6 space-y-4">
              <UsageBar
                label="Credits remaining"
                used={initialCredits - credits}
                total={initialCredits}
                detail={`Each generation consumes ${generationCost} credits.`}
              />
              <UsageBar
                label="Generations left"
                used={Math.max(1, Math.floor(initialCredits / generationCost)) - generationsLeft}
                total={Math.max(1, Math.floor(initialCredits / generationCost))}
                detail="An intentionally simple derived value that makes the paywall feel tangible."
              />
            </div>

            {lowCredits ? (
              <div className="mt-6 rounded-[1.2rem] border border-[color:var(--warning)]/35 bg-[color:var(--warning)]/12 p-5 text-sm leading-7 text-[color:color-mix(in_srgb,var(--warning)_80%,black)]">
                Credits are running low. This warning exists so the developer can review the pre-paywall state before the balance fully drains.
              </div>
            ) : null}

            {outOfCredits ? (
              <EmptyState
                title="No credits remaining."
                description="This is the hard paywall state. The only primary action should be a top-up or a plan change, not a dead-end message."
                action={<ButtonLink href="/pricing">View Pricing</ButtonLink>}
                secondary={
                  <ButtonLink href="/dashboard" variant="secondary">
                    Review dashboard
                  </ButtonLink>
                }
              />
            ) : (
              <div className="mt-6 rounded-[1.2rem] border border-[color:var(--surface-3)] bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-[color:var(--ink-1)]">Generation sandbox</div>
                    <div className="mt-1 text-sm text-[color:var(--ink-2)]">Simulate an AI action and watch credits update immediately.</div>
                  </div>
                  <Sparkles className="size-5 text-[color:var(--accent)]" />
                </div>
                <button
                  type="button"
                  onClick={generateSample}
                  disabled={isGenerating}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  {isGenerating ? "Generating" : `Generate (${generationCost} credits)`}
                </button>

                {lastOutput ? (
                  <div className="mt-5 rounded-[1.1rem] border border-[color:var(--surface-3)] bg-[color:var(--surface-1)] p-4 text-sm leading-7 text-[color:var(--ink-1)]">
                    {lastOutput}
                  </div>
                ) : null}
              </div>
            )}
          </Surface>

          <Surface className="p-6" strong>
            <div className="signal-pill">Top up credits</div>
            <div className="mt-5 space-y-3">
              {topUpPacks.map((pack) => (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => topUp(pack.id, pack.credits)}
                  disabled={loadingPack === pack.id}
                  className="flex w-full items-center justify-between gap-4 rounded-[1.1rem] border border-[color:var(--surface-3)] bg-white px-4 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--accent)]/30 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <div>
                    <div className="text-sm font-semibold text-[color:var(--ink-1)]">{pack.label}</div>
                    <div className="mt-1 text-sm text-[color:var(--ink-2)]">{pack.price}</div>
                  </div>
                  {loadingPack === pack.id ? <Loader2 className="size-4 animate-spin text-[color:var(--accent)]" /> : <span className="text-xs uppercase tracking-[0.12em] text-[color:var(--ink-3)]">Top-up</span>}
                </button>
              ))}
            </div>
          </Surface>
        </div>
      </PageSection>
    </SiteShell>
  );
}

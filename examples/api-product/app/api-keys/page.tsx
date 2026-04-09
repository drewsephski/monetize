"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Copy, Terminal } from "lucide-react";
import {
  ButtonLink,
  EmptyState,
  PageSection,
  SectionHeading,
  SiteShell,
  Surface,
} from "@/components/example-kit";
import { createSandboxKey, siteConfig } from "@/lib/site";

export default function ApiKeysPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[color:var(--surface-0)]" />}>
      <ApiKeysContent />
    </Suspense>
  );
}

function ApiKeysContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "pro";
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const curlExample = useMemo(() => {
    const key = apiKey || `sandbox_key_${plan}_preview`;
    return `curl http://localhost:3000/api/v1/status \\\n  -H "x-api-key: ${key}"`;
  }, [apiKey, plan]);

  function generateKey() {
    setApiKey(createSandboxKey(plan));
    setCopied(false);
  }

  async function copyText(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <SiteShell site={siteConfig} activePath="/api-keys">
      <PageSection className="py-14 md:py-18">
        <SectionHeading
          eyebrow="API Keys"
          title="Teach the auth contract where the key is created."
          description="The page does two jobs: it generates a sandbox-safe credential and it shows the exact request shape a developer should copy next."
        />
      </PageSection>

      <PageSection className="pb-12">
        {!apiKey ? (
          <EmptyState
            title="No API key generated yet."
            description="This is the right empty state for a fresh API account. The key action should create a credential immediately and explain that sandbox keys are accepted locally by middleware."
            action={<button type="button" onClick={generateKey} className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5">Generate sandbox key</button>}
            secondary={
              <ButtonLink href="/pricing" variant="secondary">
                Review plan limits
              </ButtonLink>
            }
          />
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Surface className="p-6" strong={Boolean(apiKey)}>
            <div className="signal-pill">Generated key</div>
            <div className="mt-6 rounded-[1.2rem] border border-[color:var(--surface-3)] bg-white p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-[color:var(--ink-3)]">Current credential</div>
              <div className="mt-3 break-all text-sm font-semibold text-[color:var(--ink-1)]">
                {apiKey || "Generate a sandbox key to start testing protected routes."}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={generateKey} className="rounded-full border border-[color:var(--surface-3)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--ink-1)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--accent)]/30">
                Regenerate key
              </button>
              {apiKey ? (
                <button type="button" onClick={() => copyText(apiKey)} className="rounded-full border border-[color:var(--surface-3)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--ink-1)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--accent)]/30">
                  {copied ? "Copied" : "Copy key"}
                </button>
              ) : null}
            </div>
          </Surface>

          <Surface className="p-6">
            <div className="signal-pill">Quick facts</div>
            <p className="mt-5 text-sm leading-7 text-[color:var(--ink-2)]">
              Sandbox keys use the `sandbox_key_*` prefix. Middleware reads the embedded plan segment so local requests can demonstrate tiered rate limits and quota copy without a database.
            </p>
          </Surface>
        </div>

        <Surface className="mt-6 p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
              <Terminal className="size-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[color:var(--ink-1)]">First request</div>
              <div className="mt-1 text-sm text-[color:var(--ink-2)]">Copy this curl command and hit a protected route immediately.</div>
            </div>
          </div>
          <div className="mt-5 rounded-[1.2rem] border border-[color:var(--surface-3)] bg-[color:var(--surface-1)] p-5">
            <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-7 text-[color:var(--ink-1)]">{curlExample}</pre>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => copyText(curlExample)} className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied curl command" : "Copy curl command"}
            </button>
            <ButtonLink href={`/usage?plan=${plan}`} variant="secondary">
              Review Usage
            </ButtonLink>
          </div>
        </Surface>
      </PageSection>
    </SiteShell>
  );
}

export function parseSandboxKey(apiKey: string | null) {
  if (!apiKey || !apiKey.startsWith("sandbox_key_")) {
    return null;
  }

  const [, , plan = "free"] = apiKey.split("_");

  return {
    userId: "sandbox-user",
    plan,
    keyId: apiKey,
  };
}

export function getPlanLimits(plan: string) {
  const lookup: Record<string, { monthly: number; rate: number }> = {
    free: { monthly: 100, rate: 10 },
    pro: { monthly: 10000, rate: 100 },
    enterprise: { monthly: 100000, rate: 1000 },
  };

  return lookup[plan] || lookup.free;
}

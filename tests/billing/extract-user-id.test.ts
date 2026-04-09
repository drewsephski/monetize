import { describe, expect, it } from "bun:test";
import type { NextRequest } from "next/server";
import { extractUserId } from "@/lib/billing/middleware";

function makeRequest(headers: Record<string, string> = {}): NextRequest {
  return { headers: new Headers(headers) } as unknown as NextRequest;
}

describe("extractUserId", () => {
  it("returns user id from Better Auth session", async () => {
    const request = makeRequest();
    const userId = await extractUserId(request, {
      getSession: async () => ({ user: { id: "user_from_session" } }),
    });

    expect(userId).toBe("user_from_session");
  });

  it("returns null when session is missing and header fallback is disabled", async () => {
    const request = makeRequest({ "x-user-id": "header_user" });
    const userId = await extractUserId(request, {
      getSession: async () => null,
      allowHeaderFallback: false,
    });

    expect(userId).toBeNull();
  });

  it("returns trusted header user id when fallback is enabled and secret matches", async () => {
    const request = makeRequest({
      "x-user-id": "internal_user",
      "x-internal-auth": "top_secret",
    });
    const userId = await extractUserId(request, {
      getSession: async () => null,
      allowHeaderFallback: true,
      internalAuthSecret: "top_secret",
    });

    expect(userId).toBe("internal_user");
  });

  it("rejects trusted header fallback when secret is missing or wrong", async () => {
    const request = makeRequest({
      "x-user-id": "internal_user",
      "x-internal-auth": "wrong_secret",
    });
    const userId = await extractUserId(request, {
      getSession: async () => null,
      allowHeaderFallback: true,
      internalAuthSecret: "top_secret",
    });

    expect(userId).toBeNull();
  });
});

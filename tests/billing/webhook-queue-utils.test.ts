import { describe, expect, it } from "bun:test";
import {
  getRetryDelaySeconds,
  toQueuedStripeEvent,
  getStripeCustomerId,
} from "@/lib/billing/webhook-queue-utils";

describe("webhook queue retry timing", () => {
  it("uses expected backoff delays and caps at max", () => {
    expect(getRetryDelaySeconds(1)).toBe(60);
    expect(getRetryDelaySeconds(2)).toBe(300);
    expect(getRetryDelaySeconds(3)).toBe(900);
    expect(getRetryDelaySeconds(4)).toBe(3600);
    expect(getRetryDelaySeconds(5)).toBe(7200);
    expect(getRetryDelaySeconds(100)).toBe(7200);
  });
});

describe("webhook queue idempotency normalization", () => {
  it("normalizes queued events with stable id/type fallback", () => {
    const normalized = toQueuedStripeEvent("evt_queue_id", "invoice.payment_failed", {
      data: { object: {} },
      created: 123,
      livemode: false,
      object: "event",
    });

    expect(normalized.id).toBe("evt_queue_id");
    expect(normalized.type).toBe("invoice.payment_failed");
  });

  it("preserves payload id/type when present", () => {
    const normalized = toQueuedStripeEvent("evt_queue_id", "invoice.payment_failed", {
      id: "evt_payload_id",
      type: "invoice.payment_succeeded",
      data: { object: {} },
      created: 123,
      livemode: false,
      object: "event",
    });

    expect(normalized.id).toBe("evt_payload_id");
    expect(normalized.type).toBe("invoice.payment_succeeded");
  });
});

describe("queued payload customer extraction", () => {
  it("extracts customer id when customer is a string", () => {
    expect(
      getStripeCustomerId({
        data: { object: { customer: "cus_123" } },
      })
    ).toBe("cus_123");
  });

  it("extracts customer id when customer is an object", () => {
    expect(
      getStripeCustomerId({
        data: { object: { customer: { id: "cus_456" } } },
      })
    ).toBe("cus_456");
  });

  it("returns null when payload does not contain a customer", () => {
    expect(getStripeCustomerId({ data: { object: {} } })).toBeNull();
  });
});

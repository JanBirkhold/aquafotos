import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  emailFeedbackFromDelivery,
  emailStatusMessage,
  emailStatusQueryParam,
} from "@/lib/email-delivery";

describe("emailFeedbackFromDelivery", () => {
  it("returns success when email was sent", () => {
    expect(emailFeedbackFromDelivery({ sent: true, configured: true })).toEqual({
      emailSent: true,
    });
  });

  it("returns stub notice when not configured and data was saved", () => {
    const result = emailFeedbackFromDelivery(
      { sent: false, configured: false },
      { saved: true },
    );
    expect(result.emailSent).toBe(false);
    expect(result.emailNotice).toContain("gespeichert");
    expect(result.emailNotice).toContain("nicht aktiv");
  });

  it("returns error when configured but send failed", () => {
    const result = emailFeedbackFromDelivery({
      sent: false,
      configured: true,
      error: "SMTP timeout",
    });
    expect(result.emailSent).toBe(false);
    expect(result.error).toBe("SMTP timeout");
  });
});

describe("emailStatusQueryParam", () => {
  it("maps delivery results to URL params", () => {
    expect(emailStatusQueryParam({ sent: true, configured: true })).toBe("sent");
    expect(emailStatusQueryParam({ sent: false, configured: false })).toBe("stub");
    expect(emailStatusQueryParam({ sent: false, configured: true })).toBe("failed");
  });
});

describe("emailStatusMessage", () => {
  it("returns null for unknown status (no false sent claim)", () => {
    expect(
      emailStatusMessage(undefined, {
        sent: "sent msg",
        stub: "stub msg",
        failed: "failed msg",
      }),
    ).toBeNull();
  });

  it("returns matching message for known status", () => {
    expect(
      emailStatusMessage("stub", {
        sent: "sent msg",
        stub: "stub msg",
        failed: "failed msg",
      }),
    ).toBe("stub msg");
  });
});

describe("RESEND_API_KEY detection", () => {
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("treats missing API key as not configured", async () => {
    vi.resetModules();
    const { isEmailConfigured } = await import("@/lib/email-delivery");
    expect(isEmailConfigured()).toBe(false);
  });
});

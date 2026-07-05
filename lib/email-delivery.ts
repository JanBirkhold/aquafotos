import { siteConfig } from "@/lib/site-config";

export type EmailDeliveryResult = {
  sent: boolean;
  configured: boolean;
  error?: string;
};

export type EmailFormFeedback = {
  emailSent: boolean;
  emailNotice?: string;
  error?: string;
};

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function emailFeedbackFromDelivery(
  delivery: EmailDeliveryResult,
  options?: { saved?: boolean },
): EmailFormFeedback {
  if (delivery.sent) {
    return { emailSent: true };
  }

  const phoneHint = ` Bitte rufen Sie uns an: ${siteConfig.phoneDisplay}.`;

  if (!delivery.configured) {
    if (options?.saved) {
      return {
        emailSent: false,
        emailNotice: `Ihre Anfrage wurde gespeichert. E-Mail-Versand ist derzeit nicht aktiv – wir melden uns zeitnah.${phoneHint}`,
      };
    }
    return {
      emailSent: false,
      emailNotice: `E-Mail-Versand ist derzeit nicht aktiv.${phoneHint}`,
    };
  }

  if (options?.saved) {
    return {
      emailSent: false,
      emailNotice: `Ihre Anfrage wurde gespeichert, aber die Bestätigungs-E-Mail konnte nicht versendet werden.${phoneHint}`,
    };
  }

  return {
    emailSent: false,
    error:
      delivery.error ??
      `E-Mail konnte nicht versendet werden.${phoneHint}`,
  };
}

export function emailStatusQueryParam(delivery: EmailDeliveryResult): "sent" | "stub" | "failed" {
  if (delivery.sent) return "sent";
  if (!delivery.configured) return "stub";
  return "failed";
}

export function emailStatusMessage(
  status: "sent" | "stub" | "failed" | undefined,
  options: { sent: string; stub: string; failed: string },
): string | null {
  if (status === "sent") return options.sent;
  if (status === "stub") return options.stub;
  if (status === "failed") return options.failed;
  return null;
}

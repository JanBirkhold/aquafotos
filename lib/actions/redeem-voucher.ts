"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeVoucherCode } from "@/lib/qr-utils";
import { shootingTypeLabels } from "@/lib/shooting-types";
import {
  getVoucherByCode,
  isGalleryAccessCode,
  mapVoucherToRedeemLookupView,
} from "@/lib/voucher-queries";
import { emailsMatch } from "@/lib/gallery-access";

export type RedeemVoucherState = {
  error?: string;
  success?: boolean;
  message?: string;
  voucher?: ReturnType<typeof mapVoucherToRedeemLookupView>;
} | null;

const redeemSchema = z.object({
  code: z.string().min(4),
  parentName: z.string().min(2),
  childName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  preferredDate: z.string().min(1),
  gdprConsent: z.literal(true),
});

export async function redeemVoucher(
  _prev: RedeemVoucherState,
  formData: FormData,
): Promise<RedeemVoucherState> {
  try {
    const parsed = redeemSchema.safeParse({
      code: formData.get("code"),
      parentName: formData.get("parentName"),
      childName: formData.get("childName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      preferredDate: formData.get("preferredDate"),
      gdprConsent: formData.get("gdprConsent") === "on",
    });

    if (!parsed.success) {
      return { error: "Bitte alle Pflichtfelder ausfüllen." };
    }

    const code = normalizeVoucherCode(parsed.data.code);
    const voucher = await getVoucherByCode(code);

    if (!voucher) {
      if (isGalleryAccessCode(code)) {
        return {
          error:
            "Das ist ein Galerie-Zugangscode (AF-…), kein Gutschein-Code. Bitte GS-XXXXXX aus der Gutschein-E-Mail verwenden – oder die Seite mit ?code=… erneut öffnen.",
        };
      }
      return { error: "Gutschein-Code nicht gefunden. Format: GS-XXXXXX aus der Gutschein-E-Mail." };
    }
    if (voucher.status === "PENDING_PAYMENT") {
      return {
        error:
          "Dieser Gutschein ist noch nicht freigegeben. Bitte warten Sie auf unsere Bestätigung nach Zahlungseingang.",
      };
    }
    if (voucher.status === "REDEEMED") {
      const req = voucher.individualShootingReq;
      if (!req || !emailsMatch(parsed.data.email, req.email)) {
        return { error: "E-Mail und Gutschein-Code passen nicht zusammen." };
      }
      const dateHint = req.confirmedDate
        ? ` Termin: ${req.confirmedDate.toLocaleDateString("de-DE")}.`
        : "";
      return {
        success: true,
        message: `Dieser Gutschein ist bereits eingelöst.${dateHint}`,
        voucher: mapVoucherToRedeemLookupView(voucher, {
          verifiedEmail: parsed.data.email,
        }),
      };
    }
    if (voucher.status === "CANCELLED" || voucher.status === "EXPIRED") {
      return { error: "Dieser Gutschein ist nicht mehr gültig." };
    }
    if (voucher.expiresAt && voucher.expiresAt < new Date()) {
      await prisma.voucher.update({
        where: { id: voucher.id },
        data: { status: "EXPIRED" },
      });
      return { error: "Dieser Gutschein ist abgelaufen." };
    }

    const shootingType = voucher.product.shootingType ?? "OTHER";
    const preferredDate = new Date(parsed.data.preferredDate);
    if (Number.isNaN(preferredDate.getTime())) {
      return { error: "Bitte einen gültigen Wunschtermin angeben." };
    }

    await prisma.$transaction([
      prisma.individualShootingRequest.create({
        data: {
          parentName: parsed.data.parentName,
          childName: parsed.data.childName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          shootingType,
          preferredDate,
          message: [
            voucher.personalMessage ? `Gutschein-Nachricht: ${voucher.personalMessage}` : null,
            `Gutschein-Code: ${voucher.code}`,
            voucher.recipientName ? `Beschenkte Person: ${voucher.recipientName}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
          status: "VOUCHER_REDEEMED",
          voucherId: voucher.id,
        },
      }),
      prisma.voucher.update({
        where: { id: voucher.id },
        data: { status: "REDEEMED", redeemedAt: new Date(), preferredDate },
      }),
    ]);

    revalidatePath("/admin/gutscheine");
    revalidatePath("/admin/shootings");
    revalidatePath("/gutschein/einloesen");

    const dateHint = ` zum Wunschtermin ${preferredDate.toLocaleDateString("de-DE")}`;

    const updated = await getVoucherByCode(code);

    return {
      success: true,
      message: `Ihr Gutschein für „${voucher.product.title}“ (${shootingTypeLabels[shootingType]}) wurde eingelöst${dateHint}. Wir melden uns innerhalb weniger Werktage zur Terminbestätigung.`,
      voucher: updated
        ? mapVoucherToRedeemLookupView(updated, {
            verifiedEmail: parsed.data.email,
          })
        : undefined,
    };
  } catch (error) {
    console.error("[redeemVoucher]", error);
    return { error: "Einlösung fehlgeschlagen. Bitte später erneut versuchen." };
  }
}

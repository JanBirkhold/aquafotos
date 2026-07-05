"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth, isStaffRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendVoucherOrderPendingEmail, sendVoucherPurchaseEmail, sendVoucherAppointmentChangedEmail, sendVoucherInvoiceEmailMessage } from "@/lib/email";
import { emailStatusQueryParam } from "@/lib/email-delivery";
import { formatEuro } from "@/lib/pricing";
import {
  buildVoucherCode,
  buildVoucherPurchaseNumber,
  buildVoucherQrPayload,
  generateQrDataUrl,
} from "@/lib/qr-utils";
import { shootingTypeLabels } from "@/lib/shooting-types";
import { ShootingCategory, ShootingType } from "@prisma/client";
import { scheduleIndividualShootingRequest, type NewEventInput } from "@/lib/appointment-scheduling";
import { generateVoucherPurchaseInvoicePdf } from "@/lib/voucher-invoice";
import { invoiceFilename } from "@/lib/invoice-filename";
import { getOrCreateVoucherSessionId } from "@/lib/voucher-session";

async function requireStaff() {
  const session = await auth();
  if (!session?.user || !isStaffRole(session.user.role)) {
    throw new Error("Unauthorized");
  }
}

async function getOrCreateCart(sessionId: string) {
  let cart = await prisma.voucherCart.findUnique({ where: { sessionId } });
  if (!cart) {
    cart = await prisma.voucherCart.create({ data: { sessionId } });
  }
  return cart;
}

export async function addVoucherToCart(productId: string) {
  try {
    const product = await prisma.voucherProduct.findFirst({
      where: { id: productId, active: true },
    });
    if (!product) return { error: "Gutschein nicht gefunden." };

    const sessionId = await getOrCreateVoucherSessionId();
    const cart = await getOrCreateCart(sessionId);

    await prisma.voucherCartItem.create({
      data: { cartId: cart.id, productId: product.id },
    });

    revalidatePath("/gutschein/warenkorb");
    revalidatePath("/gutschein");

    const count = await prisma.voucherCartItem.count({ where: { cartId: cart.id } });
    return { success: true, cartCount: count };
  } catch {
    return { error: "Gutschein konnte nicht hinzugefügt werden." };
  }
}

export async function removeVoucherFromCart(itemId: string) {
  try {
    const sessionId = await getOrCreateVoucherSessionId();
    const cart = await prisma.voucherCart.findUnique({ where: { sessionId } });
    if (!cart) return { success: true };

    await prisma.voucherCartItem.deleteMany({
      where: { id: itemId, cartId: cart.id },
    });

    revalidatePath("/gutschein/warenkorb");
    return { success: true };
  } catch {
    return { error: "Entfernen fehlgeschlagen." };
  }
}

const checkoutItemSchema = z.object({
  itemId: z.string(),
  recipientName: z.string().optional(),
  personalMessage: z.string().max(500).optional(),
});

const checkoutSchema = z.object({
  buyerName: z.string().min(2),
  buyerEmail: z.string().email(),
  bindingConfirmed: z.literal(true),
  items: z.array(checkoutItemSchema).min(1),
});

export async function createVoucherCheckout(params: {
  buyerName: string;
  buyerEmail: string;
  bindingConfirmed: boolean;
  items: {
    itemId: string;
    recipientName?: string;
    personalMessage?: string;
  }[];
}): Promise<{ error?: string; url?: string; purchaseNumber?: string }> {
  try {
    const parsed = checkoutSchema.safeParse({
      buyerName: params.buyerName,
      buyerEmail: params.buyerEmail,
      bindingConfirmed: params.bindingConfirmed ? true : undefined,
      items: params.items,
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message;
      return { error: firstIssue ?? "Bitte alle Pflichtfelder prüfen." };
    }

    const sessionId = await getOrCreateVoucherSessionId();
    const cart = await prisma.voucherCart.findUnique({
      where: { sessionId },
      include: {
        items: { include: { product: true }, orderBy: { createdAt: "asc" } },
      },
    });

    if (!cart || cart.items.length === 0) {
      return { error: "Ihr Gutschein-Warenkorb ist leer." };
    }

    const cartItemIds = new Set(cart.items.map((i) => i.id));
    for (const item of parsed.data.items) {
      if (!cartItemIds.has(item.itemId)) {
        return { error: "Ungültige Warenkorb-Position." };
      }
    }

    if (parsed.data.items.length !== cart.items.length) {
      return { error: "Bitte alle Gutschein-Positionen prüfen." };
    }

    const itemById = new Map(parsed.data.items.map((i) => [i.itemId, i]));
    const purchaseNumber = buildVoucherPurchaseNumber();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 2);

    const orderLines: { title: string; price: string }[] = [];
    let totalCents = 0;

    await prisma.$transaction(async (tx) => {
      for (const cartItem of cart.items) {
        const formItem = itemById.get(cartItem.id);
        if (!formItem) throw new Error("missing item");

        const code = buildVoucherCode();
        const qrPayload = buildVoucherQrPayload(code);

        await tx.voucherCartItem.update({
          where: { id: cartItem.id },
          data: {
            recipientName: formItem.recipientName?.trim() || null,
            personalMessage: formItem.personalMessage?.trim() || null,
          },
        });

        await tx.voucher.create({
          data: {
            purchaseNumber,
            code,
            qrPayload,
            productId: cartItem.productId,
            buyerName: parsed.data.buyerName,
            buyerEmail: parsed.data.buyerEmail,
            recipientName: formItem.recipientName?.trim() || null,
            personalMessage: formItem.personalMessage?.trim() || null,
            priceCents: cartItem.product.priceCents,
            status: "PENDING_PAYMENT",
            expiresAt,
          },
        });

        totalCents += cartItem.product.priceCents;
        orderLines.push({
          title: cartItem.product.title,
          price: formatEuro(cartItem.product.priceCents),
        });
      }

      await tx.voucherCartItem.deleteMany({ where: { cartId: cart.id } });
    });

    const invoicePdf = await generateVoucherPurchaseInvoicePdf(purchaseNumber);

    const delivery = await sendVoucherOrderPendingEmail({
      to: parsed.data.buyerEmail,
      buyerName: parsed.data.buyerName,
      purchaseNumber,
      total: formatEuro(totalCents),
      items: orderLines,
      invoicePdf: invoicePdf ?? undefined,
    });

    const mailStatus = emailStatusQueryParam(delivery);

    revalidatePath("/gutschein");
    revalidatePath("/gutschein/warenkorb");
    revalidatePath("/admin/gutscheine");

    return {
      url: `/gutschein/erfolg?purchase=${encodeURIComponent(purchaseNumber)}&mail=${mailStatus}`,
      purchaseNumber,
    };
  } catch (error) {
    console.error("[createVoucherCheckout]", error);
    return { error: "Gutschein-Bestellung konnte nicht erstellt werden." };
  }
}

export async function confirmVoucherPayment(purchaseNumber: string) {
  await requireStaff();

  const vouchers = await prisma.voucher.findMany({
    where: { purchaseNumber },
    include: { product: true },
  });

  if (vouchers.length === 0) {
    return { error: "Bestellung nicht gefunden." };
  }

  const pending = vouchers.filter((v) => v.status === "PENDING_PAYMENT");
  if (pending.length === 0) {
    return { error: "Keine ausstehende Zahlung für diese Bestellung." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const paidAt = new Date();

  for (const voucher of pending) {
    const qrDataUrl =
      voucher.qrDataUrl ?? (await generateQrDataUrl(voucher.qrPayload));

    await prisma.voucher.update({
      where: { id: voucher.id },
      data: { status: "PAID", paidAt, qrDataUrl },
    });
  }

  const updated = await prisma.voucher.findMany({
    where: { purchaseNumber },
    include: { product: true },
  });

  const buyer = updated[0];
  await sendVoucherPurchaseEmail({
    to: buyer.buyerEmail,
    buyerName: buyer.buyerName,
    purchaseNumber,
    total: formatEuro(updated.reduce((s, v) => s + v.priceCents, 0)),
    vouchers: updated.map((v) => ({
      code: v.code,
      title: v.product.title,
      preferredDate: v.preferredDate?.toLocaleDateString("de-DE") ?? "",
      qrDataUrl: v.qrDataUrl,
      redeemUrl: `${appUrl}/gutschein/einloesen?code=${encodeURIComponent(v.code)}`,
    })),
  });

  revalidatePath("/admin/gutscheine");
  revalidatePath(`/gutschein/erfolg?purchase=${encodeURIComponent(purchaseNumber)}`);

  return { success: true };
}

export async function resendVoucherPurchaseEmail(purchaseNumber: string) {
  await requireStaff();

  const vouchers = await prisma.voucher.findMany({
    where: { purchaseNumber },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });

  if (vouchers.length === 0) {
    return { error: "Bestellung nicht gefunden." };
  }

  const buyer = vouchers[0];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const pending = vouchers.filter((v) => v.status === "PENDING_PAYMENT");

  if (pending.length > 0) {
    const invoicePdf = await generateVoucherPurchaseInvoicePdf(purchaseNumber);
    await sendVoucherOrderPendingEmail({
      to: buyer.buyerEmail,
      buyerName: buyer.buyerName,
      purchaseNumber,
      total: formatEuro(vouchers.reduce((sum, v) => sum + v.priceCents, 0)),
      items: vouchers.map((v) => ({
        title: v.product.title,
        preferredDate: v.preferredDate?.toLocaleDateString("de-DE") ?? "",
        price: formatEuro(v.priceCents),
      })),
      invoicePdf: invoicePdf ?? undefined,
    });
    return { success: true };
  }

  const sendable = vouchers.filter(
    (v) => v.status === "PAID" || v.status === "REDEEMED",
  );

  if (sendable.length === 0) {
    return { error: "Für diesen Status kann keine E-Mail erneut gesendet werden." };
  }

  await sendVoucherPurchaseEmail({
    to: buyer.buyerEmail,
    buyerName: buyer.buyerName,
    purchaseNumber,
    total: formatEuro(sendable.reduce((sum, v) => sum + v.priceCents, 0)),
    vouchers: sendable.map((v) => ({
      code: v.code,
      title: v.product.title,
      preferredDate: v.preferredDate?.toLocaleDateString("de-DE") ?? "",
      qrDataUrl: v.qrDataUrl,
      redeemUrl: `${appUrl}/gutschein/einloesen?code=${encodeURIComponent(v.code)}`,
    })),
  });

  return { success: true };
}

export async function cancelVoucher(voucherId: string) {
  await requireStaff();

  const voucher = await prisma.voucher.findUnique({ where: { id: voucherId } });
  if (!voucher) return { error: "Gutschein nicht gefunden." };
  if (voucher.status === "REDEEMED") {
    return { error: "Eingelöste Gutscheine können nicht storniert werden." };
  }
  if (voucher.status === "CANCELLED") return { success: true };

  await prisma.voucher.update({
    where: { id: voucherId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/admin/gutscheine");
  revalidatePath(`/gutschein/erfolg?purchase=${encodeURIComponent(voucher.purchaseNumber)}`);

  return { success: true };
}

export async function cancelVoucherPurchase(purchaseNumber: string) {
  await requireStaff();

  const vouchers = await prisma.voucher.findMany({ where: { purchaseNumber } });
  if (vouchers.length === 0) return { error: "Bestellung nicht gefunden." };

  const cancellable = vouchers.filter(
    (v) => v.status !== "REDEEMED" && v.status !== "CANCELLED",
  );

  if (cancellable.length === 0) {
    return { error: "Keine stornierbaren Gutscheine in dieser Bestellung." };
  }

  await prisma.voucher.updateMany({
    where: { id: { in: cancellable.map((v) => v.id) } },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/admin/gutscheine");
  revalidatePath(`/gutschein/erfolg?purchase=${encodeURIComponent(purchaseNumber)}`);

  return { success: true };
}

const appointmentInputSchema = z.object({
  voucherId: z.string().min(1),
  confirmedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ungültiges Datum"),
  confirmedTime: z.string().optional(),
  confirmedLocation: z.string().min(2, "Ort fehlt"),
  eventId: z.string().optional(),
  notifyMessage: z.string().max(500).optional(),
});

function formatAppointmentDate(date: Date): string {
  return date.toLocaleDateString("de-DE");
}

function appointmentChanged(
  previous: {
    date: Date;
    time: string | null;
    location: string | null;
  },
  next: {
    date: Date;
    time: string | null;
    location: string;
  },
): boolean {
  return (
    formatAppointmentDate(previous.date) !== formatAppointmentDate(next.date) ||
    (previous.time ?? "") !== (next.time ?? "") ||
    (previous.location ?? "").trim() !== next.location.trim()
  );
}

async function loadVoucherForAppointment(voucherId: string) {
  return prisma.voucher.findUnique({
    where: { id: voucherId },
    include: { product: true, individualShootingReq: true },
  });
}

const confirmRedemptionSchema = appointmentInputSchema.omit({ notifyMessage: true }).extend({
  parentName: z.string().min(2).optional(),
  childName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(6).optional(),
  newEvent: z
    .object({
      title: z.string().min(2),
      category: z.nativeEnum(ShootingCategory),
      shootingType: z.nativeEnum(ShootingType),
      maxParticipants: z.number().int().min(1).max(500),
      description: z.string().optional(),
      publish: z.boolean().optional(),
    })
    .optional(),
});

async function ensureVoucherShootingRequest(
  voucher: NonNullable<Awaited<ReturnType<typeof loadVoucherForAppointment>>>,
  contact: {
    parentName?: string;
    childName?: string;
    email?: string;
    phone?: string;
  },
) {
  if (voucher.individualShootingReq) {
    return voucher.individualShootingReq;
  }

  if (voucher.status !== "PAID") {
    return null;
  }

  const parentName = contact.parentName?.trim() || voucher.buyerName;
  const email = contact.email?.trim() || voucher.buyerEmail;
  const phone = contact.phone?.trim();
  if (!phone) {
    throw new Error("Telefonnummer erforderlich.");
  }

  const shootingType = voucher.product.shootingType ?? "OTHER";

  const req = await prisma.individualShootingRequest.create({
    data: {
      parentName,
      childName:
        contact.childName?.trim() || voucher.recipientName?.trim() || parentName,
      email,
      phone,
      shootingType,
      preferredDate: voucher.preferredDate,
      message: [
        "Termin durch Admin geplant",
        `Gutschein-Code: ${voucher.code}`,
        voucher.recipientName ? `Beschenkte Person: ${voucher.recipientName}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      status: "VOUCHER_REDEEMED",
      voucherId: voucher.id,
    },
  });

  await prisma.voucher.update({
    where: { id: voucher.id },
    data: { status: "REDEEMED", redeemedAt: new Date() },
  });

  return req;
}

export async function confirmVoucherRedemptionAppointment(input: {
  voucherId: string;
  confirmedDate: string;
  confirmedTime?: string;
  confirmedLocation: string;
  eventId?: string;
  newEvent?: NewEventInput;
  parentName?: string;
  childName?: string;
  email?: string;
  phone?: string;
}): Promise<{
  success?: boolean;
  error?: string;
  emailSent?: boolean;
  emailConfigured?: boolean;
  eventId?: string | null;
}> {
  try {
    await requireStaff();

    const parsed = confirmRedemptionSchema.safeParse(input);
    if (!parsed.success) {
      return { error: "Bitte Datum und Ort ausfüllen." };
    }

    const voucher = await loadVoucherForAppointment(parsed.data.voucherId);

    if (!voucher) return { error: "Gutschein nicht gefunden." };
    if (voucher.status !== "PAID" && voucher.status !== "REDEEMED") {
      return { error: "Nur bezahlte oder eingelöste Gutscheine können geplant werden." };
    }

    let req = voucher.individualShootingReq;

    if (!req) {
      try {
        req = await ensureVoucherShootingRequest(voucher, {
          parentName: parsed.data.parentName,
          childName: parsed.data.childName,
          email: parsed.data.email,
          phone: parsed.data.phone,
        });
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Kontaktdaten unvollständig.",
        };
      }
    }

    if (!req) return { error: "Keine Terminanfrage vorhanden." };
    if (req.confirmedDate) return { error: "Termin wurde bereits bestätigt." };

    if (voucher.status === "PAID") {
      await prisma.voucher.update({
        where: { id: voucher.id },
        data: { status: "REDEEMED", redeemedAt: new Date() },
      });
    }

    const result = await scheduleIndividualShootingRequest(req.id, {
      confirmedDate: parsed.data.confirmedDate,
      confirmedTime: parsed.data.confirmedTime,
      confirmedLocation: parsed.data.confirmedLocation,
      eventId: parsed.data.eventId,
      newEvent: parsed.data.newEvent,
    });

    if (result.error) return { error: result.error };

    revalidatePath("/admin/gutscheine");
    revalidatePath("/admin/shootings");
    revalidatePath("/admin/terminanfragen");
    revalidatePath("/gutschein/erfolg");
    revalidatePath(`/admin/shootings/einzel/${req.id}`);
    if (result.eventId) {
      revalidatePath(`/admin/shootings/${result.eventId}`);
    }

    return {
      success: true,
      emailSent: result.emailSent,
      emailConfigured: result.emailConfigured,
      eventId: result.eventId,
    };
  } catch {
    return { error: "Terminbestätigung fehlgeschlagen." };
  }
}

export async function rescheduleVoucherRedemptionAppointment(input: {
  voucherId: string;
  confirmedDate: string;
  confirmedTime?: string;
  confirmedLocation: string;
  notifyMessage?: string;
}): Promise<{
  success?: boolean;
  error?: string;
  emailSent?: boolean;
  emailConfigured?: boolean;
  message?: string;
}> {
  try {
    await requireStaff();

    const parsed = appointmentInputSchema.safeParse(input);
    if (!parsed.success) {
      return { error: "Bitte Datum und Ort ausfüllen." };
    }

    const voucher = await loadVoucherForAppointment(parsed.data.voucherId);

    if (!voucher) return { error: "Gutschein nicht gefunden." };
    if (voucher.status !== "REDEEMED") {
      return { error: "Nur eingelöste Gutscheine können geändert werden." };
    }

    const req = voucher.individualShootingReq;
    if (!req) return { error: "Keine Terminanfrage vorhanden." };
    if (!req.confirmedDate) {
      return { error: "Termin wurde noch nicht bestätigt – bitte zuerst bestätigen." };
    }

    if (req.participantId) {
      const photoCount = await prisma.photo.count({
        where: { participantId: req.participantId },
      });
      if (photoCount > 0) {
        return {
          error: "Shooting hat Galerie-Fotos – Termin kann nicht verschoben werden.",
        };
      }
    }

    const date = new Date(`${parsed.data.confirmedDate}T12:00:00`);
    const confirmedTime = parsed.data.confirmedTime?.trim() || null;
    const confirmedLocation = parsed.data.confirmedLocation.trim();
    const previous = {
      date: req.confirmedDate,
      time: req.confirmedTime,
      location: req.confirmedLocation,
    };
    const next = { date, time: confirmedTime, location: confirmedLocation };

    if (!appointmentChanged(previous, next)) {
      return { error: "Keine Änderung am Termin – bitte Datum, Uhrzeit oder Ort anpassen." };
    }

    await prisma.individualShootingRequest.update({
      where: { id: req.id },
      data: {
        confirmedDate: date,
        confirmedTime,
        confirmedLocation,
        status: "CONFIRMED",
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://aquafotos.com";
    const shootingType = req.shootingType;
    const delivery = await sendVoucherAppointmentChangedEmail({
      to: req.email,
      parentName: req.parentName,
      childName: req.childName,
      productTitle: voucher.product.title,
      shootingTypeLabel: shootingTypeLabels[shootingType],
      previousDate: formatAppointmentDate(previous.date),
      previousTime: previous.time ?? undefined,
      previousLocation: previous.location ?? "—",
      confirmedDate: formatAppointmentDate(date),
      confirmedDateIso: parsed.data.confirmedDate,
      confirmedTime: confirmedTime ?? undefined,
      confirmedLocation,
      notifyMessage: parsed.data.notifyMessage?.trim() || undefined,
      contactLink: `${appUrl}/kontakt`,
      purchaseNumber: voucher.purchaseNumber,
      voucherCode: voucher.code,
    });

    revalidatePath("/admin/gutscheine");
    revalidatePath("/admin/shootings");
    revalidatePath("/admin/terminanfragen");
    revalidatePath("/gutschein/erfolg");
    revalidatePath(`/admin/shootings/einzel/${req.id}`);

    if (!delivery.configured) {
      return {
        success: true,
        emailConfigured: false,
        message:
          "Termin gespeichert, aber E-Mail-Versand ist nicht konfiguriert (RESEND_API_KEY fehlt).",
      };
    }

    if (!delivery.sent) {
      return {
        error: delivery.error ?? "Termin gespeichert, aber Benachrichtigung konnte nicht gesendet werden.",
      };
    }

    return {
      success: true,
      emailSent: true,
      emailConfigured: true,
      message: `Termin geändert – Benachrichtigung an ${req.email} gesendet.`,
    };
  } catch {
    return { error: "Terminänderung fehlgeschlagen." };
  }
}

export async function sendVoucherInvoiceEmail(purchaseNumber: string) {
  try {
    await requireStaff();

    const vouchers = await prisma.voucher.findMany({
      where: { purchaseNumber },
      orderBy: { createdAt: "asc" },
    });

    if (vouchers.length === 0) {
      return { error: "Bestellung nicht gefunden." };
    }

    const buyer = vouchers[0];
    const invoicePdf = await generateVoucherPurchaseInvoicePdf(purchaseNumber);
    if (!invoicePdf) {
      return { error: "Rechnung konnte nicht erstellt werden." };
    }

    const total = formatEuro(vouchers.reduce((sum, voucher) => sum + voucher.priceCents, 0));
    const delivery = await sendVoucherInvoiceEmailMessage({
      to: buyer.buyerEmail,
      buyerName: buyer.buyerName,
      purchaseNumber,
      total,
      invoicePdf,
    });

    if (!delivery.configured) {
      return {
        error:
          "E-Mail-Versand ist nicht konfiguriert (RESEND_API_KEY fehlt). Rechnung kann angezeigt und gedruckt werden.",
      };
    }

    if (!delivery.sent) {
      return { error: delivery.error ?? "Rechnung konnte nicht per E-Mail gesendet werden." };
    }

    return {
      success: true,
      message: `Rechnung wurde an ${buyer.buyerEmail} gesendet.`,
    };
  } catch {
    return { error: "Rechnung konnte nicht gesendet werden." };
  }
}

export async function getVoucherInvoicePdfForAdmin(purchaseNumber: string): Promise<{
  pdfBase64?: string;
  filename?: string;
  error?: string;
}> {
  try {
    await requireStaff();

    const exists = await prisma.voucher.count({ where: { purchaseNumber } });
    if (exists === 0) {
      return { error: "Bestellung nicht gefunden." };
    }

    const invoicePdf = await generateVoucherPurchaseInvoicePdf(purchaseNumber);
    if (!invoicePdf) {
      return { error: "Rechnung konnte nicht erstellt werden." };
    }

    return {
      pdfBase64: Buffer.from(invoicePdf).toString("base64"),
      filename: invoiceFilename(purchaseNumber),
    };
  } catch {
    return { error: "Rechnung nicht verfügbar." };
  }
}

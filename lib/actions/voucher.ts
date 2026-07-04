"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVoucherPurchaseEmail } from "@/lib/email";
import { formatEuro } from "@/lib/pricing";
import {
  buildVoucherCode,
  buildVoucherPurchaseNumber,
  buildVoucherQrPayload,
  generateQrDataUrl,
  normalizeVoucherCode,
} from "@/lib/qr-utils";
import { shootingTypeLabels } from "@/lib/shooting-types";
import {
  getVoucherByCode,
  getVoucherCartSummary,
} from "@/lib/voucher-queries";
import { getOrCreateVoucherSessionId } from "@/lib/voucher-session";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

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

    revalidatePath("/gutschein");
    revalidatePath("/gutschein/warenkorb");

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

    revalidatePath("/gutschein");
    revalidatePath("/gutschein/warenkorb");
    return { success: true };
  } catch {
    return { error: "Entfernen fehlgeschlagen." };
  }
}

const cartItemSchema = z.object({
  itemId: z.string(),
  recipientName: z.string().optional(),
  preferredDate: z.string().optional(),
  personalMessage: z.string().max(500).optional(),
});

export async function updateVoucherCartItem(
  itemId: string,
  data: {
    recipientName?: string;
    preferredDate?: string;
    personalMessage?: string;
  },
) {
  try {
    const parsed = cartItemSchema.safeParse({ itemId, ...data });
    if (!parsed.success) return { error: "Ungültige Angaben." };

    const sessionId = await getOrCreateVoucherSessionId();
    const cart = await prisma.voucherCart.findUnique({ where: { sessionId } });
    if (!cart) return { error: "Warenkorb nicht gefunden." };

    const preferredDate =
      parsed.data.preferredDate && parsed.data.preferredDate.length > 0
        ? new Date(parsed.data.preferredDate)
        : null;

    await prisma.voucherCartItem.updateMany({
      where: { id: itemId, cartId: cart.id },
      data: {
        recipientName: parsed.data.recipientName?.trim() || null,
        preferredDate,
        personalMessage: parsed.data.personalMessage?.trim() || null,
      },
    });

    revalidatePath("/gutschein/warenkorb");
    return { success: true };
  } catch {
    return { error: "Speichern fehlgeschlagen." };
  }
}

const checkoutSchema = z.object({
  buyerName: z.string().min(2),
  buyerEmail: z.string().email(),
  bindingConfirmed: z.literal(true),
});

export async function createVoucherCheckout(params: {
  buyerName: string;
  buyerEmail: string;
  bindingConfirmed: boolean;
}): Promise<{ error?: string; url?: string | null; demo?: boolean; purchaseNumber?: string }> {
  try {
    if (!params.bindingConfirmed) {
      return { error: "Bitte bestätigen Sie die verbindliche Bestellung." };
    }

    const parsed = checkoutSchema.safeParse({
      buyerName: params.buyerName,
      buyerEmail: params.buyerEmail,
      bindingConfirmed: params.bindingConfirmed,
    });
    if (!parsed.success) {
      return { error: "Bitte Käufername und E-Mail prüfen." };
    }

    const cart = await getVoucherCartSummary();
    if (cart.count === 0) {
      return { error: "Ihr Gutschein-Warenkorb ist leer." };
    }

    const missingDate = cart.items.some((item) => !item.preferredDate);
    if (missingDate) {
      return { error: "Bitte Wunschtermin für jeden Gutschein angeben." };
    }

    const purchaseNumber = buildVoucherPurchaseNumber();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 2);

    const voucherRecords = await Promise.all(
      cart.items.map(async (item) => {
        const code = buildVoucherCode();
        const qrPayload = buildVoucherQrPayload(code);
        const qrDataUrl = await generateQrDataUrl(qrPayload);

        return prisma.voucher.create({
          data: {
            purchaseNumber,
            code,
            qrPayload,
            qrDataUrl,
            productId: item.productId,
            buyerName: parsed.data.buyerName,
            buyerEmail: parsed.data.buyerEmail,
            recipientName: item.recipientName || null,
            preferredDate: new Date(item.preferredDate),
            personalMessage: item.personalMessage || null,
            priceCents: item.priceCents,
            status: "PENDING_PAYMENT",
            expiresAt,
          },
          include: { product: true },
        });
      }),
    );

    const sessionId = await getOrCreateVoucherSessionId();
    const voucherCart = await prisma.voucherCart.findUnique({ where: { sessionId } });

    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: parsed.data.buyerEmail,
        line_items: cart.items.map((item) => ({
          price_data: {
            currency: "eur",
            product_data: {
              name: `Gutschein: ${item.title}`,
              description: item.shootingTypeLabel ?? "AquaFotos Shooting",
            },
            unit_amount: item.priceCents,
          },
          quantity: 1,
        })),
        success_url: `${appUrl}/gutschein/erfolg?purchase=${encodeURIComponent(purchaseNumber)}`,
        cancel_url: `${appUrl}/gutschein/warenkorb`,
        metadata: {
          purchaseNumber,
          type: "voucher",
        },
      });

      await prisma.voucher.updateMany({
        where: { purchaseNumber },
        data: { stripeSessionId: session.id },
      });

      if (voucherCart) {
        await prisma.voucherCartItem.deleteMany({ where: { cartId: voucherCart.id } });
      }

      revalidatePath("/gutschein");
      revalidatePath("/gutschein/warenkorb");

      return { url: session.url };
    }

    const paidAt = new Date();
    await prisma.voucher.updateMany({
      where: { purchaseNumber },
      data: { status: "PAID", paidAt },
    });

    await sendVoucherPurchaseEmail({
      to: parsed.data.buyerEmail,
      buyerName: parsed.data.buyerName,
      purchaseNumber,
      total: formatEuro(cart.totalCents),
      vouchers: voucherRecords.map((v) => ({
        code: v.code,
        title: v.product.title,
        preferredDate: v.preferredDate?.toLocaleDateString("de-DE") ?? "",
        qrDataUrl: v.qrDataUrl,
        redeemUrl: `${appUrl}/gutschein/einloesen?code=${encodeURIComponent(v.code)}`,
      })),
    });

    if (voucherCart) {
      await prisma.voucherCartItem.deleteMany({ where: { cartId: voucherCart.id } });
    }

    revalidatePath("/gutschein");
    revalidatePath("/gutschein/warenkorb");
    revalidatePath("/admin/gutscheine");

    return {
      url: `/gutschein/erfolg?purchase=${encodeURIComponent(purchaseNumber)}`,
      demo: true,
      purchaseNumber,
    };
  } catch {
    return { error: "Gutschein-Bestellung konnte nicht erstellt werden." };
  }
}

export type RedeemVoucherState = {
  error?: string;
  success?: boolean;
  message?: string;
} | null;

const redeemSchema = z.object({
  code: z.string().min(4),
  parentName: z.string().min(2),
  childName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
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
      gdprConsent: formData.get("gdprConsent") === "on",
    });

    if (!parsed.success) {
      return { error: "Bitte alle Pflichtfelder ausfüllen." };
    }

    const code = normalizeVoucherCode(parsed.data.code);
    const voucher = await getVoucherByCode(code);

    if (!voucher) return { error: "Gutschein-Code nicht gefunden." };
    if (voucher.status === "PENDING_PAYMENT") {
      return { error: "Dieser Gutschein ist noch nicht bezahlt." };
    }
    if (voucher.status === "REDEEMED") {
      return { error: "Dieser Gutschein wurde bereits eingelöst." };
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

    await prisma.$transaction([
      prisma.individualShootingRequest.create({
        data: {
          parentName: parsed.data.parentName,
          childName: parsed.data.childName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          shootingType,
          preferredDate: voucher.preferredDate,
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
        data: { status: "REDEEMED", redeemedAt: new Date() },
      }),
    ]);

    revalidatePath("/admin/gutscheine");
    revalidatePath("/gutschein/einloesen");

    return {
      success: true,
      message: `Vielen Dank! Ihr Gutschein für „${voucher.product.title}“ (${shootingTypeLabels[shootingType]}) wurde eingelöst. Wir melden uns zum Wunschtermin ${voucher.preferredDate?.toLocaleDateString("de-DE") ?? "in Kürze"} bei Ihnen.`,
    };
  } catch {
    return { error: "Einlösung fehlgeschlagen. Bitte später erneut versuchen." };
  }
}

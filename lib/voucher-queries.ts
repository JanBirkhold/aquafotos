import { prisma } from "@/lib/prisma";
import { getOrCreateVoucherSessionId, getVoucherSessionId } from "@/lib/voucher-session";
import { shootingTypeLabels } from "@/lib/shooting-types";
import type { ShootingType } from "@prisma/client";

const DEFAULT_VOUCHER_PRODUCTS: {
  title: string;
  description: string;
  priceCents: number;
  shootingType: ShootingType;
  sortOrder: number;
}[] = [
  {
    title: "Unterwasser-Shooting Gutschein",
    description:
      "Ein emotionales Unterwasser-Erlebnis für Kinder oder Familien – inkl. Galerie-Zugang.",
    priceCents: 8900,
    shootingType: "UNDERWATER_CHILD",
    sortOrder: 0,
  },
  {
    title: "Baby-Shooting Gutschein",
    description: "Zartes Baby- oder Meilenstein-Shooting – perfekt zum Verschenken.",
    priceCents: 7900,
    shootingType: "BABY_MILESTONE",
    sortOrder: 1,
  },
  {
    title: "Familien-Shooting Gutschein",
    description: "Outdoor-Familienerinnerungen in OWL – mit Wunschtermin zur Anmeldung.",
    priceCents: 9900,
    shootingType: "FAMILY_OUTDOOR",
    sortOrder: 2,
  },
];

async function ensureDefaultVoucherProducts() {
  const count = await prisma.voucherProduct.count();
  if (count > 0) return;

  await prisma.voucherProduct.createMany({
    data: DEFAULT_VOUCHER_PRODUCTS,
  });
}

export async function getActiveVoucherProducts() {
  await ensureDefaultVoucherProducts();
  return prisma.voucherProduct.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
}

async function getOrCreateCart(sessionId: string) {
  let cart = await prisma.voucherCart.findUnique({
    where: { sessionId },
    include: {
      items: {
        include: { product: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!cart) {
    cart = await prisma.voucherCart.create({
      data: { sessionId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  return cart;
}

export async function getVoucherCartSummary() {
  const sessionId = (await getVoucherSessionId()) ?? (await getOrCreateVoucherSessionId());
  const cart = await getOrCreateCart(sessionId);

  const items = cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    title: item.product.title,
    description: item.product.description,
    shootingTypeLabel: item.product.shootingType
      ? shootingTypeLabels[item.product.shootingType]
      : null,
    priceCents: item.product.priceCents,
    recipientName: item.recipientName,
    preferredDate: item.preferredDate?.toISOString().slice(0, 10) ?? "",
    personalMessage: item.personalMessage ?? "",
  }));

  const totalCents = items.reduce((sum, item) => sum + item.priceCents, 0);

  return {
    sessionId,
    items,
    count: items.length,
    totalCents,
  };
}

export async function getVoucherByCode(code: string) {
  const normalized = code.trim().toUpperCase();
  return prisma.voucher.findFirst({
    where: {
      OR: [{ code: normalized }, { qrPayload: { contains: normalized } }],
    },
    include: { product: true },
  });
}

export async function getVouchersByPurchaseNumber(purchaseNumber: string) {
  return prisma.voucher.findMany({
    where: { purchaseNumber },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function lookupVoucherForDisplay(code: string) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  const voucher = await getVoucherByCode(normalized);
  if (!voucher) return null;

  return {
    code: voucher.code,
    status: voucher.status,
    title: voucher.product.title,
    shootingTypeLabel: voucher.product.shootingType
      ? shootingTypeLabels[voucher.product.shootingType]
      : null,
    preferredDate: voucher.preferredDate?.toISOString().slice(0, 10) ?? null,
    recipientName: voucher.recipientName,
    expiresAt: voucher.expiresAt?.toISOString().slice(0, 10) ?? null,
    qrDataUrl: voucher.qrDataUrl,
    redeemable: voucher.status === "PAID",
  };
}

export async function getVoucherCartCount(): Promise<number> {
  const sessionId = await getVoucherSessionId();
  if (!sessionId) return 0;

  const cart = await prisma.voucherCart.findUnique({
    where: { sessionId },
    include: { _count: { select: { items: true } } },
  });

  return cart?._count.items ?? 0;
}

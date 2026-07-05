import { galleryVisibleStatuses } from "@/lib/gallery";
import { emailsMatch } from "@/lib/gallery-access";
import { prisma } from "@/lib/prisma";
import { normalizeVoucherCode } from "@/lib/qr-utils";
import { getOrCreateVoucherSessionId, getVoucherSessionId } from "@/lib/voucher-session";
import { mapVoucherGalleryAccess, type VoucherGalleryAccess } from "@/lib/voucher-gallery";
import { shootingTypeLabels } from "@/lib/shooting-types";
import type { ShootingType } from "@prisma/client";
import type { Prisma } from "@prisma/client";

const voucherDetailInclude = {
  product: true,
  individualShootingReq: {
    include: {
      participant: {
        include: {
          galleryAccess: true,
          photos: {
            where: { processingStatus: { in: galleryVisibleStatuses } },
            select: { id: true, processingStatus: true },
          },
        },
      },
    },
  },
} as const;

type VoucherWithDetails = Prisma.VoucherGetPayload<{ include: typeof voucherDetailInclude }>;

export type VoucherLookupMatch = "code" | "purchase" | "gallery";

const GALLERY_ACCESS_CODE_PATTERN = /^AF-[A-Z0-9]+-\d{3}$/;

export function isGalleryAccessCode(input: string): boolean {
  return GALLERY_ACCESS_CODE_PATTERN.test(normalizeVoucherCode(input));
}

export async function resolveVoucherByInput(
  input: string,
): Promise<{ voucher: VoucherWithDetails; matchedAs: VoucherLookupMatch } | null> {
  const normalized = normalizeVoucherCode(input);
  if (!normalized) return null;

  const direct = await prisma.voucher.findFirst({
    where: {
      OR: [
        { code: normalized },
        { purchaseNumber: normalized },
        { qrPayload: { contains: normalized } },
      ],
    },
    include: voucherDetailInclude,
  });

  if (direct) {
    const matchedAs: VoucherLookupMatch =
      direct.purchaseNumber === normalized
        ? "purchase"
        : direct.code === normalized
          ? "code"
          : "code";
    return { voucher: direct, matchedAs };
  }

  if (!isGalleryAccessCode(normalized)) return null;

  const galleryAccess = await prisma.galleryAccess.findFirst({
    where: { accessCode: normalized },
    select: {
      participant: {
        select: {
          individualShootingReq: {
            select: { voucherId: true },
          },
        },
      },
    },
  });

  const voucherId = galleryAccess?.participant?.individualShootingReq?.voucherId;
  if (!voucherId) return null;

  const voucher = await prisma.voucher.findUnique({
    where: { id: voucherId },
    include: voucherDetailInclude,
  });

  if (!voucher) return null;

  return { voucher, matchedAs: "gallery" };
}

function mapVoucherGalleryFromRow(
  voucher: {
    individualShootingReq: {
      participant: Parameters<typeof mapVoucherGalleryAccess>[0];
    } | null;
  },
  email?: string,
): VoucherGalleryAccess | null {
  return mapVoucherGalleryAccess(voucher.individualShootingReq?.participant, { email });
}

export type VoucherRedeemLookupView = {
  code: string;
  inputCode?: string;
  lookupHint?: string | null;
  status: string;
  title: string;
  shootingTypeLabel: string | null;
  preferredDate: string | null;
  recipientName: string | null;
  expiresAt: string | null;
  qrDataUrl: string | null;
  redeemable: boolean;
  purchaseNumber: string;
  confirmedDate: string | null;
  confirmedTime: string | null;
  confirmedLocation: string | null;
  gallery: VoucherGalleryAccess | null;
  parentName: string | null;
  childName: string | null;
  verifiedEmail: string;
};

export function authorizeVoucherRedeemEmail(
  voucher: VoucherWithDetails,
  email: string,
): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Bitte E-Mail angeben.";

  if (voucher.status === "REDEEMED") {
    const reqEmail = voucher.individualShootingReq?.email;
    if (!reqEmail || !emailsMatch(trimmed, reqEmail)) {
      return "E-Mail und Gutschein-Code passen nicht zusammen.";
    }
    return null;
  }

  if (voucher.status === "PENDING_PAYMENT") {
    if (!emailsMatch(trimmed, voucher.buyerEmail)) {
      return "E-Mail passt nicht zur Gutschein-Bestellung.";
    }
    return null;
  }

  return null;
}

export function mapVoucherToRedeemLookupView(
  voucher: VoucherWithDetails,
  options: {
    verifiedEmail: string;
    inputCode?: string;
    lookupHint?: string | null;
  },
): VoucherRedeemLookupView {
  const req = voucher.individualShootingReq;

  return {
    code: voucher.code,
    inputCode: options.inputCode,
    lookupHint: options.lookupHint ?? null,
    status: voucher.status,
    title: voucher.product.title,
    shootingTypeLabel: voucher.product.shootingType
      ? shootingTypeLabels[voucher.product.shootingType]
      : null,
    preferredDate:
      (req?.preferredDate ?? voucher.preferredDate)?.toISOString().slice(0, 10) ?? null,
    recipientName: voucher.recipientName,
    expiresAt: voucher.expiresAt?.toISOString().slice(0, 10) ?? null,
    qrDataUrl: voucher.qrDataUrl,
    redeemable: voucher.status === "PAID",
    purchaseNumber: voucher.purchaseNumber,
    confirmedDate: req?.confirmedDate?.toISOString().slice(0, 10) ?? null,
    confirmedTime: req?.confirmedTime ?? null,
    confirmedLocation: req?.confirmedLocation ?? null,
    gallery: mapVoucherGalleryFromRow(voucher, options.verifiedEmail),
    parentName: req?.parentName ?? null,
    childName: req?.childName ?? null,
    verifiedEmail: options.verifiedEmail.trim(),
  };
}

export async function lookupVoucherForVerifiedAccess(code: string, email: string) {
  const normalized = normalizeVoucherCode(code);
  if (!normalized) {
    return { error: "Bitte Gutschein-Code angeben." } as const;
  }

  const resolved = await resolveVoucherByInput(normalized);
  if (!resolved) {
    if (isGalleryAccessCode(normalized)) {
      return {
        error:
          "Das ist ein Galerie-Zugangscode (AF-…). Bitte GS-XXXXXX aus der Gutschein-E-Mail verwenden.",
      } as const;
    }
    return { error: "Gutschein-Code nicht gefunden. Format: GS-XXXXXX" } as const;
  }

  const authError = authorizeVoucherRedeemEmail(resolved.voucher, email);
  if (authError) {
    return { error: authError } as const;
  }

  const { voucher, matchedAs } = resolved;
  const lookupHint =
    matchedAs === "gallery"
      ? `Galerie-Code ${normalized} erkannt – zugehöriger Gutschein ${voucher.code}.`
      : matchedAs === "purchase"
        ? `Bestellnummer erkannt – Gutschein ${voucher.code}.`
        : null;

  return {
    voucher: mapVoucherToRedeemLookupView(voucher, {
      verifiedEmail: email,
      inputCode: normalized,
      lookupHint,
    }),
  } as const;
}

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
  const resolved = await resolveVoucherByInput(code);
  return resolved?.voucher ?? null;
}

export async function getVouchersByPurchaseNumber(purchaseNumber: string) {
  return prisma.voucher.findMany({
    where: { purchaseNumber },
    include: voucherDetailInclude,
    orderBy: { createdAt: "asc" },
  });
}

export async function lookupVoucherForDisplay(input: string) {
  const normalized = normalizeVoucherCode(input);
  if (!normalized) return null;

  const resolved = await resolveVoucherByInput(normalized);
  if (!resolved) return null;

  const { voucher, matchedAs } = resolved;
  const lookupHint =
    matchedAs === "gallery"
      ? `Galerie-Code ${normalized} erkannt – zugehöriger Gutschein ${voucher.code}.`
      : matchedAs === "purchase"
        ? `Bestellnummer erkannt – Gutschein ${voucher.code}.`
        : null;

  return mapVoucherToRedeemLookupView(voucher, {
    verifiedEmail: "",
    inputCode: normalized,
    lookupHint,
  });
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

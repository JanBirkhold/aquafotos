"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth, isStaffRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveVoucherProductImage } from "@/lib/voucher-image";
import type { ShootingType } from "@prisma/client";

async function requireStaff() {
  const session = await auth();
  if (!session?.user || !isStaffRole(session.user.role)) {
    throw new Error("Unauthorized");
  }
}

const productSchema = z.object({
  title: z.string().min(2, "Titel erforderlich."),
  description: z.string().optional(),
  priceEuro: z.coerce.number().positive("Preis muss größer als 0 sein."),
  shootingType: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

function parseShootingType(value: string | undefined): ShootingType | null {
  if (!value || value === "NONE") return null;
  return value as ShootingType;
}

async function resolveImageUrl(
  productId: string,
  formData: FormData,
  currentUrl: string | null,
): Promise<string | null> {
  if (formData.get("removeImage") === "on") {
    return null;
  }

  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    return saveVoucherProductImage(productId, file);
  }

  return currentUrl;
}

function revalidateVoucherPaths() {
  revalidatePath("/admin/preise");
  revalidatePath("/gutschein");
}

export async function createVoucherProduct(formData: FormData) {
  await requireStaff();

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    priceEuro: formData.get("priceEuro"),
    shootingType: formData.get("shootingType") || undefined,
    sortOrder: formData.get("sortOrder") ?? 0,
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingaben." };
  }

  try {
    const product = await prisma.voucherProduct.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        priceCents: Math.round(parsed.data.priceEuro * 100),
        shootingType: parseShootingType(parsed.data.shootingType),
        sortOrder: parsed.data.sortOrder,
        active: parsed.data.active,
      },
    });

    const imageUrl = await resolveImageUrl(product.id, formData, null);
    if (imageUrl !== null) {
      await prisma.voucherProduct.update({
        where: { id: product.id },
        data: { imageUrl },
      });
    }

    revalidateVoucherPaths();
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Speichern fehlgeschlagen.";
    return { error: message };
  }
}

export async function updateVoucherProduct(productId: string, formData: FormData) {
  await requireStaff();

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    priceEuro: formData.get("priceEuro"),
    shootingType: formData.get("shootingType") || undefined,
    sortOrder: formData.get("sortOrder") ?? 0,
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingaben." };
  }

  const existing = await prisma.voucherProduct.findUnique({ where: { id: productId } });
  if (!existing) return { error: "Gutschein-Produkt nicht gefunden." };

  try {
    const imageUrl = await resolveImageUrl(productId, formData, existing.imageUrl);

    await prisma.voucherProduct.update({
      where: { id: productId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        priceCents: Math.round(parsed.data.priceEuro * 100),
        shootingType: parseShootingType(parsed.data.shootingType),
        sortOrder: parsed.data.sortOrder,
        active: parsed.data.active,
        imageUrl,
      },
    });

    revalidateVoucherPaths();
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Speichern fehlgeschlagen.";
    return { error: message };
  }
}

export async function deleteVoucherProduct(productId: string) {
  try {
    await requireStaff();

    const existing = await prisma.voucherProduct.findUnique({ where: { id: productId } });
    if (!existing) return { error: "Gutschein-Produkt nicht gefunden." };

    const soldCount = await prisma.voucher.count({ where: { productId } });

    if (soldCount > 0) {
      await prisma.voucherProduct.update({
        where: { id: productId },
        data: { active: false },
      });
      revalidateVoucherPaths();
      return {
        success: true,
        message: "Produkt deaktiviert (bereits verkaufte Gutscheine vorhanden).",
      };
    }

    await prisma.voucherCartItem.deleteMany({ where: { productId } });
    await prisma.voucherProduct.delete({ where: { id: productId } });

    revalidateVoucherPaths();
    return { success: true, message: "Produkt gelöscht." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Löschen fehlgeschlagen.";
    return { error: message };
  }
}

export async function getAllVoucherProductsForAdmin() {
  await requireStaff();
  return prisma.voucherProduct.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    include: { _count: { select: { vouchers: true } } },
  });
}

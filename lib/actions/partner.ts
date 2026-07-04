"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { auth, isStaffRole } from "@/lib/auth";
import { partnerLogoRequirements } from "@/lib/partners";
import { prisma } from "@/lib/prisma";
import type { PartnerType } from "@prisma/client";

async function requireStaff() {
  const session = await auth();
  if (!session?.user || !isStaffRole(session.user.role)) {
    throw new Error("Unauthorized");
  }
  return session;
}

async function savePartnerLogo(partnerId: string, file: File): Promise<string> {
  if (!partnerLogoRequirements.acceptedTypes.includes(file.type as (typeof partnerLogoRequirements.acceptedTypes)[number])) {
    throw new Error("Nur PNG, SVG oder WebP erlaubt.");
  }
  if (file.size > partnerLogoRequirements.maxBytes) {
    throw new Error("Logo zu groß (max. 500 KB).");
  }

  const ext = file.type === "image/svg+xml" ? "svg" : file.type === "image/webp" ? "webp" : "png";
  const filename = `logo.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "partners", partnerId);
  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/partners/${partnerId}/${filename}`;
}

export async function createPartner(formData: FormData) {
  await requireStaff();

  const name = formData.get("name") as string;
  const type = formData.get("type") as PartnerType;
  const description = (formData.get("description") as string) || undefined;
  const city = (formData.get("city") as string) || undefined;
  const websiteUrl = (formData.get("websiteUrl") as string) || undefined;
  const featured = formData.get("featured") === "on";
  const logoFile = formData.get("logo");

  const partner = await prisma.partner.create({
    data: {
      name,
      type,
      description: description || null,
      city: city || null,
      websiteUrl: websiteUrl || null,
      featured,
      active: true,
    },
  });

  if (logoFile instanceof File && logoFile.size > 0) {
    const logoUrl = await savePartnerLogo(partner.id, logoFile);
    await prisma.partner.update({ where: { id: partner.id }, data: { logoUrl } });
  }

  revalidatePath("/admin/partner");
  revalidatePath("/partner");
  return { success: true, id: partner.id };
}

export async function updatePartner(partnerId: string, formData: FormData) {
  await requireStaff();

  const logoFile = formData.get("logo");

  await prisma.partner.update({
    where: { id: partnerId },
    data: {
      name: formData.get("name") as string,
      type: formData.get("type") as PartnerType,
      description: (formData.get("description") as string) || null,
      city: (formData.get("city") as string) || null,
      websiteUrl: (formData.get("websiteUrl") as string) || null,
      featured: formData.get("featured") === "on",
      active: formData.get("active") === "on",
      sortOrder: Number(formData.get("sortOrder") ?? 0),
    },
  });

  if (logoFile instanceof File && logoFile.size > 0) {
    const logoUrl = await savePartnerLogo(partnerId, logoFile);
    await prisma.partner.update({ where: { id: partnerId }, data: { logoUrl } });
  }

  revalidatePath("/admin/partner");
  revalidatePath("/partner");
  return { success: true };
}

export async function deletePartner(partnerId: string) {
  await requireStaff();
  await prisma.partner.update({
    where: { id: partnerId },
    data: { active: false, featured: false },
  });
  revalidatePath("/admin/partner");
  revalidatePath("/partner");
  return { success: true };
}

export async function getFeaturedPartners() {
  try {
    return await prisma.partner.findMany({
      where: { active: true, featured: true },
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        logoUrl: true,
        city: true,
        websiteUrl: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  } catch {
    return [];
  }
}

import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { auth, isStaffRole } from "@/lib/auth";
import { getGalleryAccessCookie } from "@/lib/gallery-session";
import {
  orderItemDownloadFilename,
  resolveOrderItemStorageKey,
} from "@/lib/order-download";
import { verifyOrderItemDownloadAccess } from "@/lib/order-queries";

type RouteContext = { params: Promise<{ itemId: string }> };

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { itemId } = await context.params;
  const session = await auth();
  const cookieCode = await getGalleryAccessCookie();
  const codeParam = request.nextUrl.searchParams.get("code");
  const accessCode = codeParam ?? cookieCode;

  const staff = !!session?.user && isStaffRole(session.user.role);
  const { ok, item } = await verifyOrderItemDownloadAccess(
    itemId,
    accessCode,
    session?.user?.email,
    staff,
  );

  if (!ok || !item) {
    return NextResponse.json({ error: "Download nicht verfügbar." }, { status: 403 });
  }

  const storageKey = resolveOrderItemStorageKey(item);
  if (!storageKey) {
    return NextResponse.json({ error: "Datei nicht gefunden." }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", storageKey.replace(/^\//, ""));

  try {
    const buffer = await readFile(filePath);
    const ext = storageKey.split(".").pop()?.toLowerCase() ?? "jpg";
    const filename = orderItemDownloadFilename(
      item.position,
      item.photo.filename,
      !!item.finalStorageKey,
    );

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Datei konnte nicht gelesen werden." },
      { status: 404 },
    );
  }
}

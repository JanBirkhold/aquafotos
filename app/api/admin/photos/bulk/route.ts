import { NextResponse } from "next/server";
import { auth, isStaffRole } from "@/lib/auth";
import { bulkUploadPhotosForEvent } from "@/lib/admin-photo-upload";
import { parsePhotoUploadReleaseMode } from "@/lib/photo-release";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !isStaffRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const eventId = String(formData.get("eventId") ?? "");
    const files = formData
      .getAll("photos")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    const result = await bulkUploadPhotosForEvent({
      eventId,
      files,
      releaseMode: parsePhotoUploadReleaseMode(formData.get("releaseMode")),
      notifyCustomer: formData.get("notifyCustomer") !== "false",
    });
    if ("error" in result) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("[POST /api/admin/photos/bulk]", error);
    return NextResponse.json({ error: "Bulk-Upload fehlgeschlagen." }, { status: 500 });
  }
}

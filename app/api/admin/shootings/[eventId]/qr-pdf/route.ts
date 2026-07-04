import { NextRequest } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { auth, isStaffRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatParticipantCode, generateQrDataUrl } from "@/lib/qr-utils";

type RouteContext = { params: Promise<{ eventId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user || !isStaffRole(session.user.role)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { eventId } = await context.params;
  const idsParam = request.nextUrl.searchParams.get("ids");
  const ids = idsParam?.split(",").filter(Boolean);

  const event = await prisma.shootingEvent.findUnique({ where: { id: eventId } });
  if (!event) return new Response("Event not found", { status: 404 });

  const participants = await prisma.participant.findMany({
    where: {
      eventId,
      ...(ids?.length ? { id: { in: ids } } : {}),
    },
    include: { qrCode: true },
    orderBy: { participantNumber: "asc" },
  });

  if (participants.length === 0) {
    return new Response("Keine Teilnehmer", { status: 404 });
  }

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const eventDate = event.date.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  for (const p of participants) {
    const page = pdf.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    const code = formatParticipantCode(p.participantNumber);

    page.drawText("AquaFotos", {
      x: 50,
      y: height - 60,
      size: 22,
      font: fontBold,
      color: rgb(0.04, 0.16, 0.2),
    });
    page.drawText(event.title, {
      x: 50,
      y: height - 90,
      size: 14,
      font,
      color: rgb(0.2, 0.25, 0.3),
    });
    page.drawText(`${eventDate} · ${event.location}`, {
      x: 50,
      y: height - 110,
      size: 11,
      font,
      color: rgb(0.4, 0.45, 0.5),
    });

    page.drawText(`Teilnehmer #${code}`, {
      x: 50,
      y: height - 150,
      size: 16,
      font: fontBold,
      color: rgb(0.04, 0.16, 0.2),
    });
    page.drawText(p.childName, {
      x: 50,
      y: height - 175,
      size: 14,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.15),
    });
    page.drawText(`Eltern: ${p.parentName}`, {
      x: 50,
      y: height - 195,
      size: 11,
      font,
      color: rgb(0.3, 0.35, 0.4),
    });

    const payload = p.qrCode?.code;
    if (payload) {
      const dataUrl = p.qrCode?.qrDataUrl ?? (await generateQrDataUrl(payload));
      const base64 = dataUrl.split(",")[1];
      const pngBytes = Buffer.from(base64, "base64");
      const png = await pdf.embedPng(pngBytes);
      const qrSize = 220;
      page.drawImage(png, {
        x: (width - qrSize) / 2,
        y: height - 450,
        width: qrSize,
        height: qrSize,
      });
      page.drawText(payload.replace("AQUAFOTOS:", ""), {
        x: 50,
        y: height - 480,
        size: 10,
        font,
        color: rgb(0.4, 0.45, 0.5),
      });
    }

    page.drawText("QR-Code beim Shooting bereithalten", {
      x: 50,
      y: 80,
      size: 10,
      font,
      color: rgb(0.5, 0.55, 0.6),
    });
  }

  const bytes = await pdf.save();
  const filename =
    ids?.length === 1
      ? `qr-${formatParticipantCode(participants[0].participantNumber)}.pdf`
      : `qr-${event.title.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 30)}.pdf`;

  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

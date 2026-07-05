import Link from "next/link";
import { notFound } from "next/navigation";
import { QrCode, Upload, Users } from "lucide-react";
import { ShootingAdminPanel } from "@/components/admin/shooting-admin-panel";
import { ParticipantWorkflowTable } from "@/components/admin/participant-workflow-table";
import { getEventById, formatEventDate } from "@/lib/events";
import {
  getParticipantOrdersByEventId,
  serializeParticipantOrdersMap,
} from "@/lib/shooting-participant-orders";
import { prisma } from "@/lib/prisma";
import { shootingTypeLabels } from "@/lib/shooting-types";

type Props = { params: Promise<{ id: string }> };

const statusLabels: Record<string, string> = {
  DRAFT: "Entwurf",
  PUBLISHED: "Veröffentlicht",
  FULL: "Ausgebucht",
  COMPLETED: "Abgeschlossen",
  CANCELLED: "Abgesagt",
};

export default async function AdminShootingDetailPage({ params }: Props) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  let participants: Awaited<
    ReturnType<
      typeof prisma.participant.findMany<{
        include: { qrCode: true; photos: { select: { id: true; filename: true; storageKey: true } } };
      }>
    >
  > = [];

  try {
    participants = await prisma.participant.findMany({
      where: { eventId: id },
      include: {
        qrCode: true,
        photos: {
          select: { id: true, filename: true, storageKey: true, processingStatus: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { participantNumber: "asc" },
    });
  } catch {
    participants = [];
  }

  const serializedParticipants = participants.map((p) => ({
    id: p.id,
    participantNumber: p.participantNumber,
    parentName: p.parentName,
    childName: p.childName,
    email: p.email,
    phone: p.phone,
    status: p.status,
    registrationSource: p.registrationSource,
    confirmationSentAt: p.confirmationSentAt?.toISOString() ?? null,
    confirmedAt: p.confirmedAt?.toISOString() ?? null,
    galleryViewedAt: p.galleryViewedAt?.toISOString() ?? null,
    orderedAt: p.orderedAt?.toISOString() ?? null,
    qrDataUrl: p.qrCode?.qrDataUrl ?? null,
    qrCode: p.qrCode?.code ?? null,
    photoCount: p.photos.length,
    photos: p.photos,
  }));

  const workflowRows = serializedParticipants.map(
    ({ id, participantNumber, parentName, childName, email, status, registrationSource, confirmationSentAt, confirmedAt, galleryViewedAt, orderedAt }) => ({
      id,
      participantNumber,
      parentName,
      childName,
      email,
      status,
      registrationSource,
      confirmationSentAt,
      confirmedAt,
      galleryViewedAt,
      orderedAt,
    }),
  );

  const totalPhotos = participants.reduce((sum, p) => sum + p.photos.length, 0);
  const ordersByParticipant = serializeParticipantOrdersMap(
    await getParticipantOrdersByEventId(id),
  );

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/shootings" className="text-sm text-aqua-600 hover:underline">
          ← Shootings
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-bold text-aqua-900">{event.title}</h1>
          <span className="rounded-full bg-aqua-100 px-3 py-1 text-xs font-medium text-aqua-800">
            {statusLabels[event.status] ?? event.status}
          </span>
        </div>
        <p className="text-slate-500">
          {formatEventDate(event.date)} · {event.location} · {shootingTypeLabels[event.shootingType]}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-sm">
          <Users className="h-8 w-8 text-aqua-500" />
          <div>
            <p className="text-2xl font-bold">{participants.length}</p>
            <p className="text-sm text-slate-500">Teilnehmer</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-sm">
          <QrCode className="h-8 w-8 text-aqua-500" />
          <div>
            <p className="text-2xl font-bold">{participants.filter((p) => p.qrCode?.qrDataUrl).length}</p>
            <p className="text-sm text-slate-500">QR-Codes</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-sm">
          <Upload className="h-8 w-8 text-aqua-500" />
          <div>
            <p className="text-2xl font-bold">{totalPhotos}</p>
            <p className="text-sm text-slate-500">Fotos zugeordnet</p>
          </div>
        </div>
      </div>

      <ParticipantWorkflowTable
        eventId={event.id}
        participants={workflowRows}
        ordersByParticipant={ordersByParticipant}
      />

      <ShootingAdminPanel
        event={{
          id: event.id,
          title: event.title,
          description: event.description,
          category: event.category,
          shootingType: event.shootingType,
          status: event.status,
          date: event.date.toISOString(),
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
          locationDetail: event.locationDetail,
          maxParticipants: event.maxParticipants,
          allowWaitlist: event.allowWaitlist,
        }}
        participants={serializedParticipants}
        ordersByParticipant={ordersByParticipant}
      />
    </div>
  );
}

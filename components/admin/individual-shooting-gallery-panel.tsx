"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Copy, ExternalLink, Images, Loader2, Mail, UserPlus } from "lucide-react";
import {
  ensureIndividualShootingGallery,
  resendParticipantConfirmation,
} from "@/lib/actions/admin";
import { BulkPhotoUpload } from "@/components/admin/bulk-photo-upload";
import { ParticipantPhotoManager } from "@/components/admin/participant-photo-manager";
import {
  ParticipantWorkflowTable,
  type ParticipantRow,
} from "@/components/admin/participant-workflow-table";
import { ShootingParticipantMenu } from "@/components/admin/shooting-participant-menu";
import type { IndividualShootingParticipant } from "@/lib/events";
import type { ParticipantOrderSummary } from "@/lib/shooting-participant-orders";
import type { ParticipantSource, ParticipantStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  individualShootingId: string;
  participant: IndividualShootingParticipant | null;
  galleryEventId: string | null;
  orders: ParticipantOrderSummary[];
};

export function IndividualShootingGalleryPanel({
  individualShootingId,
  participant,
  galleryEventId,
  orders,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const galleryUrl = participant?.accessCode
    ? `/galerie/${encodeURIComponent(participant.accessCode)}`
    : null;
  const orderUrl = participant?.accessCode
    ? `/bilder-bestellen?code=${encodeURIComponent(participant.accessCode)}`
    : null;

  function setupGallery(sendEmail: boolean) {
    startTransition(async () => {
      setMessage(null);
      const result = await ensureIndividualShootingGallery(individualShootingId, {
        sendEmail,
      });
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage(result.message ?? "Galerie-Zugang eingerichtet.");
    });
  }

  async function copyAccessCode() {
    if (!participant?.accessCode) return;
    try {
      await navigator.clipboard.writeText(participant.accessCode);
      setMessage("Zugangscode kopiert.");
    } catch {
      setMessage("Kopieren fehlgeschlagen.");
    }
  }

  if (!participant || !galleryEventId) {
    return (
      <section className="rounded-2xl border border-dashed border-aqua-200 bg-aqua-50/40 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-aqua-900">
              Galerie & Fotos
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-600">
              Richtet Zugangscode, QR und Upload-Bereich ein – analog zu Event-Teilnehmern.
              Der Kunde erhält Galerie-Zugang per E-Mail.
            </p>
          </div>
          <Images className="h-10 w-10 shrink-0 text-aqua-400" aria-hidden />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" disabled={pending} onClick={() => setupGallery(true)}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Wird eingerichtet…
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" aria-hidden />
                Galerie einrichten & E-Mail senden
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => setupGallery(false)}
          >
            Nur einrichten
          </Button>
        </div>
        {message && (
          <p className="mt-4 text-sm text-slate-600" role="status">
            {message}
          </p>
        )}
      </section>
    );
  }

  const workflowRow: ParticipantRow = {
    id: participant.id,
    participantNumber: participant.participantNumber,
    parentName: participant.parentName,
    childName: participant.childName,
    email: participant.email,
    status: participant.status as ParticipantStatus,
    registrationSource: participant.registrationSource as ParticipantSource,
    confirmationSentAt: participant.confirmationSentAt,
    confirmedAt: participant.confirmedAt,
    galleryViewedAt: participant.galleryViewedAt,
    orderedAt: participant.orderedAt,
  };

  return (
    <section className="space-y-6">
      {message && (
        <p className="rounded-xl bg-aqua-50 px-4 py-3 text-sm text-aqua-900" role="status">
          {message}
        </p>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-aqua-900">
              Galerie-Zugang
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Zugangscode, QR und Links für den Kunden
            </p>
          </div>
          <ShootingParticipantMenu
            participantId={participant.id}
            participantLabel={participant.childName}
            eventId={galleryEventId}
            status={participant.status as ParticipantStatus}
            orders={orders}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Zugangscode
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <code className="rounded-lg bg-slate-100 px-3 py-2 font-mono text-lg tracking-wide text-aqua-900">
                  {participant.accessCode}
                </code>
                <Button type="button" variant="outline" size="sm" onClick={copyAccessCode}>
                  <Copy className="h-4 w-4" aria-hidden />
                  Kopieren
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {galleryUrl && (
                <Button asChild variant="outline" size="sm">
                  <Link href={galleryUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
                    Galerie öffnen
                  </Link>
                </Button>
              )}
              {orderUrl && (
                <Button asChild variant="outline" size="sm">
                  <Link href={orderUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
                    Bilder bestellen
                  </Link>
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    setMessage(null);
                    const result = await resendParticipantConfirmation(
                      participant.id,
                      galleryEventId,
                    );
                    if (result.error) setMessage(result.error);
                    else setMessage("Galerie-E-Mail erneut gesendet.");
                  })
                }
              >
                <Mail className="mr-2 h-4 w-4" aria-hidden />
                Zugang per E-Mail
              </Button>
            </div>
          </div>

          {participant.qrDataUrl && (
            <Image
              src={participant.qrDataUrl}
              alt={`QR-Code ${participant.qrCode ?? ""}`}
              width={140}
              height={140}
              className="rounded-xl border border-slate-100"
              unoptimized
            />
          )}
        </div>
      </div>

      <ParticipantWorkflowTable
        eventId={galleryEventId}
        participants={[workflowRow]}
        ordersByParticipant={{ [participant.id]: orders }}
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-semibold text-aqua-900">Fotos</h2>
        <p className="mt-1 text-sm text-slate-500">
          Bulk-Upload oder direkt diesem Kunden zuordnen
        </p>

        <BulkPhotoUpload
          eventId={galleryEventId}
          participantCount={1}
          disabled={pending}
          onMessage={setMessage}
        />

        <div className={cn("mt-6")}>
          <ParticipantPhotoManager
            eventId={galleryEventId}
            participantId={participant.id}
            participantName={participant.childName}
            participantNumber={participant.participantNumber}
            photos={participant.photos}
            disabled={pending}
            onMessage={setMessage}
          />
        </div>
      </div>
    </section>
  );
}

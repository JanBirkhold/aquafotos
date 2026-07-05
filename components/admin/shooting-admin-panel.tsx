"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Bell,
  Download,
  Loader2,
  Pencil,
  QrCode,
  UserPlus,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  addParticipantManual,
  cancelEvent,
  ensureParticipantQrCodes,
  notifyEventParticipants,
  publishEvent,
  updateEvent,
} from "@/lib/actions/admin";
import { BulkPhotoUpload } from "@/components/admin/bulk-photo-upload";
import { NotificationComposeDialog } from "@/components/admin/notification-compose-dialog";
import { ParticipantPhotoManager } from "@/components/admin/participant-photo-manager";
import { ShootingParticipantMenu } from "@/components/admin/shooting-participant-menu";
import { CategoryShootingSelect } from "@/components/admin/category-shooting-select";
import type { ParticipantOrderSummary } from "@/lib/shooting-participant-orders";
import { EMAIL_TEMPLATE_KEYS } from "@/lib/email-template-definitions";
import {
  getEventCancelledVariables,
  getNewEventVariables,
  getShootingReminderVariables,
} from "@/lib/actions/email-templates";
import {
  normalizeParticipantStatus,
  participantSourceLabels,
  participantStatusColors,
  participantStatusLabels,
} from "@/lib/participant-workflow";
import { orderStatusLabels } from "@/lib/order-workflow";
import type { EventStatus, ParticipantSource, ParticipantStatus, PhotoProcessingStatus, ShootingCategory, ShootingType } from "@prisma/client";
import { cn } from "@/lib/utils";

export type AdminParticipant = {
  id: string;
  participantNumber: number;
  parentName: string;
  childName: string;
  email: string;
  phone: string;
  status: ParticipantStatus;
  registrationSource: ParticipantSource;
  qrDataUrl: string | null;
  qrCode: string | null;
  photoCount: number;
  photos: { id: string; filename: string; storageKey: string; processingStatus?: PhotoProcessingStatus }[];
};

type Props = {
  event: {
    id: string;
    title: string;
    description: string | null;
    category: ShootingCategory;
    shootingType: ShootingType;
    status: EventStatus;
    date: string;
    startTime: string | null;
    endTime: string | null;
    location: string;
    locationDetail: string | null;
    maxParticipants: number;
    allowWaitlist: boolean;
  };
  participants: AdminParticipant[];
  ordersByParticipant?: Record<string, ParticipantOrderSummary[]>;
};

type ComposeState = {
  templateKey: string;
  variables: Record<string, string>;
  title: string;
  description: string;
  recipientLabel: string;
  onSend: (draft: { subject: string; bodyHtml: string }) => Promise<void>;
};

export function ShootingAdminPanel({
  event,
  participants,
  ordersByParticipant = {},
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(participants.map((p) => p.id)),
  );
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [notifyNotes, setNotifyNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [compose, setCompose] = useState<ComposeState | null>(null);
  const [composeLoading, setComposeLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  const allSelected = participants.length > 0 && selected.size === participants.length;
  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  function toggleAll(checked: boolean) {
    setSelected(checked ? new Set(participants.map((p) => p.id)) : new Set());
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function pdfUrl(ids?: string[]) {
    const param = ids?.length ? `?ids=${ids.join(",")}` : "";
    return `/api/admin/shootings/${event.id}/qr-pdf${param}`;
  }

  return (
    <div className="space-y-8">
      {message && (
        <p className="rounded-xl bg-aqua-50 px-4 py-3 text-sm text-aqua-800" role="status">
          {message}
        </p>
      )}

      <section className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowEdit(!showEdit)}
          aria-expanded={showEdit}
        >
          <Pencil className="mr-2 h-4 w-4" aria-hidden />
          Einstellungen bearbeiten
        </Button>
        {event.status === "DRAFT" && (
          <Button
            type="button"
            size="sm"
            disabled={pending || composeLoading}
            onClick={async () => {
              setComposeLoading(true);
              try {
                const variables = await getNewEventVariables(event.id);
                setCompose({
                  templateKey: EMAIL_TEMPLATE_KEYS.NEW_EVENT,
                  variables,
                  title: "Shooting veröffentlichen",
                  description: "Termin online schalten und Abonnenten benachrichtigen.",
                  recipientLabel: "Interessenten (Abonnenten)",
                  onSend: (draft) =>
                    new Promise<void>((resolve) => {
                      startTransition(async () => {
                        const res = await publishEvent(event.id, draft);
                        setMessage(
                          `Event veröffentlicht – ${res.notified ?? 0} Abonnenten benachrichtigt.`,
                        );
                        resolve();
                      });
                    }),
                });
              } finally {
                setComposeLoading(false);
              }
            }}
          >
            Veröffentlichen
          </Button>
        )}
        {event.status !== "CANCELLED" && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending || composeLoading || participants.length === 0}
              onClick={async () => {
                setComposeLoading(true);
                try {
                  const variables = await getShootingReminderVariables(
                    event.id,
                    notifyNotes || undefined,
                  );
                  setCompose({
                    templateKey: EMAIL_TEMPLATE_KEYS.SHOOTING_REMINDER,
                    variables,
                    title: "Teilnehmer benachrichtigen",
                    description: "Erinnerung an alle Teilnehmer dieses Shootings.",
                    recipientLabel: `${participants.length} Teilnehmer`,
                    onSend: (draft) =>
                      new Promise<void>((resolve) => {
                        startTransition(async () => {
                          const res = await notifyEventParticipants(event.id, {
                            notes: notifyNotes || undefined,
                            subject: draft.subject,
                            bodyHtml: draft.bodyHtml,
                          });
                          setMessage(`${res.sent} Teilnehmer benachrichtigt.`);
                          resolve();
                        });
                      }),
                  });
                } finally {
                  setComposeLoading(false);
                }
              }}
            >
              <Bell className="mr-2 h-4 w-4" aria-hidden />
              Teilnehmer benachrichtigen
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
              disabled={pending || composeLoading}
              onClick={async () => {
                setComposeLoading(true);
                try {
                  const variables = await getEventCancelledVariables(
                    event.id,
                    cancelReason || undefined,
                  );
                  setCompose({
                    templateKey: EMAIL_TEMPLATE_KEYS.EVENT_CANCELLED,
                    variables,
                    title: "Shooting absagen",
                    description: "Alle Teilnehmer erhalten diese Absage-E-Mail.",
                    recipientLabel: `${participants.length} Teilnehmer`,
                    onSend: (draft) =>
                      new Promise<void>((resolve) => {
                        startTransition(async () => {
                          const res = await cancelEvent(
                            event.id,
                            cancelReason || undefined,
                            draft,
                          );
                          setMessage(`Shooting abgesagt – ${res.sent} Teilnehmer informiert.`);
                          resolve();
                        });
                      }),
                  });
                } finally {
                  setComposeLoading(false);
                }
              }}
            >
              <XCircle className="mr-2 h-4 w-4" aria-hidden />
              Absagen
            </Button>
          </>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await ensureParticipantQrCodes(event.id);
              setMessage(`${res.fixed} QR-Codes erzeugt/aktualisiert.`);
            })
          }
        >
          <QrCode className="mr-2 h-4 w-4" aria-hidden />
          QR-Codes reparieren
        </Button>
      </section>

      {compose && (
        <NotificationComposeDialog
          open={!!compose}
          onOpenChange={(open) => {
            if (!open) setCompose(null);
          }}
          templateKey={compose.templateKey}
          variables={compose.variables}
          title={compose.title}
          description={compose.description}
          recipientLabel={compose.recipientLabel}
          onConfirm={compose.onSend}
        />
      )}

      {showEdit && (
        <form
          className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
          action={(fd) =>
            startTransition(async () => {
              await updateEvent(event.id, {
                title: fd.get("title") as string,
                description: (fd.get("description") as string) || undefined,
                category: fd.get("category") as ShootingCategory,
                shootingType: fd.get("shootingType") as ShootingType,
                date: fd.get("date") as string,
                startTime: (fd.get("startTime") as string) || undefined,
                endTime: (fd.get("endTime") as string) || undefined,
                location: fd.get("location") as string,
                locationDetail: (fd.get("locationDetail") as string) || undefined,
                maxParticipants: Number(fd.get("maxParticipants")),
                allowWaitlist: fd.get("allowWaitlist") === "on",
              });
              setMessage("Einstellungen gespeichert.");
              setShowEdit(false);
            })
          }
        >
          <h2 className="font-display text-xl font-semibold">Event bearbeiten</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Titel</Label>
              <Input id="title" name="title" defaultValue={event.title} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea id="description" name="description" defaultValue={event.description ?? ""} rows={3} />
            </div>
            <CategoryShootingSelect
              defaultCategory={event.category}
              defaultShootingType={event.shootingType}
            />
            <div className="space-y-2">
              <Label htmlFor="date">Datum</Label>
              <Input id="date" name="date" type="date" defaultValue={event.date.slice(0, 10)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max. Teilnehmer</Label>
              <Input
                id="maxParticipants"
                name="maxParticipants"
                type="number"
                min={1}
                defaultValue={event.maxParticipants}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start</Label>
              <Input id="startTime" name="startTime" type="time" defaultValue={event.startTime ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Ende</Label>
              <Input id="endTime" name="endTime" type="time" defaultValue={event.endTime ?? ""} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="location">Ort</Label>
              <Input id="location" name="location" defaultValue={event.location} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="locationDetail">Ort-Details</Label>
              <Input id="locationDetail" name="locationDetail" defaultValue={event.locationDetail ?? ""} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="allowWaitlist" defaultChecked={event.allowWaitlist} />
              Warteliste erlauben
            </label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notifyNotes">Hinweis für Benachrichtigung (optional)</Label>
            <Textarea
              id="notifyNotes"
              value={notifyNotes}
              onChange={(e) => setNotifyNotes(e.target.value)}
              rows={2}
              placeholder="z.B. Bitte 10 Min. früher da sein…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cancelReason">Absage-Grund (optional)</Label>
            <Input
              id="cancelReason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Wird bei Absage an Teilnehmer gesendet"
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Speichern
          </Button>
        </form>
      )}

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold">Teilnehmer & QR-Codes</h2>
            <p className="text-sm text-slate-500">
              {selected.size} von {participants.length} ausgewählt
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setShowAdd(!showAdd)}>
              <UserPlus className="mr-2 h-4 w-4" aria-hidden />
              Teilnehmer eintragen
            </Button>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={allSelected} onCheckedChange={(c) => toggleAll(c === true)} aria-label="Alle auswählen" />
              Alle
            </label>
            <Button asChild size="sm" disabled={selected.size === 0}>
              <a href={pdfUrl(selectedIds)} download>
                <Download className="mr-2 h-4 w-4" aria-hidden />
                QR-PDF ({selected.size})
              </a>
            </Button>
            <Button asChild size="sm" variant="outline" disabled={participants.length === 0}>
              <a href={pdfUrl()} download>
                Alle QR-PDFs
              </a>
            </Button>
          </div>
        </div>

        {showAdd && (
          <form
            className="mt-4 grid gap-3 rounded-xl border border-aqua-100 bg-aqua-50/30 p-4 sm:grid-cols-2"
            action={(fd) =>
              startTransition(async () => {
                await addParticipantManual({
                  eventId: event.id,
                  parentName: fd.get("parentName") as string,
                  childName: fd.get("childName") as string,
                  email: fd.get("email") as string,
                  phone: fd.get("phone") as string,
                });
                setMessage("Teilnehmer eingeladen – Bestätigungs-E-Mail gesendet.");
                setShowAdd(false);
              })
            }
          >
            <Input name="parentName" placeholder="Elternname" required />
            <Input name="childName" placeholder="Kindname" required />
            <Input name="email" type="email" placeholder="E-Mail" required />
            <Input name="phone" placeholder="Telefon" required />
            <Button type="submit" className="sm:col-span-2" disabled={pending}>
              Hinzufügen
            </Button>
          </form>
        )}

        <BulkPhotoUpload
          eventId={event.id}
          participantCount={participants.length}
          disabled={pending}
          onMessage={setMessage}
        />

        {participants.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            Noch keine Teilnehmer – manuell eintragen oder Anmeldungen abwarten.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 lg:grid-cols-2">
            {participants.map((p) => (
              <li key={p.id} className="rounded-xl border border-slate-100 p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selected.has(p.id)}
                    onCheckedChange={(c) => toggleOne(p.id, c === true)}
                    aria-label={`${p.childName} auswählen`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-aqua-600">
                          #{String(p.participantNumber).padStart(3, "0")}
                        </p>
                        <p className="font-medium">{p.childName}</p>
                        <p className="text-sm text-slate-500">{p.parentName}</p>
                        <p className="text-xs text-slate-400">{p.email}</p>
                      </div>
                      <ShootingParticipantMenu
                        participantId={p.id}
                        participantLabel={p.childName}
                        eventId={event.id}
                        status={p.status}
                        orders={ordersByParticipant[p.id] ?? []}
                      />
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          participantStatusColors[p.status],
                        )}
                      >
                        {participantStatusLabels[normalizeParticipantStatus(p.status)]}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {participantSourceLabels[p.registrationSource]}
                      </span>
                      {(ordersByParticipant[p.id] ?? []).map((order) => (
                        <span
                          key={order.orderId}
                          className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-800"
                          title={orderStatusLabels[order.status]}
                        >
                          {order.isReorder ? "Nachbestellung" : "Bestellung"} · {order.orderNumber}
                        </span>
                      ))}
                    </div>

                    {p.qrDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.qrDataUrl}
                        alt={`QR-Code ${p.childName}`}
                        width={120}
                        height={120}
                        className="mt-3 rounded-lg border bg-white"
                      />
                    ) : (
                      <p className="mt-2 text-xs text-amber-600">QR fehlt – „QR-Codes reparieren“ klicken</p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline">
                        <a href={pdfUrl([p.id])} download>
                          <Download className="mr-1 h-3 w-3" aria-hidden />
                          QR-PDF
                        </a>
                      </Button>
                    </div>

                    <ParticipantPhotoManager
                      eventId={event.id}
                      participantId={p.id}
                      participantName={p.childName}
                      participantNumber={p.participantNumber}
                      photos={p.photos}
                      disabled={pending}
                      onMessage={setMessage}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

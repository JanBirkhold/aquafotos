"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { CalendarCheck, Loader2 } from "lucide-react";
import { confirmIndividualShootingAppointment } from "@/lib/actions/appointment-scheduling";
import { confirmVoucherRedemptionAppointment } from "@/lib/actions/voucher";
import {
  defaultNewEventFromRequest,
  type NewEventInput,
} from "@/lib/appointment-scheduling-shared";
import {
  resolveDefaultShootingLocation,
  setLastConfirmedShootingLocation,
} from "@/lib/voucher-redemption-location-storage";
import type { VoucherAssignableEvent } from "@/lib/events";
import {
  categoryShootingTypes,
  getCategoryForShootingType,
  shootingCategoryLabels,
  shootingTypeLabels,
} from "@/lib/shooting-types";
import type { ShootingCategory, ShootingType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type VoucherRedemptionConfirmProps = {
  voucherId?: string;
  requestId?: string;
  code?: string;
  parentName: string;
  productTitle?: string;
  shootingType?: ShootingType;
  defaultDate: string;
  defaultTime?: string;
  defaultLocation?: string;
  assignableEvents?: VoucherAssignableEvent[];
  needsContact?: boolean;
  defaultEmail?: string;
  defaultChildName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
};

type AssignmentMode = "individual" | "event";
type EventMode = "existing" | "new";

export function VoucherRedemptionConfirm({
  voucherId,
  requestId,
  code,
  parentName,
  productTitle,
  shootingType = "OTHER",
  defaultDate,
  defaultTime = "",
  defaultLocation = "",
  assignableEvents = [],
  needsContact = false,
  defaultEmail = "",
  defaultChildName = "",
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
}: VoucherRedemptionConfirmProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [mode, setMode] = useState<AssignmentMode>("individual");
  const [eventMode, setEventMode] = useState<EventMode>("existing");
  const [eventId, setEventId] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [location, setLocation] = useState(defaultLocation);
  const [contactName, setContactName] = useState(parentName);
  const [contactChildName, setContactChildName] = useState(defaultChildName || parentName);
  const [contactEmail, setContactEmail] = useState(defaultEmail);
  const [contactPhone, setContactPhone] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventCategory, setEventCategory] = useState<ShootingCategory>(
    getCategoryForShootingType(shootingType),
  );
  const [eventShootingType, setEventShootingType] = useState<ShootingType>(shootingType);
  const [maxParticipants, setMaxParticipants] = useState(12);
  const [publishEvent, setPublishEvent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const selectedEvent = assignableEvents.find((event) => event.id === eventId);

  const eventShootingOptions = useMemo(
    () => categoryShootingTypes[eventCategory] ?? [],
    [eventCategory],
  );

  const defaultNewEvent = useMemo(
    () =>
      defaultNewEventFromRequest({
        shootingType,
        productTitle: productTitle ?? null,
        parentName,
      }),
    [shootingType, productTitle, parentName],
  );

  useEffect(() => {
    if (open) {
      setMode("individual");
      setEventMode(assignableEvents.length === 0 ? "new" : "existing");
      setEventId("");
      setDate(defaultDate);
      setTime(defaultTime);
      setLocation(resolveDefaultShootingLocation(defaultLocation));
      setContactName(parentName);
      setContactChildName(defaultChildName || parentName);
      setContactEmail(defaultEmail);
      setContactPhone("");
      setEventTitle(defaultNewEvent.title);
      setEventCategory(defaultNewEvent.category);
      setEventShootingType(defaultNewEvent.shootingType);
      setMaxParticipants(defaultNewEvent.maxParticipants);
      setPublishEvent(false);
      setError(null);
    }
  }, [
    open,
    defaultDate,
    defaultTime,
    defaultLocation,
    parentName,
    defaultChildName,
    defaultEmail,
    assignableEvents.length,
    defaultNewEvent,
  ]);

  useEffect(() => {
    if (mode !== "event" || eventMode !== "existing" || !selectedEvent) return;
    setDate(selectedEvent.date);
    setTime(selectedEvent.startTime ?? "");
    setLocation(selectedEvent.location);
  }, [mode, eventMode, selectedEvent]);

  useEffect(() => {
    if (!eventShootingOptions.includes(eventShootingType)) {
      setEventShootingType(eventShootingOptions[0] ?? "OTHER");
    }
  }, [eventCategory, eventShootingOptions, eventShootingType]);

  function buildNewEventPayload(): NewEventInput | undefined {
    if (mode !== "event" || eventMode !== "new") return undefined;
    return {
      title: eventTitle.trim(),
      category: eventCategory,
      shootingType: eventShootingType,
      maxParticipants,
      publish: publishEvent,
    };
  }

  function handleConfirm() {
    if (!date) {
      setError("Bitte ein Datum wählen.");
      return;
    }
    if (!location.trim()) {
      setError("Bitte einen Ort angeben.");
      return;
    }
    if (mode === "event" && eventMode === "existing" && !eventId) {
      setError("Bitte ein Event wählen oder neues Event anlegen.");
      return;
    }
    if (mode === "event" && eventMode === "new" && !eventTitle.trim()) {
      setError("Bitte einen Event-Titel angeben.");
      return;
    }
    if (needsContact && !contactPhone.trim()) {
      setError("Bitte Telefonnummer angeben.");
      return;
    }
    if (!voucherId && !requestId) {
      setError("Terminanfrage nicht verknüpft.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const scheduleInput = {
        confirmedDate: date,
        confirmedTime: time.trim() || undefined,
        confirmedLocation: location.trim(),
        eventId: mode === "event" && eventMode === "existing" ? eventId : undefined,
        newEvent: buildNewEventPayload(),
      };

      const result = voucherId
        ? await confirmVoucherRedemptionAppointment({
            voucherId,
            ...scheduleInput,
            parentName: needsContact ? contactName.trim() : undefined,
            childName: needsContact ? contactChildName.trim() : undefined,
            email: needsContact ? contactEmail.trim() : undefined,
            phone: needsContact ? contactPhone.trim() : undefined,
          })
        : await confirmIndividualShootingAppointment({
            requestId: requestId!,
            ...scheduleInput,
          });

      if (result.error) {
        setError(result.error);
        return;
      }

      setLastConfirmedShootingLocation(location.trim());
      setOpen(false);

      if (result.emailConfigured && !result.emailSent) {
        alert("Termin gespeichert, aber die Bestätigungs-E-Mail konnte nicht gesendet werden.");
      }
    });
  }

  const subtitle = [
    parentName,
    code ? `· ${code}` : null,
    productTitle ? `· ${productTitle}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {showTrigger && (
        <Button
          type="button"
          size="default"
          className="shadow-md shadow-aqua-500/20"
          onClick={() => setOpen(true)}
        >
          <CalendarCheck className="h-4 w-4" aria-hidden />
          Termin planen
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto border-slate-200 bg-white p-6 text-slate-900 sm:rounded-2xl">
          <h2 className="font-display text-lg font-semibold text-aqua-900">
            Termin planen
          </h2>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>

          {needsContact && (
            <div className="mt-4 space-y-3 rounded-xl border border-amber-100 bg-amber-50/60 p-3">
              <p className="text-xs font-medium text-amber-950">
                Gutschein noch nicht eingelöst – Kontaktdaten für Terminanfrage
              </p>
              <div className="space-y-2">
                <Label htmlFor={`confirm-parent-${voucherId ?? requestId}`}>Name *</Label>
                <Input
                  id={`confirm-parent-${voucherId ?? requestId}`}
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`confirm-child-${voucherId ?? requestId}`}>Kind / Motiv</Label>
                <Input
                  id={`confirm-child-${voucherId ?? requestId}`}
                  value={contactChildName}
                  onChange={(event) => setContactChildName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`confirm-email-${voucherId ?? requestId}`}>E-Mail *</Label>
                <Input
                  id={`confirm-email-${voucherId ?? requestId}`}
                  type="email"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`confirm-phone-${voucherId ?? requestId}`}>Telefon *</Label>
                <Input
                  id={`confirm-phone-${voucherId ?? requestId}`}
                  type="tel"
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className={cn(
                "flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                mode === "individual"
                  ? "border-aqua-300 bg-aqua-50 text-aqua-900"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50",
              )}
              onClick={() => setMode("individual")}
            >
              Einzelshooting
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                mode === "event"
                  ? "border-aqua-300 bg-aqua-50 text-aqua-900"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50",
              )}
              onClick={() => setMode("event")}
            >
              Event
            </button>
          </div>

          {mode === "event" && (
            <div className="mt-4 space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  className={cn(
                    "flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium",
                    eventMode === "existing"
                      ? "border-aqua-300 bg-aqua-50 text-aqua-900"
                      : "border-slate-200 text-slate-600",
                  )}
                  onClick={() => setEventMode("existing")}
                  disabled={assignableEvents.length === 0}
                >
                  Bestehendes Event
                </button>
                <button
                  type="button"
                  className={cn(
                    "flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium",
                    eventMode === "new"
                      ? "border-aqua-300 bg-aqua-50 text-aqua-900"
                      : "border-slate-200 text-slate-600",
                  )}
                  onClick={() => setEventMode("new")}
                >
                  Neues Event
                </button>
              </div>

              {eventMode === "existing" ? (
                <div className="space-y-2">
                  <Label htmlFor={`confirm-event-${voucherId ?? requestId}`}>Event *</Label>
                  <select
                    id={`confirm-event-${voucherId ?? requestId}`}
                    value={eventId}
                    onChange={(event) => setEventId(event.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Event wählen…</option>
                    {assignableEvents.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title} · {new Date(event.date).toLocaleDateString("de-DE")}
                        {event.spotsLeft <= 0 ? " (voll)" : ` · ${event.spotsLeft} frei`}
                      </option>
                    ))}
                  </select>
                  {assignableEvents.length === 0 && (
                    <p className="text-xs text-amber-800">
                      Kein passendes Event – legen Sie unten ein neues an.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <div className="space-y-2">
                    <Label htmlFor={`new-event-title-${voucherId ?? requestId}`}>Event-Titel *</Label>
                    <Input
                      id={`new-event-title-${voucherId ?? requestId}`}
                      value={eventTitle}
                      onChange={(event) => setEventTitle(event.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`new-event-category-${voucherId ?? requestId}`}>Kategorie</Label>
                      <select
                        id={`new-event-category-${voucherId ?? requestId}`}
                        value={eventCategory}
                        onChange={(event) =>
                          setEventCategory(event.target.value as ShootingCategory)
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {Object.entries(shootingCategoryLabels).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`new-event-type-${voucherId ?? requestId}`}>Shooting-Art</Label>
                      <select
                        id={`new-event-type-${voucherId ?? requestId}`}
                        value={eventShootingType}
                        onChange={(event) =>
                          setEventShootingType(event.target.value as ShootingType)
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {eventShootingOptions.map((type) => (
                          <option key={type} value={type}>
                            {shootingTypeLabels[type]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`new-event-max-${voucherId ?? requestId}`}>Max. Teilnehmer</Label>
                    <Input
                      id={`new-event-max-${voucherId ?? requestId}`}
                      type="number"
                      min={1}
                      value={maxParticipants}
                      onChange={(event) =>
                        setMaxParticipants(Math.max(1, Number(event.target.value) || 1))
                      }
                    />
                  </div>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-aqua-600 focus:ring-aqua-500"
                      checked={publishEvent}
                      onChange={(event) => setPublishEvent(event.target.checked)}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-aqua-900">
                        Sofort veröffentlichen
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        Event live auf /shootings – Shooting-Abonnenten erhalten eine E-Mail.
                      </span>
                    </span>
                  </label>
                  <p className="text-xs text-slate-500">
                    {publishEvent
                      ? "Event wird veröffentlicht, Teilnehmer wird hinzugefügt."
                      : "Event wird als Entwurf angelegt, Teilnehmer wird hinzugefügt."}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`confirm-date-${voucherId ?? requestId}`}>Datum *</Label>
              <Input
                id={`confirm-date-${voucherId ?? requestId}`}
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`confirm-time-${voucherId ?? requestId}`}>Uhrzeit</Label>
              <Input
                id={`confirm-time-${voucherId ?? requestId}`}
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`confirm-location-${voucherId ?? requestId}`}>Ort *</Label>
              <Input
                id={`confirm-location-${voucherId ?? requestId}`}
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Studio, Adresse oder Location"
                required
              />
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <p className="mt-3 text-xs text-slate-500">
            {mode === "individual"
              ? "Einzelshooting – erscheint unter Shootings → Einzelshootings. Bestätigungs-E-Mail an den Kunden."
              : eventMode === "new"
                ? publishEvent
                  ? "Neues Event wird veröffentlicht + Teilnehmer. Bestätigungs-E-Mail mit Termin."
                  : "Neues Event (Entwurf) + Teilnehmer. Bestätigungs-E-Mail mit Termin."
                : "Teilnehmer wird dem Event hinzugefügt. Bestätigungs-E-Mail an den Kunden."}
          </p>

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="button" disabled={pending} onClick={handleConfirm}>
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Wird gespeichert…
                </>
              ) : (
                "Bestätigen & E-Mail senden"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

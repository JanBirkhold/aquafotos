"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarClock, Loader2 } from "lucide-react";
import { rescheduleIndividualShootingAppointment } from "@/lib/actions/appointment-scheduling";
import { rescheduleVoucherRedemptionAppointment } from "@/lib/actions/voucher";
import {
  resolveDefaultShootingLocation,
  setLastConfirmedShootingLocation,
} from "@/lib/voucher-redemption-location-storage";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type VoucherRedemptionRescheduleProps = {
  requestId?: string;
  voucherId?: string;
  code: string;
  parentName: string;
  defaultDate: string;
  defaultTime?: string;
  defaultLocation?: string;
  currentLabel: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
};

export function VoucherRedemptionReschedule({
  requestId,
  voucherId,
  code,
  parentName,
  defaultDate,
  defaultTime = "",
  defaultLocation = "",
  currentLabel,
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
}: VoucherRedemptionRescheduleProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [location, setLocation] = useState(defaultLocation);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  useEffect(() => {
    if (open) {
      setDate(defaultDate);
      setTime(defaultTime);
      setLocation(resolveDefaultShootingLocation(defaultLocation));
      setMessage("");
      setError(null);
    }
  }, [open, defaultDate, defaultTime, defaultLocation]);

  function handleSave() {
    if (!date) {
      setError("Bitte ein Datum wählen.");
      return;
    }
    if (!location.trim()) {
      setError("Bitte einen Ort angeben.");
      return;
    }
    if (!voucherId && !requestId) {
      setError("Terminanfrage nicht verknüpft.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const payload = {
        confirmedDate: date,
        confirmedTime: time.trim() || undefined,
        confirmedLocation: location.trim(),
        notifyMessage: message.trim() || undefined,
      };

      const result = voucherId
        ? await rescheduleVoucherRedemptionAppointment({ voucherId, ...payload })
        : await rescheduleIndividualShootingAppointment({ requestId: requestId!, ...payload });

      if (result.error) {
        setError(result.error);
        return;
      }

      setLastConfirmedShootingLocation(location.trim());
      setOpen(false);

      if (result.message) {
        alert(result.message);
      } else if (result.emailConfigured && !result.emailSent) {
        alert("Termin gespeichert, aber die Benachrichtigung konnte nicht gesendet werden.");
      }
    });
  }

  return (
    <>
      {showTrigger && (
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
          <CalendarClock className="h-4 w-4" aria-hidden />
          Termin ändern
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border-slate-200 bg-white p-6 text-slate-900 sm:rounded-2xl">
          <h2 className="font-display text-lg font-semibold text-aqua-900">Termin ändern</h2>
          <p className="mt-1 text-sm text-slate-600">
            {parentName}
            {code ? (
              <>
                {" "}
                · <span className="font-mono text-xs">{code}</span>
              </>
            ) : null}
          </p>
          <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Aktuell: {currentLabel}
          </p>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`reschedule-date-${voucherId ?? requestId}`}>Neues Datum *</Label>
              <Input
                id={`reschedule-date-${voucherId ?? requestId}`}
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`reschedule-time-${voucherId ?? requestId}`}>Neue Uhrzeit</Label>
              <Input
                id={`reschedule-time-${voucherId ?? requestId}`}
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`reschedule-location-${voucherId ?? requestId}`}>Neuer Ort *</Label>
              <Input
                id={`reschedule-location-${voucherId ?? requestId}`}
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`reschedule-message-${voucherId ?? requestId}`}>
                Hinweis an Kunden (optional)
              </Label>
              <Textarea
                id={`reschedule-message-${voucherId ?? requestId}`}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={3}
                placeholder="z. B. wegen Wetter auf nächsten Tag verschoben"
              />
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <p className="mt-3 text-xs text-slate-500">
            Der Kunde erhält eine E-Mail mit altem und neuem Termin.
          </p>

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="button" disabled={pending} onClick={handleSave}>
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Wird gespeichert…
                </>
              ) : (
                "Speichern & benachrichtigen"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Archive, CalendarCheck, RotateCcw, XCircle } from "lucide-react";
import {
  cancelConfirmedAppointment,
  reopenCancelledAppointmentRequest,
} from "@/lib/actions/appointment-scheduling";
import { AppointmentDeleteButton } from "@/components/admin/appointment-delete-button";
import { AppointmentArchiveButton } from "@/components/admin/appointment-archive-button";
import { OpenAppointmentRequestActions } from "@/components/admin/open-appointment-request-actions";
import { VoucherRedemptionReschedule } from "@/components/admin/voucher-redemption-reschedule";
import { showActionResultToast } from "@/lib/admin-action-toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import type {
  ClosedAppointmentRequest,
  OpenAppointmentRequest,
  PlannedAppointmentRequest,
  TerminanfragenTab,
} from "@/lib/appointment-scheduling-types";
import type { VoucherAssignableEvent } from "@/lib/events";
import {
  formatConfirmedAppointmentLabel,
  toDateInputValue,
} from "@/lib/voucher-appointment-format";
import { shootingTypeLabels } from "@/lib/shooting-types";
import { cn } from "@/lib/utils";

type Props = {
  openRequests: OpenAppointmentRequest[];
  plannedRequests: PlannedAppointmentRequest[];
  cancelledRequests: ClosedAppointmentRequest[];
  archivedRequests: ClosedAppointmentRequest[];
  assignableEvents: VoucherAssignableEvent[];
  defaultLocation: string;
};

const TAB_LABELS: Record<TerminanfragenTab, string> = {
  open: "Offen",
  planned: "Geplant",
  cancelled: "Abgesagt",
  archived: "Archiv",
};

export function TerminanfragenPanel({
  openRequests,
  plannedRequests,
  cancelledRequests,
  archivedRequests,
  assignableEvents,
  defaultLocation,
}: Props) {
  const [tab, setTab] = useState<TerminanfragenTab>("open");
  const { confirm, confirmDialog } = useConfirm();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const counts = {
    open: openRequests.length,
    planned: plannedRequests.length,
    cancelled: cancelledRequests.length,
    archived: archivedRequests.length,
  };

  return (
    <div className="space-y-4">
      {confirmDialog}

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Terminanfragen filtern"
      >
        {(["open", "planned", "cancelled", "archived"] as const).map((key) => (
          <Button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            variant={tab === key ? "default" : "outline"}
            size="sm"
            onClick={() => setTab(key)}
          >
            {TAB_LABELS[key]}
            <span
              className={cn(
                "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                tab === key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600",
              )}
            >
              {counts[key]}
            </span>
          </Button>
        ))}
      </div>

      {tab === "open" && (
        <OpenTab
          requests={openRequests}
          assignableEvents={assignableEvents}
          defaultLocation={defaultLocation}
        />
      )}

      {tab === "planned" && (
        <PlannedTab
          requests={plannedRequests}
          pending={pending}
          onCancel={async (row) => {
            const ok = await confirm({
              title: "Termin absagen?",
              description: `${row.parentName} erhält eine Absage-E-Mail. Der Eintrag erscheint unter „Abgesagt“.`,
              confirmLabel: "Termin absagen",
              variant: "destructive",
            });
            if (!ok) return;

            startTransition(async () => {
              const result = await cancelConfirmedAppointment({ requestId: row.requestId });
              showActionResultToast(toast, result);
            });
          }}
        />
      )}

      {tab === "cancelled" && (
        <CancelledTab
          requests={cancelledRequests}
          pending={pending}
          onReopen={async (requestId, parentName) => {
            const ok = await confirm({
              title: "Anfrage wieder öffnen?",
              description: `${parentName} erscheint wieder unter „Offen“ und kann neu geplant werden.`,
              confirmLabel: "Wieder öffnen",
            });
            if (!ok) return;

            startTransition(async () => {
              const result = await reopenCancelledAppointmentRequest({ requestId });
              showActionResultToast(toast, result);
            });
          }}
        />
      )}

      {tab === "archived" && <ArchivedTab requests={archivedRequests} />}
    </div>
  );
}

function OpenTab({
  requests,
  assignableEvents,
  defaultLocation,
}: {
  requests: OpenAppointmentRequest[];
  assignableEvents: VoucherAssignableEvent[];
  defaultLocation: string;
}) {
  if (requests.length === 0) {
    return (
      <EmptyState
        title="Keine offenen Terminanfragen"
        description="Neue Anfragen erscheinen hier nach Gutschein-Einlösung mit Wunschtermin."
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        {requests.length}{" "}
        {requests.length === 1 ? "offene Anfrage" : "offene Anfragen"} · Termin planen, Event
        zuordnen oder Anfrage absagen.
      </p>
      <ul className="space-y-3">
        {requests.map((row) => (
          <RequestCard key={row.id} row={row}>
            <OpenAppointmentRequestActions
              row={row}
              assignableEvents={assignableEvents}
              defaultLocation={defaultLocation}
            />
          </RequestCard>
        ))}
      </ul>
    </div>
  );
}

function PlannedTab({
  requests,
  pending,
  onCancel,
}: {
  requests: PlannedAppointmentRequest[];
  pending: boolean;
  onCancel: (row: PlannedAppointmentRequest) => Promise<void>;
}) {
  if (requests.length === 0) {
    return (
      <EmptyState
        title="Keine geplanten Termine"
        description="Bestätigte Termine erscheinen hier – verschieben oder absagen."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {requests.map((row) => {
        const currentLabel = formatConfirmedAppointmentLabel({
          confirmedDate: new Date(`${row.confirmedDate}T12:00:00`),
          confirmedTime: row.confirmedTime,
          confirmedLocation: row.confirmedLocation,
        });
        const defaultDate = toDateInputValue(new Date(`${row.confirmedDate}T12:00:00`));

        return (
          <RequestCard
            key={row.requestId}
            row={row}
            badge={{ label: "Geplant", className: "bg-green-100 text-green-800" }}
            extra={
              <>
                <p className="mt-2 font-medium text-slate-800">{currentLabel}</p>
                {row.hasGalleryData && (
                  <p className="mt-2 text-xs text-amber-700">
                    Galerie mit Fotos – nur archivieren, nicht absagen oder verschieben.
                  </p>
                )}
              </>
            }
          >
            <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
              {row.voucherId && (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/shootings/einzel/${row.requestId}`}>Einzelshooting</Link>
                </Button>
              )}
              {row.hasGalleryData ? (
                <AppointmentArchiveButton
                  requestId={row.requestId}
                  parentName={row.parentName}
                />
              ) : (
                <>
                  <VoucherRedemptionReschedule
                    requestId={row.requestId}
                    voucherId={row.voucherId ?? undefined}
                    code={row.voucherCode ?? ""}
                    parentName={row.parentName}
                    defaultDate={defaultDate}
                    defaultTime={row.confirmedTime ?? ""}
                    defaultLocation={row.confirmedLocation ?? ""}
                    currentLabel={currentLabel}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50 hover:text-red-800"
                    onClick={() => void onCancel(row)}
                  >
                    <XCircle className="h-4 w-4" aria-hidden />
                    Termin absagen
                  </Button>
                </>
              )}
            </div>
          </RequestCard>
        );
      })}
    </ul>
  );
}

function CancelledTab({
  requests,
  pending,
  onReopen,
}: {
  requests: ClosedAppointmentRequest[];
  pending: boolean;
  onReopen: (requestId: string, parentName: string) => Promise<void>;
}) {
  if (requests.length === 0) {
    return (
      <EmptyState
        title="Keine abgesagten Terminanfragen"
        description="Abgesagte Anfragen und Termine ohne Galerie-Fotos erscheinen hier."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {requests.map((row) => (
        <ClosedRequestCard
          key={row.requestId}
          row={row}
          badge={{ label: "Abgesagt", className: "bg-red-100 text-red-800" }}
          dateLabel="Abgesagt"
          termLabel="Abgesagter Termin"
        >
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => void onReopen(row.requestId, row.parentName)}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Wieder öffnen
          </Button>
        </ClosedRequestCard>
      ))}
    </ul>
  );
}

function ArchivedTab({ requests }: { requests: ClosedAppointmentRequest[] }) {
  if (requests.length === 0) {
    return (
      <EmptyState
        icon={Archive}
        title="Archiv ist leer"
        description="Shootings mit Galerie-Fotos landen hier nach dem Archivieren. Endgültiges Löschen ist möglich, solange keine aktiven Bestellungen existieren."
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        {requests.length}{" "}
        {requests.length === 1 ? "archiviertes Shooting" : "archivierte Shootings"} · Galerie
        einsehen oder endgültig löschen (ohne aktive Bestellungen).
      </p>
      <ul className="space-y-3">
        {requests.map((row) => (
          <ClosedRequestCard
            key={row.requestId}
            row={row}
            badge={{ label: "Archiviert", className: "bg-slate-100 text-slate-700" }}
            dateLabel="Archiviert"
            termLabel="Termin"
          >
            <div className="flex flex-col items-stretch gap-2 sm:items-end">
              {row.voucherId ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/shootings/einzel/${row.requestId}`}>Galerie öffnen</Link>
                </Button>
              ) : null}
              <AppointmentDeleteButton
                requestId={row.requestId}
                parentName={row.parentName}
              />
            </div>
          </ClosedRequestCard>
        ))}
      </ul>
    </div>
  );
}

function ClosedRequestCard({
  row,
  badge,
  dateLabel,
  termLabel,
  children,
}: {
  row: ClosedAppointmentRequest;
  badge: { label: string; className: string };
  dateLabel: string;
  termLabel: string;
  children: ReactNode;
}) {
  const termLabelFormatted = row.confirmedDate
    ? formatConfirmedAppointmentLabel({
        confirmedDate: new Date(`${row.confirmedDate}T12:00:00`),
        confirmedTime: row.confirmedTime,
        confirmedLocation: row.confirmedLocation,
      })
    : null;

  return (
    <RequestCard
      row={row}
      badge={badge}
      extra={
        <>
          {termLabelFormatted && (
            <p className="mt-2 text-sm text-slate-600">
              {termLabel}: <span className="font-medium">{termLabelFormatted}</span>
            </p>
          )}
          <p className="mt-1 text-xs text-slate-500">
            {dateLabel} am{" "}
            {new Date(row.closedAt).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </>
      }
    >
      <div className="flex flex-col items-stretch gap-2 sm:items-end">{children}</div>
    </RequestCard>
  );
}

function RequestCard({
  row,
  badge,
  extra,
  children,
}: {
  row: OpenAppointmentRequest;
  badge?: { label: string; className: string };
  extra?: ReactNode;
  children: ReactNode;
}) {
  const shootingLabel = shootingTypeLabels[row.shootingType];

  return (
    <li className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-aqua-900">
              {row.productTitle ?? shootingLabel}
              {row.productTitle ? ` · ${shootingLabel}` : ""}
            </p>
            {badge ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  badge.className,
                )}
              >
                {badge.label}
              </span>
            ) : (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  row.voucherId ? "bg-violet-100 text-violet-800" : "bg-slate-100 text-slate-700",
                )}
              >
                {row.voucherId ? "Gutschein" : "Anfrage"}
              </span>
            )}
          </div>
          {row.voucherCode && (
            <p className="mt-0.5 font-mono text-xs text-slate-500">{row.voucherCode}</p>
          )}
          <p className="mt-2 text-slate-700">
            {row.parentName}
            {row.childName ? ` · ${row.childName}` : ""}
          </p>
          <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-slate-600">
            <a
              href={`mailto:${row.email}`}
              className="text-aqua-700 underline underline-offset-2"
            >
              {row.email}
            </a>
            {row.phone.trim() && (
              <a
                href={`tel:${row.phone.replace(/\s/g, "")}`}
                className="text-aqua-700 underline underline-offset-2"
              >
                {row.phone}
              </a>
            )}
          </p>
          {!badge && (
            <p className="mt-1 text-xs text-slate-500">
              Wunschtermin:{" "}
              {row.preferredDate
                ? new Date(`${row.preferredDate}T12:00:00`).toLocaleDateString("de-DE")
                : "—"}
              {" · "}
              Eingegangen: {new Date(row.createdAt).toLocaleDateString("de-DE")}
            </p>
          )}
          {row.message && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{row.message}</p>
          )}
          {extra}
        </div>
        {children}
      </div>
    </li>
  );
}

function EmptyState({
  title,
  description,
  icon: Icon = CalendarCheck,
}: {
  title: string;
  description: string;
  icon?: typeof CalendarCheck;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <Icon className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
      <p className="mt-4 font-medium text-aqua-900">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

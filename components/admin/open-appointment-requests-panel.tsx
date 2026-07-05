import { OpenAppointmentRequestActions } from "@/components/admin/open-appointment-request-actions";
import type { OpenAppointmentRequest } from "@/lib/appointment-scheduling-types";
import type { VoucherAssignableEvent } from "@/lib/events";
import { shootingTypeLabels } from "@/lib/shooting-types";
import { cn } from "@/lib/utils";

type Props = {
  requests: OpenAppointmentRequest[];
  assignableEvents: VoucherAssignableEvent[];
  defaultLocation: string;
  variant?: "embedded" | "page";
};

export function OpenAppointmentRequestsPanel({
  requests,
  assignableEvents,
  defaultLocation,
  variant = "embedded",
}: Props) {
  if (requests.length === 0) {
    if (variant === "page") {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="font-medium text-aqua-900">Keine offenen Terminanfragen</p>
          <p className="mt-2 text-sm text-slate-500">
            Neue Anfragen erscheinen hier nach Gutschein-Einlösung mit Wunschtermin.
          </p>
        </div>
      );
    }
    return null;
  }

  const list = (
    <ul className={variant === "page" ? "space-y-3" : "mt-4 space-y-2"}>
      {requests.map((row) => {
          const shootingLabel = shootingTypeLabels[row.shootingType];

          return (
            <li
              key={row.id}
              className={cn(
                "rounded-xl px-4 py-3 text-sm shadow-sm",
                variant === "page"
                  ? "border border-slate-200 bg-white"
                  : "bg-white/90",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-aqua-900">
                      {row.productTitle ?? shootingLabel}
                      {row.productTitle ? ` · ${shootingLabel}` : ""}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        row.voucherId
                          ? "bg-violet-100 text-violet-800"
                          : "bg-slate-100 text-slate-700",
                      )}
                    >
                      {row.voucherId ? "Gutschein" : "Anfrage"}
                    </span>
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
                    <a
                      href={`tel:${row.phone.replace(/\s/g, "")}`}
                      className="text-aqua-700 underline underline-offset-2"
                    >
                      {row.phone}
                    </a>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Wunschtermin:{" "}
                    {row.preferredDate
                      ? new Date(`${row.preferredDate}T12:00:00`).toLocaleDateString("de-DE")
                      : "—"}
                    {" · "}
                    Eingegangen:{" "}
                    {new Date(row.createdAt).toLocaleDateString("de-DE")}
                  </p>
                  {row.message && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{row.message}</p>
                  )}
                </div>
                <OpenAppointmentRequestActions
                  row={row}
                  assignableEvents={assignableEvents}
                  defaultLocation={defaultLocation}
                />
              </div>
            </li>
          );
        })}
    </ul>
  );

  if (variant === "page") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          {requests.length}{" "}
          {requests.length === 1 ? "offene Anfrage" : "offene Anfragen"} · Als Einzelshooting
          planen, bestehendem Event zuordnen oder neues Event anlegen – Bestätigungs-E-Mail wird
          automatisch versendet.
        </p>
        {list}
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-violet-200 bg-violet-50/50 p-5">
      <div>
        <h2 className="font-display text-lg font-semibold text-violet-950">
          Terminanfragen offen
        </h2>
        <p className="mt-1 text-sm text-violet-900/80">
          Als Einzelshooting planen, bestehendem Event zuordnen oder neues Event anlegen –
          Bestätigungs-E-Mail wird automatisch versendet.
        </p>
      </div>
      {list}
    </section>
  );
}

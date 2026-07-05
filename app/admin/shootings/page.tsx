import Link from "next/link";
import {
  formatEventDate,
  listAdminEventsPaginated,
  listConfirmedIndividualShootingsPaginated,
  countAdminEvents,
  countConfirmedIndividualShootings,
  getSpotsLeft,
  type EventWithMeta,
  type ConfirmedIndividualShooting,
} from "@/lib/events";
import { AdminShootingPipelineBadges } from "@/components/admin/admin-shooting-pipeline-badges";
import {
  IndividualShootingRowMenu,
  type IndividualShootingMenuRow,
} from "@/components/admin/individual-shooting-row-menu";
import { AdminListPagination } from "@/components/admin/admin-list-pagination";
import { ShootingAdminFilter } from "@/components/admin/shooting-admin-filter";
import { ShootingAdminViewSwitcher } from "@/components/admin/shooting-admin-view-switcher";
import { getDefaultShootingLocation } from "@/lib/default-shooting-location";
import { shootingTypeLabels } from "@/lib/shooting-types";
import {
  formatConfirmedAppointmentLabel,
  toDateInputValue,
} from "@/lib/voucher-appointment-format";
import {
  ADMIN_SHOOTINGS_PAGE_SIZE,
  getShootingsTotalPages,
  parseShootingsListParams,
  type AdminShootingsSearchParams,
} from "@/lib/admin-shootings-list";
import { einzelShootingToPipelineInput } from "@/lib/admin-voucher-pipeline";
import { Button } from "@/components/ui/button";

const statusLabels: Record<string, string> = {
  DRAFT: "Entwurf",
  PUBLISHED: "Live",
  FULL: "Voll",
  COMPLETED: "Fertig",
  CANCELLED: "Abgesagt",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  PUBLISHED: "bg-green-100 text-green-800",
  FULL: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-aqua-100 text-aqua-800",
  CANCELLED: "bg-red-100 text-red-700",
};

type Props = {
  searchParams: Promise<AdminShootingsSearchParams>;
};

function toMenuRow(
  row: Awaited<ReturnType<typeof listConfirmedIndividualShootingsPaginated>>["items"][number],
  defaultLocation: string,
): IndividualShootingMenuRow | null {
  if (!row.voucherId || !row.voucherCode) return null;

  const currentLabel = formatConfirmedAppointmentLabel({
    confirmedDate: new Date(row.confirmedDate),
    confirmedTime: row.confirmedTime,
    confirmedLocation: row.confirmedLocation,
  });

  return {
    voucherId: row.voucherId,
    voucherCode: row.voucherCode,
    purchaseNumber: row.purchaseNumber,
    productTitle: row.productTitle ?? "Einzelshooting",
    parentName: row.parentName,
    confirmedDate: row.confirmedDate,
    confirmedTime: row.confirmedTime,
    confirmedLocation: row.confirmedLocation,
    currentLabel,
    defaultDate: toDateInputValue(new Date(row.confirmedDate)),
    defaultTime: row.confirmedTime ?? "",
    defaultLocation: row.confirmedLocation ?? defaultLocation,
    email: row.email,
  };
}

export default async function AdminShootingsPage({ searchParams }: Props) {
  const params = parseShootingsListParams(await searchParams);
  const defaultLocation = getDefaultShootingLocation();
  const isEventsView = params.view === "events";

  let page = params.page;
  let listResult = isEventsView
    ? await listAdminEventsPaginated({
        page,
        q: params.q || undefined,
        status: params.status,
      })
    : await listConfirmedIndividualShootingsPaginated({
        page,
        q: params.q || undefined,
      });

  const [eventsCount, einzelCount] = await Promise.all([
    countAdminEvents(),
    countConfirmedIndividualShootings(),
  ]);

  const totalPages = getShootingsTotalPages(listResult.total);
  if (page > totalPages && listResult.total > 0) {
    page = totalPages;
    listResult = isEventsView
      ? await listAdminEventsPaginated({
          page,
          q: params.q || undefined,
          status: params.status,
        })
      : await listConfirmedIndividualShootingsPaginated({
          page,
          q: params.q || undefined,
        });
  }

  const events: EventWithMeta[] = isEventsView
    ? (listResult.items as EventWithMeta[])
    : [];
  const individualShootings: ConfirmedIndividualShooting[] = isEventsView
    ? []
    : (listResult.items as ConfirmedIndividualShooting[]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-aqua-900">Shootings</h1>
          <p className="text-sm text-slate-500">
            Events und bestätigte Gutschein-Einzelshootings verwalten
          </p>
        </div>
      </div>

      <ShootingAdminViewSwitcher
        view={params.view}
        eventsCount={eventsCount}
        einzelCount={einzelCount}
        q={params.q || undefined}
        status={params.status}
        actions={
          isEventsView ? (
            <Button asChild size="sm">
              <Link href="/admin/shootings/neu">+ Neues Event</Link>
            </Button>
          ) : undefined
        }
      />

      <ShootingAdminFilter
        view={params.view}
        q={params.q}
        status={params.status}
        filteredCount={listResult.total}
        totalCount={isEventsView ? eventsCount : einzelCount}
      />

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        {isEventsView ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4">Titel</th>
                <th className="p-4">Status</th>
                <th className="p-4">Typ</th>
                <th className="p-4">Datum</th>
                <th className="p-4">Auslastung</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    {params.q || params.status ? (
                      <>Keine Events für diese Filter – Suche anpassen.</>
                    ) : (
                      <>
                        Noch keine Events –{" "}
                        <Link href="/admin/shootings/neu" className="text-aqua-600 hover:underline">
                          erstes Event anlegen
                        </Link>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                events.map((e) => (
                  <tr key={e.id} className="border-b border-slate-50">
                    <td className="p-4 font-medium">{e.title}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[e.status] ?? "bg-slate-100"}`}
                      >
                        {statusLabels[e.status] ?? e.status}
                      </span>
                    </td>
                    <td className="p-4">{shootingTypeLabels[e.shootingType]}</td>
                    <td className="p-4">{formatEventDate(e.date)}</td>
                    <td className="p-4">
                      {e._count.participants}/{e.maxParticipants}
                      {!getSpotsLeft(e) && e.status !== "CANCELLED" && " · Voll"}
                    </td>
                    <td className="p-4 text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/shootings/${e.id}`}>Verwalten</Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4">Kunde</th>
                <th className="p-4">Gutschein</th>
                <th className="p-4">Produkt</th>
                <th className="p-4">Termin</th>
                <th className="p-4">Fortschritt</th>
                <th className="p-4">Kontakt</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {individualShootings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    {params.q ? (
                      <>Keine Einzelshootings für diese Suche.</>
                    ) : (
                      <>
                        Noch keine bestätigten Einzelshootings – Termine bestätigen Sie unter{" "}
                        <Link href="/admin/terminanfragen" className="text-aqua-600 hover:underline">
                          Terminanfragen
                        </Link>
                        .
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                individualShootings.map((row) => {
                  const menuRow = toMenuRow(row, defaultLocation);

                  return (
                    <tr key={row.id} className="border-b border-slate-50">
                      <td className="p-4">
                        <p className="font-medium text-aqua-900">{row.parentName}</p>
                        {row.childName && (
                          <p className="text-xs text-slate-500">{row.childName}</p>
                        )}
                      </td>
                      <td className="p-4 font-mono text-xs">{row.voucherCode ?? "—"}</td>
                      <td className="p-4">{row.productTitle ?? "—"}</td>
                      <td className="p-4">
                        {formatConfirmedAppointmentLabel({
                          confirmedDate: new Date(row.confirmedDate),
                          confirmedTime: row.confirmedTime,
                          confirmedLocation: row.confirmedLocation,
                        })}
                      </td>
                      <td className="p-4">
                        <AdminShootingPipelineBadges
                          input={einzelShootingToPipelineInput(row)}
                          compact
                        />
                      </td>
                      <td className="p-4 text-xs text-slate-600">
                        <a href={`mailto:${row.email}`} className="text-aqua-700 underline">
                          {row.email}
                        </a>
                        <br />
                        <a
                          href={`tel:${row.phone.replace(/\s/g, "")}`}
                          className="text-aqua-700 underline"
                        >
                          {row.phone}
                        </a>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/shootings/einzel/${row.id}`}>Verwalten</Link>
                          </Button>
                          {menuRow && <IndividualShootingRowMenu row={menuRow} />}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        <AdminListPagination
          page={page}
          totalPages={totalPages}
          totalItems={listResult.total}
          view={params.view}
          q={params.q || undefined}
          status={params.status}
        />
      </div>

      <p className="text-xs text-slate-400">
        {ADMIN_SHOOTINGS_PAGE_SIZE} Einträge pro Seite
        {isEventsView
          ? " · Events mit Teilnehmern, QR-Codes und Galerie"
          : " · Bestätigte Gutschein-Termine ohne Event-Zuordnung"}
      </p>
    </div>
  );
}

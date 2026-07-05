import Link from "next/link";
import { TerminanfragenPanel } from "@/components/admin/terminanfragen-panel";
import {
  listArchivedAppointmentRequests,
  listCancelledAppointmentRequests,
  listOpenAppointmentRequests,
  listPlannedAppointmentRequests,
} from "@/lib/appointment-scheduling";
import { getDefaultShootingLocation } from "@/lib/default-shooting-location";
import { getEventsForVoucherAssignment } from "@/lib/events";

export default async function AdminTerminanfragenPage() {
  const defaultLocation = getDefaultShootingLocation();

  const [openRequests, plannedRequests, cancelledRequests, archivedRequests, assignableEvents] =
    await Promise.all([
      listOpenAppointmentRequests(),
      listPlannedAppointmentRequests(),
      listCancelledAppointmentRequests(),
      listArchivedAppointmentRequests(),
      getEventsForVoucherAssignment(),
    ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-aqua-900">Terminanfragen</h1>
          <p className="text-sm text-slate-500">
            Offen, geplant, abgesagt und archivierte Termine – Planung und Verwaltung
          </p>
        </div>
        <Link
          href="/admin/gutscheine"
          className="text-sm text-aqua-700 underline underline-offset-2"
        >
          Alle Gutscheine
        </Link>
      </div>

      <TerminanfragenPanel
        openRequests={openRequests}
        plannedRequests={plannedRequests}
        cancelledRequests={cancelledRequests}
        archivedRequests={archivedRequests}
        assignableEvents={assignableEvents}
        defaultLocation={defaultLocation}
      />
    </div>
  );
}

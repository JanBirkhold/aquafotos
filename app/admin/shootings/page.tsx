import Link from "next/link";
import { getAdminEvents, formatEventDate, getSpotsLeft } from "@/lib/events";
import { shootingTypeLabels } from "@/lib/shooting-types";
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

export default async function AdminShootingsPage() {
  const events = await getAdminEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-aqua-900">Shootings & Events</h1>
          <p className="text-sm text-slate-500">Alle Termine verwalten, QR-Codes drucken, Fotos zuordnen</p>
        </div>
        <Button asChild>
          <Link href="/admin/shootings/neu">+ Neues Event</Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
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
                  Noch keine Events –{" "}
                  <Link href="/admin/shootings/neu" className="text-aqua-600 hover:underline">
                    erstes Event anlegen
                  </Link>
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
      </div>
    </div>
  );
}

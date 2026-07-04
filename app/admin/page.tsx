import Link from "next/link";
import { AdminDashboardStats } from "@/components/admin/dashboard-stats";
import { AdminReorderNotice } from "@/components/admin/admin-reorder-notice";
import { getPublishedEvents } from "@/lib/events";
import { formatEventDate, getSpotsLeft } from "@/lib/events";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const events = await getPublishedEvents();

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold text-aqua-900">
        Dashboard
      </h1>

      <AdminDashboardStats />

      <AdminReorderNotice />

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-semibold text-aqua-900">
          Aktuelle Shootings
        </h2>
        <ul className="mt-4 divide-y divide-slate-100">
          {events.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <p className="font-medium text-slate-800">{e.title}</p>
                <p className="text-sm text-slate-500">
                  {formatEventDate(e.date)} · {getSpotsLeft(e)} frei
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/shootings/${e.id}`}>Verwalten</Link>
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

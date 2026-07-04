import { formatEuro } from "@/lib/pricing";
import { getDashboardStats } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

export async function AdminDashboardStats() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Umsatz heute", value: formatEuro(stats.revenueToday) },
    { label: "Umsatz Monat", value: formatEuro(stats.revenueMonth) },
    { label: "Umsatz Jahr", value: formatEuro(stats.revenueYear) },
    { label: "Teilnehmer gesamt", value: String(stats.totalParticipants) },
    { label: "Offene Shootings", value: String(stats.openEvents) },
    {
      label: "Offene Nachbestellungen",
      value: String(stats.openReorders),
      highlight: stats.openReorders > 0,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className={cn(
            "rounded-2xl bg-white p-6 shadow-sm",
            "highlight" in c && c.highlight && "ring-2 ring-amber-200",
          )}
        >
          <p className="text-sm text-slate-500">{c.label}</p>
          <p className="mt-1 font-display text-2xl font-bold text-aqua-900">
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}

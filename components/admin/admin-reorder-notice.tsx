import Link from "next/link";
import { getOpenReorderOrders } from "@/lib/order-reorder";
import { orderStatusLabels } from "@/lib/order-workflow";
import { Button } from "@/components/ui/button";

export async function AdminReorderNotice() {
  const reorders = await getOpenReorderOrders(5);

  if (reorders.length === 0) return null;

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-amber-950">
            Offene Nachbestellungen
          </h2>
          <p className="mt-1 text-sm text-amber-900/80">
            Kunden haben bereits bestellte Bilder erneut gekauft – bitte wie reguläre Bestellungen
            bearbeiten.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="border-amber-300 bg-white">
          <Link href="/admin/bestellungen">Alle Bestellungen</Link>
        </Button>
      </div>
      <ul className="mt-4 divide-y divide-amber-200/60">
        {reorders.map((order) => (
          <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="font-mono text-sm font-medium text-amber-950">{order.orderNumber}</p>
              <p className="text-xs text-amber-900/70">
                {order.items[0]?.photo.filename ?? "—"} · {order.items.length} Bild
                {order.items.length !== 1 ? "er" : ""} · {orderStatusLabels[order.status]}
              </p>
            </div>
            <Link
              href={`/admin/bestellungen/${order.id}`}
              className="text-sm font-medium text-aqua-700 hover:underline"
            >
              Bearbeiten
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

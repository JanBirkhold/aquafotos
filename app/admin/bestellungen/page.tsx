import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OrderRowMenu } from "@/components/admin/order-row-menu";
import { formatEuro } from "@/lib/pricing";
import { orderStatusColors, orderStatusLabels, orderStatusLabelsShort } from "@/lib/order-workflow";
import { cn } from "@/lib/utils";

export default async function AdminBestellungenPage() {
  let orders: Awaited<
    ReturnType<
      typeof prisma.order.findMany<{
        include: {
          items: { include: { photo: true } };
        };
        orderBy: { createdAt: "desc" };
        take: 50;
      }>
    >
  > = [];

  try {
    orders = await prisma.order.findMany({
      include: {
        items: { include: { photo: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch {
    orders = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-aqua-900">Bestellungen</h1>
        <p className="mt-2 text-sm text-slate-600">
          Fotos bearbeiten, Status & Sichtung pro Bild, Kunde benachrichtigen wenn fertig.
        </p>
      </div>

      {orders.length === 0 ? (
        <p className="text-slate-500">Noch keine Bestellungen.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4">Nr.</th>
                <th className="p-4">Status</th>
                <th className="p-4">Typ</th>
                <th className="p-4">Bilder</th>
                <th className="p-4">Bearbeitung</th>
                <th className="p-4">Summe</th>
                <th className="p-4">Datum</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const readyCount = o.items.filter((i) => i.status === "READY").length;
                const inReview = o.items.filter((i) => i.status === "IN_REVIEW").length;
                const hasDownloads = o.items.some((i) => i.finalStorageKey);
                return (
                  <tr key={o.id} className="border-b border-slate-50">
                    <td className="p-4 font-mono">{o.orderNumber}</td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "inline-block max-w-[7.5rem] truncate rounded-full px-2 py-0.5 text-xs font-medium",
                          orderStatusColors[o.status],
                        )}
                        title={orderStatusLabels[o.status]}
                      >
                        {orderStatusLabelsShort[o.status]}
                      </span>
                    </td>
                    <td className="p-4">
                      {o.isReorder ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                          Nachbestellung
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Erstbestellung</span>
                      )}
                    </td>
                    <td className="p-4">{o.items.length}</td>
                    <td className="p-4 text-xs text-slate-600">
                      {readyCount}/{o.items.length} fertig
                      {inReview > 0 ? ` · ${inReview} Sichtung` : ""}
                      {o.readyNotifiedAt ? " · ✉ gesendet" : ""}
                      {hasDownloads ? " · Download" : ""}
                    </td>
                    <td className="p-4">{formatEuro(o.totalCents)}</td>
                    <td className="p-4">
                      {o.createdAt.toLocaleDateString("de-DE")}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/bestellungen/${o.id}`}
                          className="font-medium text-aqua-700 hover:underline"
                        >
                          Bearbeiten
                        </Link>
                        <OrderRowMenu
                          orderId={o.id}
                          orderNumber={o.orderNumber}
                          status={o.status}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

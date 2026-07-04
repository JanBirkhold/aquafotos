import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { shootingTypeLabels } from "@/lib/shooting-types";
import { cn } from "@/lib/utils";

const voucherStatusLabels: Record<string, string> = {
  PENDING_PAYMENT: "Zahlung ausstehend",
  PAID: "Bezahlt",
  REDEEMED: "Eingelöst",
  EXPIRED: "Abgelaufen",
  CANCELLED: "Storniert",
};

const voucherStatusColors: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  PAID: "bg-green-100 text-green-800",
  REDEEMED: "bg-slate-100 text-slate-800",
  EXPIRED: "bg-red-100 text-red-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function AdminGutscheinePage() {
  let vouchers: Awaited<
    ReturnType<
      typeof prisma.voucher.findMany<{
        include: { product: true; individualShootingReq: true };
        orderBy: { createdAt: "desc" };
        take: 100;
      }>
    >
  > = [];

  try {
    vouchers = await prisma.voucher.findMany({
      include: { product: true, individualShootingReq: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch {
    vouchers = [];
  }

  const openCount = vouchers.filter((v) => v.status === "PAID").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-aqua-900">Gutscheine</h1>
        <p className="mt-2 text-sm text-slate-600">
          Gekaufte Gutscheine mit Code, QR und Wunschtermin. {openCount} offen zur Einlösung.
        </p>
      </div>

      {vouchers.length === 0 ? (
        <p className="text-slate-500">Noch keine Gutscheine verkauft.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4">Code</th>
                <th className="p-4">Produkt</th>
                <th className="p-4">Käufer</th>
                <th className="p-4">Wunschtermin</th>
                <th className="p-4">Status</th>
                <th className="p-4">QR</th>
                <th className="p-4">Kauf</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.id} className="border-b border-slate-50 align-top">
                  <td className="p-4 font-mono text-xs">{v.code}</td>
                  <td className="p-4">
                    <p className="font-medium">{v.product.title}</p>
                    {v.product.shootingType && (
                      <p className="text-xs text-slate-500">
                        {shootingTypeLabels[v.product.shootingType]}
                      </p>
                    )}
                    {v.recipientName && (
                      <p className="text-xs text-slate-500">Für: {v.recipientName}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <p>{v.buyerName}</p>
                    <p className="text-xs text-slate-500">{v.buyerEmail}</p>
                  </td>
                  <td className="p-4">
                    {v.preferredDate?.toLocaleDateString("de-DE") ?? "—"}
                  </td>
                  <td className="p-4">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        voucherStatusColors[v.status],
                      )}
                    >
                      {voucherStatusLabels[v.status]}
                    </span>
                    {v.individualShootingReq && (
                      <p className="mt-1 text-xs text-slate-500">
                        Anfrage: {v.individualShootingReq.parentName}
                      </p>
                    )}
                  </td>
                  <td className="p-4">
                    {v.qrDataUrl ? (
                      <Image
                        src={v.qrDataUrl}
                        alt=""
                        width={56}
                        height={56}
                        className="rounded border border-slate-100"
                        unoptimized
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    <p className="font-mono">{v.purchaseNumber}</p>
                    <p>{v.createdAt.toLocaleDateString("de-DE")}</p>
                    <Link
                      href={`/gutschein/einloesen?code=${encodeURIComponent(v.code)}`}
                      className="text-aqua-700 hover:underline"
                    >
                      Einlöse-Link
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

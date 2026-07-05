import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import {
  VoucherAdminActions,
  VoucherRowMenu,
  type VoucherPurchaseGroup,
} from "@/components/admin/voucher-admin-actions";
import { AdminShootingPipelineBadges } from "@/components/admin/admin-shooting-pipeline-badges";
import { voucherToPipelineInput } from "@/lib/admin-voucher-pipeline";
import { shootingTypeLabels } from "@/lib/shooting-types";
import { formatEuro } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const voucherStatusLabels: Record<string, string> = {
  PENDING_PAYMENT: "Ausstehend",
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

const voucherStatusTitles: Record<string, string> = {
  PENDING_PAYMENT: "Überweisung ausstehend",
  PAID: "Bezahlt",
  REDEEMED: "Eingelöst",
  EXPIRED: "Abgelaufen",
  CANCELLED: "Storniert",
};

const adminVoucherInclude = {
  product: true,
  individualShootingReq: {
    include: {
      participant: {
        include: {
          galleryAccess: true,
          photos: {
            select: { id: true, processingStatus: true },
          },
        },
      },
    },
  },
} as const;

async function fetchAdminVouchers() {
  return prisma.voucher.findMany({
    include: adminVoucherInclude,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

type AdminVoucherRow = Awaited<ReturnType<typeof fetchAdminVouchers>>[number];

function groupPurchases(vouchers: AdminVoucherRow[]): VoucherPurchaseGroup[] {
  const map = new Map<string, VoucherPurchaseGroup>();

  for (const v of vouchers) {
    const existing = map.get(v.purchaseNumber);
    if (!existing) {
      map.set(v.purchaseNumber, {
        purchaseNumber: v.purchaseNumber,
        buyerName: v.buyerName,
        buyerEmail: v.buyerEmail,
        totalCents: v.priceCents,
        createdAt: v.createdAt.toISOString(),
        status: v.status as VoucherPurchaseGroup["status"],
        itemCount: 1,
        voucherIds: [v.id],
      });
      continue;
    }

    existing.totalCents += v.priceCents;
    existing.itemCount += 1;
    existing.voucherIds.push(v.id);
  }

  return [...map.values()]
    .map((group) => {
      const statuses = vouchers
        .filter((v) => v.purchaseNumber === group.purchaseNumber)
        .map((v) => v.status);
      const unique = new Set(statuses);
      let status: VoucherPurchaseGroup["status"] = "PAID";
      if (unique.has("PENDING_PAYMENT")) status = "PENDING_PAYMENT";
      else if (unique.size === 1 && unique.has("REDEEMED")) status = "REDEEMED";
      return { ...group, status };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function TruncateCell({
  children,
  title,
  mono = false,
  className,
}: {
  children: ReactNode;
  title?: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "block min-w-0 truncate",
        mono && "font-mono text-xs",
        className,
      )}
    >
      {children}
    </span>
  );
}

export default async function AdminGutscheinePage() {
  let vouchers: AdminVoucherRow[] = [];

  try {
    vouchers = await fetchAdminVouchers();
  } catch {
    vouchers = [];
  }

  const purchases = groupPurchases(vouchers);
  const pendingCount = purchases.filter((p) => p.status === "PENDING_PAYMENT").length;
  const openAppointmentCount = vouchers.filter(
    (v) =>
      (v.status === "PAID" || v.status === "REDEEMED") &&
      !v.individualShootingReq?.confirmedDate,
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-aqua-900">Gutscheine</h1>
          <p className="mt-2 text-sm text-slate-600">
            Zahlung per Überweisung – nach Eingang manuell bestätigen, dann Code & QR per E-Mail.
            Einlösung erzeugt eine{" "}
            <strong className="font-medium text-slate-800">Terminanfrage</strong> (kein automatischer
            Shooting-Platz). Termine planen unter{" "}
            <Link href="/admin/terminanfragen" className="text-aqua-700 underline underline-offset-2">
              Terminanfragen
            </Link>
            . Gutschein-Angebote pflegen Sie unter{" "}
            <Link href="/admin/preise" className="text-aqua-700 underline underline-offset-2">
              Preise & Gutscheine
            </Link>
            .
            {pendingCount > 0 && (
              <span className="ml-1 font-medium text-amber-800">
                {pendingCount} Bestellung{pendingCount !== 1 ? "en" : ""} warten auf Zahlung.
              </span>
            )}
          </p>
        </div>
        {openAppointmentCount > 0 && (
          <Link
            href="/admin/terminanfragen"
            className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-900 transition-colors hover:bg-violet-100"
          >
            {openAppointmentCount} Termin{openAppointmentCount !== 1 ? "e" : ""} offen →
          </Link>
        )}
      </div>

      {pendingCount > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
          <h2 className="font-display text-lg font-semibold text-amber-950">
            Offene Überweisungen
          </h2>
          <ul className="mt-3 space-y-2">
            {purchases
              .filter((p) => p.status === "PENDING_PAYMENT")
              .map((p) => {
                const leadVoucher = vouchers.find((v) => v.purchaseNumber === p.purchaseNumber);
                if (!leadVoucher) return null;

                return (
                <li
                  key={p.purchaseNumber}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/80 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm font-medium">{p.purchaseNumber}</p>
                    <p className="truncate text-sm text-slate-600">
                      {p.buyerName} · {formatEuro(p.totalCents)} ·{" "}
                      {new Date(p.createdAt).toLocaleDateString("de-DE")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <VoucherAdminActions group={p} />
                    <VoucherRowMenu
                      row={{
                        voucherId: leadVoucher.id,
                        code: leadVoucher.code,
                        status: leadVoucher.status,
                        purchaseNumber: p.purchaseNumber,
                        isPurchaseLead: true,
                        group: p,
                      }}
                    />
                  </div>
                </li>
                );
              })}
          </ul>
        </section>
      )}

      {vouchers.length === 0 ? (
        <p className="text-slate-500">Noch keine Gutscheine bestellt.</p>
      ) : (
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[12%]" />
              <col className="w-[8%]" />
              <col className="w-[16%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[7%]" />
              <col className="w-[6%]" />
              <col className="w-[11%]" />
            </colgroup>
            <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3 font-medium">Kaufnummer</th>
                <th className="px-3 py-3 font-medium">Code</th>
                <th className="px-3 py-3 font-medium">Produkt</th>
                <th className="px-3 py-3 font-medium">Käufer / Einlöser</th>
                <th className="px-3 py-3 font-medium">Termin</th>
                <th className="px-3 py-3 font-medium">Fortschritt</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">QR</th>
                <th className="px-3 py-3 text-right font-medium">
                  <span className="sr-only">Aktionen</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => {
                const group = purchases.find((p) => p.purchaseNumber === v.purchaseNumber)!;
                const req = v.individualShootingReq;
                const shootingLabel = v.product.shootingType
                  ? shootingTypeLabels[v.product.shootingType]
                  : null;
                const termDate = req?.preferredDate ?? v.preferredDate;
                const canSchedule =
                  (v.status === "PAID" || v.status === "REDEEMED") &&
                  !req?.confirmedDate;

                return (
                  <tr
                    key={v.id}
                    className={cn(
                      "border-b border-slate-50 align-middle",
                      v.status === "REDEEMED" && "bg-violet-50/30",
                      v.status === "PAID" && canSchedule && "bg-green-50/20",
                    )}
                  >
                    <td className="px-3 py-3 align-top">
                      <span className="font-mono text-xs leading-snug text-slate-800 break-all">
                        {v.purchaseNumber}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <TruncateCell title={v.code} mono>
                        {v.code}
                      </TruncateCell>
                    </td>
                    <td className="px-3 py-3">
                      <TruncateCell title={v.product.title} className="font-medium text-aqua-900">
                        {v.product.title}
                      </TruncateCell>
                      {shootingLabel && (
                        <TruncateCell title={shootingLabel} className="mt-0.5 text-xs text-slate-500">
                          {shootingLabel}
                        </TruncateCell>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <TruncateCell title={v.buyerName}>{v.buyerName}</TruncateCell>
                      <TruncateCell title={v.buyerEmail} className="mt-0.5 text-xs text-slate-500">
                        {v.buyerEmail}
                      </TruncateCell>
                      {req && (
                        <>
                          <TruncateCell
                            title={req.parentName}
                            className="mt-1 text-xs font-medium text-violet-800"
                          >
                            ↳ {req.parentName}
                          </TruncateCell>
                          <TruncateCell title={req.email} className="text-xs text-violet-700/80">
                            {req.email}
                          </TruncateCell>
                        </>
                      )}
                    </td>
                    <td className="px-3 py-3 align-top text-xs">
                      {req?.confirmedDate ? (
                        <>
                          <p className="font-medium text-green-800">
                            {req.confirmedDate.toLocaleDateString("de-DE")}
                            {req.confirmedTime ? ` · ${req.confirmedTime.slice(0, 5)}` : ""}
                          </p>
                          {req.confirmedLocation && (
                            <p
                              className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-500"
                              title={req.confirmedLocation}
                            >
                              {req.confirmedLocation}
                            </p>
                          )}
                        </>
                      ) : canSchedule ? (
                        <Link
                          href="/admin/terminanfragen"
                          className="font-medium text-violet-700 underline underline-offset-2"
                        >
                          In Terminanfragen
                        </Link>
                      ) : termDate ? (
                        <span className="text-slate-600">
                          Wunsch{" "}
                          {termDate.toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <AdminShootingPipelineBadges
                        input={voucherToPipelineInput(v)}
                        compact
                      />
                    </td>
                    <td className="px-3 py-3 align-top">
                      <span
                        title={voucherStatusTitles[v.status]}
                        className={cn(
                          "inline-block rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
                          voucherStatusColors[v.status],
                        )}
                      >
                        {voucherStatusLabels[v.status]}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {v.qrDataUrl ? (
                        <Image
                          src={v.qrDataUrl}
                          alt=""
                          width={40}
                          height={40}
                          className="rounded border border-slate-100"
                          unoptimized
                        />
                      ) : (
                        <span className="text-[11px] leading-tight text-slate-400">offen</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <VoucherRowMenu
                        row={{
                          voucherId: v.id,
                          code: v.code,
                          status: v.status,
                          purchaseNumber: v.purchaseNumber,
                          isPurchaseLead: group.voucherIds[0] === v.id,
                          group,
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </section>
      )}
    </div>
  );
}

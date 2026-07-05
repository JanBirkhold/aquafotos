import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { AdminShootingPipelineSummary } from "@/components/admin/admin-shooting-pipeline-badges";
import { VoucherRowMenu } from "@/components/admin/voucher-admin-actions";
import { VoucherRedemptionReschedule } from "@/components/admin/voucher-redemption-reschedule";
import type { VoucherPurchaseGroup } from "@/components/admin/voucher-admin-actions";
import type { VoucherAssignableEvent } from "@/lib/events";
import { voucherToPipelineInput } from "@/lib/admin-voucher-pipeline";
import type { AdminShootingPipelineInput } from "@/lib/admin-shooting-pipeline-status";
import { mapVoucherGalleryAccess } from "@/lib/voucher-gallery";
import {
  formatConfirmedAppointmentLabel,
  toDateInputValue,
} from "@/lib/voucher-appointment-format";
import { siteConfig } from "@/lib/site-config";
import type { VoucherStatus } from "@prisma/client";

export type VoucherConfirmedItem = {
  id: string;
  code: string;
  status: VoucherStatus;
  purchaseNumber: string;
  isPurchaseLead: boolean;
  group: VoucherPurchaseGroup;
  productTitle: string;
  shootingTypeLabel: string | null;
  req: {
    id: string;
    parentName: string;
    childName: string | null;
    email: string;
    phone: string;
    confirmedDate: Date;
    confirmedTime: string | null;
    confirmedLocation: string | null;
    eventId: string | null;
    participant: AdminShootingPipelineInput["participant"];
  };
};

type Props = {
  items: VoucherConfirmedItem[];
  assignableEvents: VoucherAssignableEvent[];
  defaultShootingLocation: string;
};

export function VoucherConfirmedCards({
  items,
  assignableEvents,
  defaultShootingLocation,
}: Props) {
  if (items.length === 0) {
    return (
      <p className="px-4 py-12 text-center text-sm text-slate-500">
        Noch keine bestätigten Termine.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((v) => {
        const { req } = v;
        const gallery = req.participant?.galleryAccess
          ? mapVoucherGalleryAccess({
              galleryAccess: req.participant.galleryAccess,
              photos: req.participant.photos ?? [],
            })
          : null;
        const pipelineInput = voucherToPipelineInput({
          status: v.status,
          preferredDate: null,
          individualShootingReq: {
            preferredDate: null,
            confirmedDate: req.confirmedDate,
            participant: req.participant,
          },
        });
        const appointmentLabel = formatConfirmedAppointmentLabel({
          confirmedDate: req.confirmedDate,
          confirmedTime: req.confirmedTime,
          confirmedLocation: req.confirmedLocation,
        });
        const calendar = {
          title: `${siteConfig.name} – ${v.productTitle}`,
          description: `Gutschein ${v.code}`,
          date: toDateInputValue(req.confirmedDate),
          time: req.confirmedTime,
          location: req.confirmedLocation,
          uid: `aquafotos-voucher-${v.code}@${siteConfig.emailDomain}`,
        };

        return (
          <li
            key={v.id}
            className="flex flex-col rounded-2xl border border-green-100 bg-green-50/30 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-aqua-900">{v.productTitle}</p>
                {v.shootingTypeLabel && (
                  <p className="mt-0.5 text-xs text-slate-500">{v.shootingTypeLabel}</p>
                )}
              </div>
              <span className="shrink-0 font-mono text-[11px] text-slate-500">{v.code}</span>
            </div>

            <p className="mt-3 text-sm text-slate-800">
              {req.parentName}
              {req.childName ? ` · ${req.childName}` : ""}
            </p>
            <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
              <a href={`mailto:${req.email}`} className="text-aqua-700 underline underline-offset-2">
                {req.email}
              </a>
              <a
                href={`tel:${req.phone.replace(/\s/g, "")}`}
                className="text-aqua-700 underline underline-offset-2"
              >
                {req.phone}
              </a>
            </p>

            <div className="mt-4 rounded-xl border border-green-200/80 bg-white/80 px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-xs font-medium text-green-900">
                <CalendarCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Termin
              </p>
              <p className="mt-1 text-sm text-green-900">{appointmentLabel}</p>
            </div>

            <AdminShootingPipelineSummary input={pipelineInput} className="mt-3" />

            <div className="mt-3 space-y-1 text-xs">
              {req.eventId ? (
                <Link href={`/admin/shootings/${req.eventId}`} className="text-aqua-700 underline">
                  Zugeordnetes Event
                </Link>
              ) : (
                <Link href={`/admin/shootings/einzel/${req.id}`} className="text-aqua-700 underline">
                  Einzelshooting verwalten
                </Link>
              )}
              {gallery && (
                <p className="text-slate-600">
                  Code{" "}
                  <Link
                    href={gallery.galleryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-aqua-700 underline"
                  >
                    {gallery.accessCode}
                  </Link>
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-green-100 pt-3">
              <VoucherRedemptionReschedule
                voucherId={v.id}
                code={v.code}
                parentName={req.parentName}
                defaultDate={toDateInputValue(req.confirmedDate)}
                defaultTime={req.confirmedTime ?? ""}
                defaultLocation={req.confirmedLocation ?? defaultShootingLocation}
                currentLabel={appointmentLabel}
              />
              <VoucherRowMenu
                row={{
                  voucherId: v.id,
                  code: v.code,
                  status: v.status,
                  purchaseNumber: v.purchaseNumber,
                  isPurchaseLead: v.isPurchaseLead,
                  group: v.group,
                  reschedule: {
                    parentName: req.parentName,
                    defaultDate: toDateInputValue(req.confirmedDate),
                    defaultTime: req.confirmedTime ?? "",
                    defaultLocation: req.confirmedLocation ?? defaultShootingLocation,
                    currentLabel: appointmentLabel,
                  },
                  calendar,
                }}
                assignableEvents={assignableEvents}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck, Gift, Mail, Phone, User } from "lucide-react";
import { IndividualShootingGalleryPanel } from "@/components/admin/individual-shooting-gallery-panel";
import {
  IndividualShootingRowMenu,
  type IndividualShootingMenuRow,
} from "@/components/admin/individual-shooting-row-menu";
import { AppointmentArchiveButton } from "@/components/admin/appointment-archive-button";
import { AppointmentDeleteButton } from "@/components/admin/appointment-delete-button";
import { VoucherRedemptionReschedule } from "@/components/admin/voucher-redemption-reschedule";
import { getDefaultShootingLocation } from "@/lib/default-shooting-location";
import { getIndividualShootingById } from "@/lib/events";
import {
  getParticipantOrdersByEventId,
  serializeParticipantOrdersMap,
} from "@/lib/shooting-participant-orders";
import {
  formatConfirmedAppointmentLabel,
  toDateInputValue,
} from "@/lib/voucher-appointment-format";
import { shootingTypeLabels } from "@/lib/shooting-types";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEinzelshootingDetailPage({ params }: Props) {
  const { id } = await params;
  const shooting = await getIndividualShootingById(id);
  if (!shooting || !shooting.voucherId || !shooting.voucherCode) notFound();

  const defaultLocation = getDefaultShootingLocation();
  const shootingLabel = shooting.shootingType
    ? shootingTypeLabels[shooting.shootingType as keyof typeof shootingTypeLabels]
    : null;
  const currentLabel = formatConfirmedAppointmentLabel({
    confirmedDate: new Date(shooting.confirmedDate),
    confirmedTime: shooting.confirmedTime,
    confirmedLocation: shooting.confirmedLocation,
  });

  const menuRow: IndividualShootingMenuRow = {
    voucherId: shooting.voucherId,
    voucherCode: shooting.voucherCode,
    purchaseNumber: shooting.purchaseNumber,
    productTitle: shooting.productTitle ?? "Einzelshooting",
    parentName: shooting.parentName,
    confirmedDate: shooting.confirmedDate,
    confirmedTime: shooting.confirmedTime,
    confirmedLocation: shooting.confirmedLocation,
    currentLabel,
    defaultDate: toDateInputValue(new Date(shooting.confirmedDate)),
    defaultTime: shooting.confirmedTime ?? "",
    defaultLocation: shooting.confirmedLocation ?? defaultLocation,
    email: shooting.email,
  };

  const ordersByParticipant = shooting.galleryEventId
    ? serializeParticipantOrdersMap(
        await getParticipantOrdersByEventId(shooting.galleryEventId),
      )
    : {};
  const orders =
    shooting.participant?.id != null
      ? (ordersByParticipant[shooting.participant.id] ?? [])
      : [];

  const photoCount = shooting.participant?.photoCount ?? 0;
  const hasGalleryPhotos = photoCount > 0;
  const isArchived = shooting.status === "ARCHIVED";

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/shootings" className="text-sm text-aqua-600 hover:underline">
          ← Shootings
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-bold text-aqua-900">
                {shooting.productTitle ?? "Einzelshooting"}
              </h1>
              <span
                className={
                  isArchived
                    ? "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    : "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
                }
              >
                {isArchived ? "Archiviert" : "Termin bestätigt"}
              </span>
            </div>
            <p className="mt-2 text-slate-500">
              {shooting.parentName}
              {shooting.childName ? ` · ${shooting.childName}` : ""}
              {shootingLabel ? ` · ${shootingLabel}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isArchived ? (
              <AppointmentDeleteButton
                requestId={shooting.id}
                parentName={shooting.parentName}
                size="default"
                redirectTo="/admin/terminanfragen"
              />
            ) : hasGalleryPhotos ? (
              <AppointmentArchiveButton
                requestId={shooting.id}
                parentName={shooting.parentName}
                size="default"
              />
            ) : (
              <VoucherRedemptionReschedule
                voucherId={shooting.voucherId}
                code={shooting.voucherCode}
                parentName={shooting.parentName}
                defaultDate={menuRow.defaultDate}
                defaultTime={menuRow.defaultTime}
                defaultLocation={menuRow.defaultLocation}
                currentLabel={currentLabel}
              />
            )}
            <IndividualShootingRowMenu
              row={menuRow}
              showReschedule={!hasGalleryPhotos && !isArchived}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-start gap-3 rounded-2xl bg-white p-5 shadow-sm">
          <CalendarCheck className="mt-0.5 h-8 w-8 shrink-0 text-aqua-500" aria-hidden />
          <div>
            <p className="text-sm font-medium text-slate-500">Termin</p>
            <p className="mt-1 font-medium text-aqua-900">{currentLabel}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-2xl bg-white p-5 shadow-sm">
          <Gift className="mt-0.5 h-8 w-8 shrink-0 text-aqua-500" aria-hidden />
          <div>
            <p className="text-sm font-medium text-slate-500">Gutschein</p>
            <p className="mt-1 font-mono text-sm font-medium text-aqua-900">{shooting.voucherCode}</p>
            {shooting.purchaseNumber && (
              <p className="mt-1 text-xs text-slate-500">{shooting.purchaseNumber}</p>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-2xl bg-white p-5 shadow-sm">
          <User className="mt-0.5 h-8 w-8 shrink-0 text-aqua-500" aria-hidden />
          <div>
            <p className="text-sm font-medium text-slate-500">Kontakt</p>
            <p className="mt-1 text-sm text-aqua-900">
              <a href={`mailto:${shooting.email}`} className="inline-flex items-center gap-1 underline">
                <Mail className="h-3.5 w-3.5" aria-hidden />
                {shooting.email}
              </a>
            </p>
            <p className="mt-1 text-sm text-aqua-900">
              <a
                href={`tel:${shooting.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1 underline"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden />
                {shooting.phone}
              </a>
            </p>
          </div>
        </div>
      </div>

      <IndividualShootingGalleryPanel
        individualShootingId={shooting.id}
        participant={shooting.participant}
        galleryEventId={shooting.galleryEventId}
        orders={orders}
      />

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-aqua-900">Details</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Wunschtermin (Gutschein)
            </dt>
            <dd className="mt-1 text-sm text-slate-800">
              {shooting.preferredDate
                ? new Date(shooting.preferredDate).toLocaleDateString("de-DE")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</dt>
            <dd className="mt-1 text-sm text-slate-800">{shooting.status}</dd>
          </div>
          {shooting.message && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Nachricht
              </dt>
              <dd className="mt-1 text-sm text-slate-800">{shooting.message}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          {shooting.purchaseNumber && (
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/gutschein/erfolg?purchase=${encodeURIComponent(shooting.purchaseNumber)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Kundenansicht öffnen
              </Link>
            </Button>
          )}
          {shooting.galleryEventId && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/shootings/${shooting.galleryEventId}`}>
                Technisches Event öffnen
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/gutscheine">Zur Gutschein-Verwaltung</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

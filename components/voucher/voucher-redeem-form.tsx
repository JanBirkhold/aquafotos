"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { KeyRound, Loader2 } from "lucide-react";
import {
  verifyVoucherRedeemAccess,
  type VoucherRedeemAccessState,
} from "@/lib/actions/voucher-redeem-access";
import { redeemVoucher, type RedeemVoucherState } from "@/lib/actions/redeem-voucher";
import { VoucherRedeemFlowStatusCard } from "@/components/voucher/voucher-redeem-flow-timeline";
import { VoucherRedeemStatusView } from "@/components/voucher/voucher-redeem-status-view";
import type { VoucherRedeemLookupView } from "@/lib/voucher-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  initialCode?: string;
  initialEmail?: string;
};

export function VoucherRedeemForm({ initialCode = "", initialEmail = "" }: Props) {
  const [accessState, accessAction, accessPending] = useActionState<
    VoucherRedeemAccessState,
    FormData
  >(verifyVoucherRedeemAccess, null);

  const [redeemState, redeemAction, redeemPending] = useActionState<
    RedeemVoucherState,
    FormData
  >(redeemVoucher, null);

  const verifiedVoucher =
    redeemState?.voucher ?? accessState?.voucher ?? null;

  if (redeemState?.success && verifiedVoucher) {
    return (
      <VoucherRedeemStatusView
        voucher={verifiedVoucher}
        headline="Terminanfrage eingegangen"
        message={redeemState.message}
      />
    );
  }

  if (verifiedVoucher && !verifiedVoucher.redeemable) {
    return <VoucherRedeemStatusView voucher={verifiedVoucher} />;
  }

  if (!verifiedVoucher) {
    return (
      <VoucherRedeemAccessGate
        initialCode={initialCode}
        initialEmail={initialEmail}
        action={accessAction}
        error={accessState?.error ?? redeemState?.error}
        pending={accessPending}
      />
    );
  }

  return (
    <VoucherRedeemNewForm
      voucher={verifiedVoucher}
      redeemAction={redeemAction}
      redeemError={redeemState?.error}
      redeemPending={redeemPending}
    />
  );
}

function VoucherRedeemAccessGate({
  initialCode,
  initialEmail,
  action,
  error,
  pending,
}: {
  initialCode: string;
  initialEmail: string;
  action: (formData: FormData) => void;
  error?: string;
  pending: boolean;
}) {
  return (
    <div className="mx-auto max-w-lg">
      <form
        action={action}
        className="space-y-4 rounded-2xl border border-aqua-100 bg-white p-6 shadow-sm"
      >
        <div className="text-center">
          <KeyRound className="mx-auto h-10 w-10 text-aqua-600" aria-hidden />
          <h2 className="mt-3 font-display text-xl font-semibold text-aqua-900">
            Gutschein abrufen
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Code und E-Mail eingeben – Sie sehen Terminstatus, Kalender-Download und Galerie-Zugang.
          </p>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="access-code">Gutschein-Code *</Label>
          <Input
            id="access-code"
            name="code"
            required
            defaultValue={initialCode}
            placeholder="GS-XXXXXX"
            className="font-mono uppercase"
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="access-email">E-Mail *</Label>
          <Input
            id="access-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="E-Mail aus der Einlösung"
            defaultValue={initialEmail}
          />
          <p className="text-xs text-slate-500">
            Bei eingelösten Gutscheinen muss die E-Mail zur Terminanfrage passen.
          </p>
        </div>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Wird geprüft…
            </>
          ) : (
            "Status anzeigen"
          )}
        </Button>
      </form>
    </div>
  );
}

function VoucherRedeemNewForm({
  voucher,
  redeemAction,
  redeemError,
  redeemPending,
}: {
  voucher: VoucherRedeemLookupView;
  redeemAction: (formData: FormData) => void;
  redeemError?: string;
  redeemPending: boolean;
}) {
  const minDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500">
          Angemeldet als <span className="font-medium text-aqua-900">{voucher.verifiedEmail}</span>
        </p>
        <Link
          href="/gutschein/einloesen"
          className="text-sm text-aqua-700 underline underline-offset-2"
        >
          Anderen Gutschein abrufen
        </Link>
      </div>

      <VoucherRedeemFlowStatusCard voucher={voucher} preferredDate={voucher.preferredDate} />

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        {voucher.lookupHint && (
          <p className="lg:col-span-2 rounded-xl border border-aqua-200 bg-aqua-50/80 px-4 py-3 text-sm text-aqua-900">
            {voucher.lookupHint}
          </p>
        )}

        <form
          action={redeemAction}
          className="space-y-4 rounded-2xl border border-aqua-100 bg-white p-6 shadow-sm"
        >
          {redeemError && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {redeemError}
            </p>
          )}

          <input type="hidden" name="code" value={voucher.code} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="parentName">Name Erziehungsberechtigte/r *</Label>
              <Input id="parentName" name="parentName" required autoComplete="name" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="childName">Name Kind / Paar *</Label>
              <Input id="childName" name="childName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue={voucher.verifiedEmail}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon *</Label>
              <Input id="phone" name="phone" type="tel" required autoComplete="tel" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="preferredDate">Wunschtermin *</Label>
              <Input
                id="preferredDate"
                name="preferredDate"
                type="date"
                required
                min={minDate}
              />
              <p className="text-xs text-slate-500">
                Wir prüfen Ihren Wunschtermin und melden uns zur Bestätigung.
              </p>
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm text-slate-600">
            <input type="checkbox" name="gdprConsent" required className="mt-1" />
            <span>Ich willige in die Verarbeitung meiner Daten zur Terminvereinbarung ein. *</span>
          </label>

          <Button type="submit" disabled={redeemPending} className="w-full sm:w-auto">
            {redeemPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Wird eingelöst…
              </>
            ) : (
              "Terminanfrage absenden"
            )}
          </Button>
        </form>

        <VoucherRedeemInfoAside voucher={voucher} />
      </div>
    </div>
  );
}

function VoucherRedeemInfoAside({ voucher }: { voucher: VoucherRedeemLookupView }) {
  return (
    <aside className="h-fit rounded-2xl border border-green-200 bg-green-50/50 p-5">
      <h2 className="font-display text-lg font-semibold text-aqua-900">Gutschein-Info</h2>
      <div className="mt-3 space-y-2 text-sm text-slate-700">
        <p>
          <span className="font-medium">{voucher.title}</span>
          {voucher.shootingTypeLabel ? ` · ${voucher.shootingTypeLabel}` : ""}
        </p>
        {voucher.recipientName && <p>Für: {voucher.recipientName}</p>}
        {voucher.qrDataUrl && (
          <Image
            src={voucher.qrDataUrl}
            alt={`QR-Code Gutschein ${voucher.code}`}
            width={160}
            height={160}
            className="mt-2 rounded-lg border border-slate-200 bg-white"
            unoptimized
          />
        )}
        <p className="font-mono text-xs text-slate-500">{voucher.code}</p>
      </div>
    </aside>
  );
}

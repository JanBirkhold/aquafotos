"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Gift, Loader2 } from "lucide-react";
import { redeemVoucher, type RedeemVoucherState } from "@/lib/actions/voucher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type VoucherLookupView = {
  code: string;
  status: string;
  title: string;
  shootingTypeLabel: string | null;
  preferredDate: string | null;
  recipientName: string | null;
  expiresAt: string | null;
  qrDataUrl: string | null;
  redeemable: boolean;
};

type Props = {
  initialCode?: string;
  voucher: VoucherLookupView | null;
};

export function VoucherRedeemForm({ initialCode = "", voucher }: Props) {
  const [state, formAction, pending] = useActionState<RedeemVoucherState, FormData>(
    redeemVoucher,
    null,
  );

  if (state?.success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50/70 p-6 text-center">
        <Gift className="mx-auto h-10 w-10 text-green-700" aria-hidden />
        <h2 className="mt-4 font-display text-xl font-semibold text-green-900">
          Gutschein eingelöst
        </h2>
        <p className="mt-2 text-sm text-green-800">{state.message}</p>
        <Button asChild className="mt-6">
          <Link href="/shootings">Termine ansehen</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <form action={formAction} className="space-y-4 rounded-2xl border border-aqua-100 bg-white p-6 shadow-sm">
        {state?.error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {state.error}
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="code">Gutschein-Code *</Label>
          <Input
            id="code"
            name="code"
            required
            defaultValue={initialCode}
            placeholder="GS-XXXXXX"
            className="font-mono uppercase"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="parentName">Name Erziehungsberechtigte/r *</Label>
            <Input id="parentName" name="parentName" required autoComplete="name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="childName">Name Kind / Paar *</Label>
            <Input id="childName" name="childName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail *</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon *</Label>
            <Input id="phone" name="phone" type="tel" required autoComplete="tel" />
          </div>
        </div>

        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input type="checkbox" name="gdprConsent" required className="mt-1" />
          <span>Ich willige in die Verarbeitung meiner Daten zur Terminvereinbarung ein. *</span>
        </label>

        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Wird eingelöst…
            </>
          ) : (
            "Gutschein einlösen & anmelden"
          )}
        </Button>
      </form>

      <aside
        className={cn(
          "h-fit rounded-2xl border p-5",
          voucher?.redeemable
            ? "border-green-200 bg-green-50/50"
            : "border-slate-100 bg-slate-50/50",
        )}
      >
        <h2 className="font-display text-lg font-semibold text-aqua-900">Gutschein-Info</h2>
        {!voucher ? (
          <p className="mt-2 text-sm text-slate-600">
            Geben Sie Ihren Code ein – oder scannen Sie den QR-Code aus der Gutschein-E-Mail.
          </p>
        ) : (
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-medium">{voucher.title}</span>
              {voucher.shootingTypeLabel ? ` · ${voucher.shootingTypeLabel}` : ""}
            </p>
            {voucher.preferredDate && (
              <p>
                Wunschtermin:{" "}
                {new Date(voucher.preferredDate).toLocaleDateString("de-DE")}
              </p>
            )}
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
            {!voucher.redeemable && (
              <p className="text-amber-800">Status: {voucher.status}</p>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

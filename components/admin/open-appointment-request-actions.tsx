"use client";

import { useTransition } from "react";
import { XCircle } from "lucide-react";
import { cancelOpenAppointmentRequest } from "@/lib/actions/appointment-scheduling";
import { VoucherRedemptionConfirm } from "@/components/admin/voucher-redemption-confirm";
import { showActionResultToast } from "@/lib/admin-action-toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import type { OpenAppointmentRequest } from "@/lib/appointment-scheduling-types";
import type { VoucherAssignableEvent } from "@/lib/events";

type Props = {
  row: OpenAppointmentRequest;
  assignableEvents: VoucherAssignableEvent[];
  defaultLocation: string;
};

export function OpenAppointmentRequestActions({
  row,
  assignableEvents,
  defaultLocation,
}: Props) {
  const { confirm, confirmDialog } = useConfirm();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const realRequestId = row.id.startsWith("voucher-") ? undefined : row.id;
  const shootingLabel = row.productTitle ?? "Shooting";
  const canCancelOpen = Boolean(realRequestId);

  async function handleCancelOpen() {
    if (!realRequestId) return;

    const ok = await confirm({
      title: "Anfrage absagen?",
      description: `Die Terminanfrage von ${row.parentName} wird geschlossen und erscheint nicht mehr in der Liste.`,
      confirmLabel: "Anfrage absagen",
      variant: "destructive",
    });
    if (!ok) return;

    startTransition(async () => {
      const result = await cancelOpenAppointmentRequest({ requestId: realRequestId });
      showActionResultToast(toast, result);
    });
  }

  return (
    <>
      {confirmDialog}
      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
        <VoucherRedemptionConfirm
          requestId={row.voucherId ? undefined : realRequestId}
          voucherId={row.voucherId ?? undefined}
          code={row.voucherCode ?? undefined}
          parentName={row.parentName}
          productTitle={row.productTitle ?? shootingLabel}
          shootingType={row.shootingType}
          defaultDate={row.preferredDate ?? ""}
          defaultLocation={defaultLocation}
          defaultEmail={row.email}
          defaultChildName={row.childName ?? undefined}
          needsContact={row.needsContact}
          assignableEvents={assignableEvents}
        />
        {canCancelOpen && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50 hover:text-red-800"
            onClick={handleCancelOpen}
          >
            <XCircle className="h-4 w-4" aria-hidden />
            Anfrage absagen
          </Button>
        )}
      </div>
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  deleteArchivedAppointmentRequest,
  previewArchivedAppointmentDelete,
} from "@/lib/actions/appointment-scheduling";
import {
  formatArchivedDeleteCenterNotice,
  formatSimpleDeleteCenterNotice,
} from "@/lib/admin-delete-notice";
import { CenterNoticeDialog } from "@/components/ui/center-notice-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  requestId: string;
  parentName: string;
  size?: "sm" | "default";
  redirectTo?: string;
  className?: string;
};

export function AppointmentDeleteButton({
  requestId,
  parentName,
  size = "sm",
  redirectTo,
  className,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<{ title: string; description: string } | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleClick() {
    startTransition(async () => {
      const preview = await previewArchivedAppointmentDelete({ requestId });
      if (preview.error) {
        setNotice({
          title: "Löschen nicht möglich",
          description: preview.error,
        });
        setOpen(true);
        return;
      }

      if (preview.orderNumbers && preview.orderNumbers.length > 0) {
        setNotice(formatArchivedDeleteCenterNotice(preview.orderNumbers));
      } else {
        setNotice(formatSimpleDeleteCenterNotice(parentName));
      }
      setOpen(true);
    });
  }

  function runDelete() {
    startTransition(async () => {
      const result = await deleteArchivedAppointmentRequest({ requestId });
      if (result.error) {
        setNotice({
          title: "Löschen fehlgeschlagen",
          description: result.error,
        });
        return;
      }

      setOpen(false);
      setNotice(null);

      if (result.message) {
        setSuccessNotice(result.message);
      }

      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    });
  }

  const hasOrders = notice?.title === "Aktive Bestellungen vorhanden";

  return (
    <>
      <CenterNoticeDialog
        open={open}
        onOpenChange={setOpen}
        title={notice?.title ?? ""}
        description={notice?.description ?? ""}
        cancelLabel="Abbrechen"
        confirmLabel={hasOrders ? "Termin trotzdem löschen" : "Endgültig löschen"}
        onConfirm={notice?.title === "Löschen fehlgeschlagen" ? undefined : runDelete}
        pending={pending}
        variant={hasOrders ? "warning" : "info"}
      />

      <CenterNoticeDialog
        open={!!successNotice}
        onOpenChange={(next) => !next && setSuccessNotice(null)}
        title="Termin gelöscht"
        description={successNotice ?? ""}
        confirmLabel="OK"
        variant="info"
      />

      <Button
        type="button"
        size={size}
        variant="outline"
        disabled={pending}
        className={cn(
          "border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50 hover:text-red-800",
          className,
        )}
        onClick={handleClick}
      >
        <Trash2 className="h-4 w-4" aria-hidden />
        Löschen
      </Button>
    </>
  );
}

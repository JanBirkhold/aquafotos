"use client";

import { useTransition } from "react";
import { Archive } from "lucide-react";
import { archiveConfirmedAppointment } from "@/lib/actions/appointment-scheduling";
import { showActionResultToast } from "@/lib/admin-action-toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

type Props = {
  requestId: string;
  parentName: string;
  size?: "sm" | "default";
};

export function AppointmentArchiveButton({
  requestId,
  parentName,
  size = "sm",
}: Props) {
  const toast = useToast();
  const { confirm, confirmDialog } = useConfirm();
  const [pending, startTransition] = useTransition();

  async function handleArchive() {
    const ok = await confirm({
      title: "Shooting archivieren?",
      description: `${parentName} – Galerie und Fotos bleiben erhalten. Der Eintrag erscheint unter „Archiv“.`,
      confirmLabel: "Archivieren",
    });
    if (!ok) return;

    startTransition(async () => {
      const result = await archiveConfirmedAppointment({ requestId });
      showActionResultToast(toast, result);
    });
  }

  return (
    <>
      {confirmDialog}
      <Button
        type="button"
        size={size}
        variant="outline"
        disabled={pending}
        onClick={handleArchive}
      >
        <Archive className="h-4 w-4" aria-hidden />
        Archivieren
      </Button>
    </>
  );
}

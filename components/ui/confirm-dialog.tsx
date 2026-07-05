"use client";

import { useCallback, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConfirmOptions = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
};

type ConfirmState = ConfirmOptions & {
  resolve: (value: boolean) => void;
};

type ConfirmDialogUIProps = {
  state: ConfirmState;
  onDismiss: (result: boolean) => void;
};

function ConfirmDialogUI({ state, onDismiss }: ConfirmDialogUIProps) {
  const confirmLabel =
    state.confirmLabel ?? (state.variant === "destructive" ? "Löschen" : "Bestätigen");
  const cancelLabel = state.cancelLabel ?? "Abbrechen";
  const isDestructive = state.variant === "destructive";

  return (
    <Dialog open onOpenChange={(open) => !open && onDismiss(false)}>
      <DialogContent
        hideClose
        className="max-w-md gap-0 border-slate-200 bg-white p-0 text-slate-900 sm:rounded-2xl"
        onEscapeKeyDown={() => onDismiss(false)}
      >
        <div className="p-6">
          <h2 id="confirm-dialog-title" className="font-display text-lg font-semibold text-aqua-900">
            {state.title}
          </h2>
          <p id="confirm-dialog-description" className="mt-2 text-sm text-slate-600">
            {state.description}
          </p>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 p-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onDismiss(false)}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "outline" : "default"}
            className={cn(
              isDestructive &&
                "border-red-200 bg-red-600 text-white hover:border-red-300 hover:bg-red-700 hover:text-white focus-visible:ring-red-500",
            )}
            onClick={() => onDismiss(true)}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const dismiss = useCallback((result: boolean) => {
    setState((current) => {
      current?.resolve(result);
      return null;
    });
  }, []);

  const confirmDialog = state ? (
    <ConfirmDialogUI state={state} onDismiss={dismiss} />
  ) : null;

  return { confirm, confirmDialog };
}

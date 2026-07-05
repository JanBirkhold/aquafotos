"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  pending?: boolean;
  icon?: LucideIcon;
  variant?: "warning" | "info";
};

export function CenterNoticeDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Verstanden",
  cancelLabel = "Abbrechen",
  onConfirm,
  pending = false,
  icon: Icon = AlertTriangle,
  variant = "warning",
}: Props) {
  const showCancel = Boolean(onConfirm);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose={!showCancel}
        className="max-w-lg gap-0 border-slate-200 bg-white p-0 text-slate-900 sm:rounded-2xl"
      >
        <div className="p-6 text-center">
          <div
            className={cn(
              "mx-auto flex h-14 w-14 items-center justify-center rounded-full",
              variant === "warning" ? "bg-amber-100" : "bg-aqua-100",
            )}
          >
            <Icon
              className={cn(
                "h-7 w-7",
                variant === "warning" ? "text-amber-700" : "text-aqua-700",
              )}
              aria-hidden
            />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold text-aqua-900">{title}</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {description}
          </p>
        </div>
        <div
          className={cn(
            "flex flex-col-reverse gap-2 border-t border-slate-100 p-4",
            showCancel ? "sm:flex-row sm:justify-center" : "",
          )}
        >
          {showCancel && (
            <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
              {cancelLabel}
            </Button>
          )}
          <Button
            type="button"
            disabled={pending}
            className={cn(
              showCancel &&
                variant === "warning" &&
                "border-red-200 bg-red-600 text-white hover:bg-red-700 hover:text-white",
            )}
            variant={showCancel && variant === "warning" ? "default" : "default"}
            onClick={() => {
              if (onConfirm) {
                onConfirm();
                return;
              }
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

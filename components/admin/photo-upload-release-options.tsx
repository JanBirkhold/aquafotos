"use client";

import { Mail } from "lucide-react";
import type { PhotoUploadReleaseMode } from "@/lib/photo-release";
import { photoUploadReleaseLabels } from "@/lib/photo-release";
import { cn } from "@/lib/utils";

type Props = {
  value: PhotoUploadReleaseMode;
  onChange: (mode: PhotoUploadReleaseMode) => void;
  notifyCustomer: boolean;
  onNotifyChange: (notify: boolean) => void;
  className?: string;
};

const MODES = Object.keys(photoUploadReleaseLabels) as PhotoUploadReleaseMode[];

function ReleaseModeButton({
  mode,
  active,
  onSelect,
}: {
  mode: PhotoUploadReleaseMode;
  active: boolean;
  onSelect: () => void;
}) {
  const option = photoUploadReleaseLabels[mode];

  return (
    <div className="group/mode relative">
      <button
        type="button"
        aria-pressed={active}
        aria-label={`${option.title}. ${option.description}`}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          active
            ? "bg-aqua-600 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-50 hover:text-aqua-900",
        )}
        onClick={onSelect}
      >
        {option.shortTitle}
      </button>
      <div
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+0.5rem)] left-1/2 z-20 hidden w-56 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs leading-snug text-slate-600 shadow-lg group-hover/mode:block group-focus-within/mode:block"
      >
        <p className="font-medium text-slate-800">{option.title}</p>
        <p className="mt-1">{option.description}</p>
      </div>
    </div>
  );
}

export function PhotoUploadReleaseOptions({
  value,
  onChange,
  notifyCustomer,
  onNotifyChange,
  className,
}: Props) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-xs font-medium text-slate-500">Nach Upload</span>

        <div
          className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5"
          role="group"
          aria-label="Freigabe nach Upload"
        >
          {MODES.map((mode) => (
            <ReleaseModeButton
              key={mode}
              mode={mode}
              active={value === mode}
              onSelect={() => onChange(mode)}
            />
          ))}
        </div>

        {value === "select_edit" && (
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-slate-300 text-aqua-600"
              checked={notifyCustomer}
              onChange={(event) => onNotifyChange(event.target.checked)}
            />
            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            <span title="Kunde per E-Mail zur Bildauswahl einladen, sobald die Galerie bereit ist">
              E-Mail Einladung
            </span>
          </label>
        )}
      </div>
    </div>
  );
}

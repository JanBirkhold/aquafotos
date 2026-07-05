import { Check, Circle, Loader2, Mail, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type StepState = "done" | "active" | "pending";

type Props = {
  childName: string;
  email?: string;
  accessCode?: string;
  variant?: "default" | "compact";
  className?: string;
};

const STEPS = [
  { label: "Shooting abgeschlossen" },
  { label: "Bildbearbeitung läuft" },
  { label: "E-Mail bei Galerie-Freigabe" },
  { label: "Bilder auswählen & bestellen" },
] as const;

function StepIcon({ state, stepNumber }: { state: StepState; stepNumber: number }) {
  if (state === "done") {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
        <Check className="h-4 w-4" aria-hidden />
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-aqua-600 text-white">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      </span>
    );
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
      <Circle className="h-3 w-3" aria-hidden />
      <span className="sr-only">Schritt {stepNumber}</span>
    </span>
  );
}

function stepState(index: number): StepState {
  if (index === 0) return "done";
  if (index === 1) return "active";
  return "pending";
}

export function GalleryProcessingEmptyState({
  childName,
  email,
  accessCode,
  variant = "default",
  className,
}: Props) {
  const compact = variant === "compact";

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-aqua-100 bg-gradient-to-b from-aqua-50/80 to-white shadow-sm",
        compact ? "p-5" : "mx-auto mt-12 max-w-2xl p-8 sm:p-10",
        className,
      )}
      aria-labelledby="gallery-processing-title"
    >
      <div className={cn("text-center", !compact && "sm:px-4")}>
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
          <span
            className="absolute inset-0 rounded-full bg-aqua-200/40 blur-md"
            aria-hidden
          />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-aqua-100 text-aqua-700">
            <Sparkles className="h-8 w-8" aria-hidden />
          </span>
        </div>
        <h2
          id="gallery-processing-title"
          className={cn(
            "font-display font-bold text-aqua-900",
            compact ? "mt-4 text-lg" : "mt-5 text-2xl sm:text-3xl",
          )}
        >
          Ihre Galerie entsteht
        </h2>
        <p className={cn("text-slate-600", compact ? "mt-2 text-sm" : "mt-3 text-base")}>
          Wir bearbeiten gerade die Aufnahmen von{" "}
          <span className="font-medium text-aqua-900">{childName}</span>. Sobald alles fertig ist,
          können Sie hier Ihre Lieblingsbilder auswählen.
        </p>
      </div>

      <ol
        className={cn("space-y-3", compact ? "mt-5" : "mt-8")}
        aria-label="Galerie-Fortschritt"
      >
        {STEPS.map((step, index) => {
          const state = stepState(index);
          return (
            <li
              key={step.label}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3",
                state === "done" && "border-green-100 bg-green-50/60",
                state === "active" && "border-aqua-200 bg-aqua-50/70",
                state === "pending" && "border-slate-100 bg-slate-50/50",
              )}
            >
              <StepIcon state={state} stepNumber={index + 1} />
              <p
                className={cn(
                  "text-sm font-medium",
                  state === "done" && "text-green-900",
                  state === "active" && "text-aqua-900",
                  state === "pending" && "text-slate-500",
                )}
              >
                {step.label}
              </p>
            </li>
          );
        })}
      </ol>

      <div
        className={cn(
          "flex gap-3 rounded-xl border border-aqua-100 bg-white/80 p-4",
          compact ? "mt-5" : "mt-6",
        )}
      >
        <Mail className="mt-0.5 h-5 w-5 shrink-0 text-aqua-600" aria-hidden />
        <div className="min-w-0 text-sm text-slate-600">
          <p className="font-medium text-aqua-900">Sie werden per E-Mail informiert</p>
          <p className="mt-1">
            {email ? (
              <>
                Sobald die Galerie freigegeben ist, erhalten Sie eine Nachricht an{" "}
                <span className="font-medium text-slate-800">{email}</span>.
              </>
            ) : (
              <>Sobald die Galerie freigegeben ist, erhalten Sie eine E-Mail von uns.</>
            )}
          </p>
          {accessCode && (
            <p className="mt-2 text-xs text-slate-500">
              Ihr Zugangscode bleibt gültig:{" "}
              <span className="font-mono font-medium text-aqua-800">{accessCode}</span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

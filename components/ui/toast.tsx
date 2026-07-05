"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, CheckCircle2, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "warning";

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastItem = ToastInput & {
  id: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  push: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<
  ToastVariant,
  { container: string; icon: typeof CheckCircle2; iconClass: string }
> = {
  success: {
    container: "border-green-200 bg-green-50 text-green-950",
    icon: CheckCircle2,
    iconClass: "text-green-700",
  },
  error: {
    container: "border-red-200 bg-red-50 text-red-950",
    icon: XCircle,
    iconClass: "text-red-700",
  },
  warning: {
    container: "border-amber-200 bg-amber-50 text-amber-950",
    icon: AlertTriangle,
    iconClass: "text-amber-700",
  },
};

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col gap-2 sm:inset-x-auto sm:right-6 sm:max-w-sm"
      aria-live="polite"
      aria-relevant="additions text"
    >
      {toasts.map((toast) => {
        const styles = VARIANT_STYLES[toast.variant];
        const Icon = styles.icon;

        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "pointer-events-auto flex gap-3 rounded-2xl border p-4 shadow-lg shadow-slate-900/10",
              styles.container,
            )}
          >
            <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", styles.iconClass)} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description && (
                <p className="mt-1 text-sm leading-relaxed opacity-90">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              className="shrink-0 rounded-lg p-1 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua-500"
              aria-label="Hinweis schließen"
              onClick={() => onDismiss(toast.id)}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (input: ToastInput) => {
      const id = crypto.randomUUID();
      const toast: ToastItem = {
        id,
        title: input.title,
        description: input.description,
        variant: input.variant ?? "success",
        durationMs: input.durationMs,
      };

      setToasts((current) => [...current, toast]);

      const duration = input.durationMs ?? (toast.variant === "error" ? 8000 : 5000);
      const timer = window.setTimeout(() => dismiss(id), duration);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(
    () => () => {
      for (const timer of timersRef.current.values()) {
        window.clearTimeout(timer);
      }
      timersRef.current.clear();
    },
    [],
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return useMemo(
    () => ({
      toast: context.push,
      success: (title: string, description?: string) =>
        context.push({ title, description, variant: "success" }),
      error: (title: string, description?: string) =>
        context.push({ title, description, variant: "error" }),
      warning: (title: string, description?: string) =>
        context.push({ title, description, variant: "warning" }),
    }),
    [context],
  );
}

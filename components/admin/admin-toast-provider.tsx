"use client";

import { ToastProvider } from "@/components/ui/toast";

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

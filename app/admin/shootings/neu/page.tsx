import Link from "next/link";
import { CreateEventForm } from "@/components/admin/create-event-form";

export default function NewShootingPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/shootings" className="text-sm text-aqua-600 hover:underline">
          ← Shootings
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold text-aqua-900">
          Neues Shooting / Event
        </h1>
        <p className="text-slate-500">
          Event als Entwurf anlegen – danach veröffentlichen und QR-Codes generieren.
        </p>
      </div>
      <CreateEventForm />
    </div>
  );
}

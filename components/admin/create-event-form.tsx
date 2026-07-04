"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CategoryShootingSelect } from "@/components/admin/category-shooting-select";
import { createEvent } from "@/lib/actions/admin";

export function CreateEventForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-sm"
      action={(fd) =>
        startTransition(async () => {
          const event = await createEvent({
            title: fd.get("title") as string,
            description: (fd.get("description") as string) || undefined,
            category: fd.get("category") as import("@prisma/client").ShootingCategory,
            shootingType: fd.get("shootingType") as import("@prisma/client").ShootingType,
            date: fd.get("date") as string,
            startTime: (fd.get("startTime") as string) || undefined,
            endTime: (fd.get("endTime") as string) || undefined,
            location: fd.get("location") as string,
            maxParticipants: Number(fd.get("maxParticipants")),
          });
          router.push(`/admin/shootings/${event.id}`);
        })
      }
    >
      <div className="space-y-2">
        <Label htmlFor="title">Titel</Label>
        <Input id="title" name="title" required placeholder="z.B. Unterwasser-Shooting Vitasol" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CategoryShootingSelect />
        <div className="space-y-2">
          <Label htmlFor="date">Datum</Label>
          <Input id="date" name="date" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxParticipants">Max. Teilnehmer</Label>
          <Input id="maxParticipants" name="maxParticipants" type="number" min={1} defaultValue={12} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Start (optional)</Label>
          <Input id="startTime" name="startTime" type="time" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">Ende (optional)</Label>
          <Input id="endTime" name="endTime" type="time" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Ort</Label>
        <Input id="location" name="location" required placeholder="Vitasol Bad Salzuflen" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Beschreibung (optional)</Label>
        <Textarea id="description" name="description" rows={3} />
      </div>
      <p className="text-xs text-slate-500">
        Die Event-Kategorie steuert die Anzeige auf „Termine finden“ und die Filterung nach Unterwasser, Kita, Baby usw.
      </p>
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Event anlegen (Entwurf)
      </Button>
    </form>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPartner, deletePartner, updatePartner } from "@/lib/actions/partner";
import { partnerLogoRequirements, partnerTypeLabels } from "@/lib/partners";
import type { PartnerType } from "@prisma/client";

type PartnerRow = {
  id: string;
  name: string;
  type: PartnerType;
  description: string | null;
  logoUrl: string | null;
  city: string | null;
  websiteUrl: string | null;
  featured: boolean;
  active: boolean;
  sortOrder: number;
};

export function PartnerAdminPanel({ partners }: { partners: PartnerRow[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const editing = useMemo(
    () => partners.find((p) => p.id === editingId) ?? null,
    [partners, editingId],
  );

  return (
    <div className="space-y-8">
      {message && (
        <p className="rounded-xl bg-aqua-50 px-4 py-3 text-sm text-aqua-800" role="status">
          {message}
        </p>
      )}

      <div className="rounded-2xl border border-aqua-100 bg-aqua-50/40 p-5">
        <h2 className="font-semibold text-aqua-900">{partnerLogoRequirements.title}</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
          {partnerLogoRequirements.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Partner verwalten</h2>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setEditingId(null);
            setShowForm(!showForm);
          }}
        >
          {showForm && !editingId ? "Formular schließen" : "+ Partner hinzufügen"}
        </Button>
      </div>

      {(showForm || editingId) && (
        <PartnerForm
          key={editing?.id ?? "new"}
          partner={editing}
          pending={pending}
          onCancel={() => {
            setShowForm(false);
            setEditingId(null);
          }}
          onSubmit={(fd) =>
            startTransition(async () => {
              if (editing) {
                await updatePartner(editing.id, fd);
                setMessage("Partner aktualisiert.");
              } else {
                await createPartner(fd);
                setMessage("Partner angelegt.");
              }
              setShowForm(false);
              setEditingId(null);
            })
          }
        />
      )}

      {partners.length === 0 ? (
        <p className="text-sm text-slate-500">Noch keine Partner angelegt.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {partners.map((p) => (
            <li key={p.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                {p.logoUrl ? (
                  <div className="relative h-16 w-28 shrink-0 rounded-lg border bg-white p-2">
                    <Image
                      src={p.logoUrl}
                      alt={`Logo ${p.name}`}
                      fill
                      className="object-contain p-1"
                      unoptimized={p.logoUrl.endsWith(".svg")}
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-28 shrink-0 items-center justify-center rounded-lg border border-dashed bg-slate-50 text-xs text-slate-400">
                    Kein Logo
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-aqua-900">{p.name}</p>
                  <p className="text-xs text-aqua-600">{partnerTypeLabels[p.type]}</p>
                  {p.city && <p className="text-sm text-slate-500">{p.city}</p>}
                  {p.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{p.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${p.featured ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}
                    >
                      {p.featured ? "Website sichtbar" : "Nur intern"}
                    </span>
                    {!p.active && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                        Inaktiv
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingId(p.id);
                    setShowForm(true);
                  }}
                >
                  Bearbeiten
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-700"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm(`${p.name} deaktivieren?`)) return;
                    startTransition(async () => {
                      await deletePartner(p.id);
                      setMessage("Partner deaktiviert.");
                    });
                  }}
                >
                  <Trash2 className="h-3 w-3" aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PartnerForm({
  partner,
  pending,
  onCancel,
  onSubmit,
}: {
  partner: PartnerRow | null;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (fd: FormData) => void;
}) {
  return (
    <form
      className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
      action={onSubmit}
    >
      <h3 className="font-semibold">{partner ? "Partner bearbeiten" : "Neuer Partner"}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={partner?.name ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Partnertyp</Label>
          <select
            id="type"
            name="type"
            defaultValue={partner?.type ?? "SWIMMING_POOL"}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
          >
            {Object.entries(partnerTypeLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Stadt</Label>
          <Input id="city" name="city" defaultValue={partner?.city ?? ""} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Beschreibung (Website)</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={partner?.description ?? ""}
            placeholder="Kurztext für die Partner-Seite…"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="websiteUrl">Website (optional)</Label>
          <Input
            id="websiteUrl"
            name="websiteUrl"
            type="url"
            defaultValue={partner?.websiteUrl ?? ""}
            placeholder="https://…"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="logo">Logo {partner?.logoUrl ? "(neu hochladen zum Ersetzen)" : ""}</Label>
          <Input
            id="logo"
            name="logo"
            type="file"
            accept=".png,.svg,.webp,image/png,image/svg+xml,image/webp"
          />
          <p className="text-xs text-slate-500">PNG/SVG/WebP, max. 500 KB, siehe Anforderungen oben</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Reihenfolge</Label>
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            defaultValue={partner?.sortOrder ?? 0}
          />
        </div>
        <div className="flex flex-col justify-end gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="featured" defaultChecked={partner?.featured ?? true} />
            Auf Website anzeigen
          </label>
          {partner && (
            <label className="flex items-center gap-2">
              <input type="checkbox" name="active" defaultChecked={partner.active} />
              Aktiv
            </label>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {partner ? "Speichern" : "Partner anlegen"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
      </div>
    </form>
  );
}

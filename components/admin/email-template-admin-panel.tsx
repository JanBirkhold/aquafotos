"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { NotificationFlowSidebar } from "@/components/admin/notification-flow-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  resetEmailTemplate,
  updateEmailTemplate,
} from "@/lib/actions/email-templates";
import { renderEmailTemplate } from "@/lib/email-template-definitions";
import {
  NOTIFICATION_CATEGORIES,
  templatesByCategory,
} from "@/lib/notification-guide";

export type EmailTemplateRow = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  subject: string;
  bodyHtml: string;
  placeholders: string | null;
};

const PREVIEW_VARS: Record<string, string> = {
  parentName: "Max Mustermann",
  childName: "Emma",
  eventTitle: "Kita-Unterwasser-Shooting",
  date: "Samstag, 12. April 2026",
  timeLine: "<br><strong>Uhrzeit:</strong> 10:00",
  location: "Vitasol Bad Salzuflen",
  accessCodeBlock: `<p><strong>Ihr Zugang zur Bildergalerie</strong></p>
<p><strong>Zugangscode:</strong><br><code style="font-size:1.1em">AF-DEMO-001</code></p>
<p><a href="/bilder-bestellen?code=AF-DEMO-001">Bilder bestellen</a> – E-Mail + Code eingeben</p>`,
  qrCodeBlock:
    '<p><strong>Ihr QR-Code (#001)</strong></p><p style="font-size:0.9em">Am Shooting vorzeigen – Fotos werden als 001_… zugeordnet.</p>',
  greeting: "Wir freuen uns auf Emma!",
  notesBlock: "<p>Bitte 10 Minuten früher da sein.</p>",
  reasonBlock: "<p><strong>Grund:</strong> Technische Wartung</p>",
  galleryLinkBlock: '<p><a href="/bilder-bestellen?code=AF-DEMO-001">Zur Galerie</a></p>',
  galleryAccessGuideBlock: `<ol><li>Galerie öffnen</li><li>E-Mail + Zugangscode</li><li>Bestellen</li></ol>`,
  shootingType: "Kita-Unterwasser",
  locationLine: " in Bad Salzuflen",
  eventUrl: "https://aquafotos.com/shootings/demo",
  orderNumber: "AF-DEMO123",
  total: "75,00 €",
};

type Props = {
  templates: EmailTemplateRow[];
};

export function EmailTemplateAdminPanel({ templates }: Props) {
  const router = useRouter();
  const grouped = useMemo(() => templatesByCategory(templates), [templates]);
  const [activeKey, setActiveKey] = useState(templates[0]?.key ?? "");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const active = templates.find((t) => t.key === activeKey) ?? templates[0];
  const [subject, setSubject] = useState(active?.subject ?? "");
  const [bodyHtml, setBodyHtml] = useState(active?.bodyHtml ?? "");

  function selectTemplate(key: string) {
    const next = templates.find((t) => t.key === key);
    if (!next) return;
    setActiveKey(key);
    setSubject(next.subject);
    setBodyHtml(next.bodyHtml);
    setMessage(null);
  }

  if (!active) {
    return <p className="text-sm text-slate-500">Keine Vorlagen vorhanden.</p>;
  }

  const previewSubject = renderEmailTemplate(subject, PREVIEW_VARS);
  const previewHtml = renderEmailTemplate(bodyHtml, PREVIEW_VARS);
  const placeholderList = active.placeholders?.split(",").map((p) => p.trim()) ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)_280px]">
      <nav className="space-y-4 rounded-2xl bg-white p-3 shadow-sm xl:max-h-[calc(100vh-12rem)] xl:overflow-y-auto">
        {NOTIFICATION_CATEGORIES.map((category) => {
          const items = grouped.get(category.id) ?? [];
          if (items.length === 0) return null;
          return (
            <div key={category.id}>
              <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {category.label}
              </p>
              <ul className="space-y-0.5">
                {items.map((t) => (
                  <li key={t.key}>
                    <button
                      type="button"
                      onClick={() => selectTemplate(t.key)}
                      className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                        t.key === activeKey
                          ? "bg-aqua-50 font-medium text-aqua-900"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="font-display text-xl font-semibold text-aqua-900">{active.label}</h2>
          {active.description && (
            <p className="mt-1 text-sm text-slate-500">{active.description}</p>
          )}
        </div>

        {message && (
          <p className="mb-4 rounded-lg bg-aqua-50 px-3 py-2 text-sm text-aqua-800" role="status">
            {message}
          </p>
        )}

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(async () => {
              const res = await updateEmailTemplate({
                key: active.key,
                subject,
                bodyHtml,
              });
              setMessage(res.error ?? "Vorlage gespeichert.");
            });
          }}
        >
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Platzhalter:{" "}
            {placeholderList.map((p) => (
              <code key={p} className="mr-1 rounded bg-white px-1">{`{{${p}}}`}</code>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tpl-subject">Betreff</Label>
            <Input
              id="tpl-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tpl-body">E-Mail-Text (HTML)</Label>
            <Textarea
              id="tpl-body"
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              rows={12}
              className="font-mono text-xs"
              disabled={pending}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Speichern
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const res = await resetEmailTemplate(active.key);
                  if (res.error) {
                    setMessage(res.error);
                    return;
                  }
                  if (res.template) {
                    setSubject(res.template.subject);
                    setBodyHtml(res.template.bodyHtml);
                  }
                  setMessage("Standardtext wiederhergestellt.");
                  router.refresh();
                })
              }
            >
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
              Standard wiederherstellen
            </Button>
          </div>
        </form>

        <div className="mt-8 rounded-xl border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Vorschau</p>
          <p className="mt-2 text-sm font-semibold">{previewSubject}</p>
          <div
            className="prose prose-sm mt-3 max-w-none"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      </div>

      <NotificationFlowSidebar templateKey={activeKey} />
    </div>
  );
}

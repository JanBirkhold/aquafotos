"use client";

import { useState, useTransition } from "react";
import { Mail, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationComposeDialog } from "@/components/admin/notification-compose-dialog";
import {
  confirmParticipantManual,
  resendParticipantConfirmation,
} from "@/lib/actions/admin";
import { getParticipantConfirmationVariables } from "@/lib/actions/email-templates";
import {
  getWorkflowStats,
  normalizeParticipantStatus,
  participantSourceLabels,
  participantStatusColors,
  participantStatusLabels,
} from "@/lib/participant-workflow";
import type { ParticipantSource, ParticipantStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

export type ParticipantRow = {
  id: string;
  participantNumber: number;
  parentName: string;
  childName: string;
  email: string;
  status: ParticipantStatus;
  registrationSource: ParticipantSource;
  confirmationSentAt: string | null;
  confirmedAt: string | null;
  galleryViewedAt: string | null;
  orderedAt: string | null;
};

type Props = {
  eventId: string;
  participants: ParticipantRow[];
};

type ComposeState = {
  participantId: string;
  templateKey: string;
  variables: Record<string, string>;
  recipientLabel: string;
};

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ParticipantWorkflowTable({ eventId, participants }: Props) {
  const [pending, startTransition] = useTransition();
  const [compose, setCompose] = useState<ComposeState | null>(null);
  const [composeLoading, setComposeLoading] = useState(false);
  const stats = getWorkflowStats(participants);

  async function openResendCompose(participantId: string) {
    setComposeLoading(true);
    try {
      const ctx = await getParticipantConfirmationVariables(participantId);
      setCompose({
        participantId,
        templateKey: ctx.templateKey,
        variables: ctx.variables,
        recipientLabel: ctx.recipientLabel,
      });
    } finally {
      setComposeLoading(false);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold">Teilnehmer-Workflow</h2>
          <p className="text-sm text-slate-500">
            Eingeladen → Akzeptiert → Fotos gesichtet → Bestellt
          </p>
        </div>
        <dl className="flex flex-wrap gap-3 text-center text-xs">
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">Gesamt</dt>
            <dd className="text-lg font-bold text-slate-800">{stats.total}</dd>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <dt className="text-slate-500">Eingeladen</dt>
            <dd className="text-lg font-bold text-slate-800">{stats.invited}</dd>
          </div>
          <div className="rounded-xl bg-green-50 px-3 py-2">
            <dt className="text-green-700">Akzeptiert</dt>
            <dd className="text-lg font-bold text-green-800">{stats.accepted}</dd>
          </div>
          <div className="rounded-xl bg-aqua-50 px-3 py-2">
            <dt className="text-aqua-700">Gesichtet</dt>
            <dd className="text-lg font-bold text-aqua-800">{stats.viewed}</dd>
          </div>
          <div className="rounded-xl bg-violet-50 px-3 py-2">
            <dt className="text-violet-700">Bestellt</dt>
            <dd className="text-lg font-bold text-violet-800">{stats.ordered}</dd>
          </div>
        </dl>
      </div>

      {participants.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">Noch keine Teilnehmer.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b text-slate-500">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Name</th>
                <th className="p-3">Quelle</th>
                <th className="p-3">Status</th>
                <th className="p-3">E-Mail gesendet</th>
                <th className="p-3">Galerie</th>
                <th className="p-3">Bestellung</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => {
                const displayStatus = normalizeParticipantStatus(p.status);
                return (
                  <tr key={p.id} className="border-b border-slate-50">
                    <td className="p-3 font-mono text-xs text-aqua-600">
                      {String(p.participantNumber).padStart(3, "0")}
                    </td>
                    <td className="p-3">
                      <p className="font-medium">{p.childName}</p>
                      <p className="text-xs text-slate-500">{p.parentName}</p>
                      <p className="text-xs text-slate-400">{p.email}</p>
                    </td>
                    <td className="p-3 text-xs">
                      {participantSourceLabels[p.registrationSource]}
                    </td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          participantStatusColors[p.status],
                        )}
                      >
                        {participantStatusLabels[displayStatus]}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-500">
                      {formatWhen(p.confirmationSentAt)}
                    </td>
                    <td className="p-3 text-xs text-slate-500">
                      {formatWhen(p.galleryViewedAt)}
                    </td>
                    <td className="p-3 text-xs text-slate-500">
                      {formatWhen(p.orderedAt)}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={pending || composeLoading}
                          title="Bestätigung erneut senden"
                          onClick={() => openResendCompose(p.id)}
                        >
                          <Mail className="h-3.5 w-3.5" aria-hidden />
                        </Button>
                        {p.status === "INVITED" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={pending}
                            title="Als akzeptiert markieren"
                            onClick={() =>
                              startTransition(async () => {
                                await confirmParticipantManual(p.id, eventId);
                              })
                            }
                          >
                            <UserCheck className="h-3.5 w-3.5" aria-hidden />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {compose && (
        <NotificationComposeDialog
          open={!!compose}
          onOpenChange={(open) => {
            if (!open) setCompose(null);
          }}
          templateKey={compose.templateKey}
          variables={compose.variables}
          title="Bestätigung senden"
          description="Einladung bzw. Anmeldungsbestätigung vor dem Versand prüfen."
          recipientLabel={compose.recipientLabel}
          onConfirm={(draft) =>
            new Promise<void>((resolve) => {
              startTransition(async () => {
                await resendParticipantConfirmation(compose.participantId, eventId, draft);
                resolve();
              });
            })
          }
        />
      )}
    </section>
  );
}

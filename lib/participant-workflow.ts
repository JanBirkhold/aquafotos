import type { ParticipantSource, ParticipantStatus } from "@prisma/client";

export const participantStatusLabels: Record<ParticipantStatus, string> = {
  INVITED: "Eingeladen",
  CONFIRMED: "Akzeptiert",
  REGISTERED: "Angemeldet",
  GALLERY_VIEWED: "Fotos gesichtet",
  ORDERED: "Bestellt",
  REMINDER_SENT: "Erinnert",
  ATTENDED: "Anwesend",
  CANCELLED: "Abgesagt",
};

export const participantSourceLabels: Record<ParticipantSource, string> = {
  MANUAL: "Manuell",
  WEBSITE: "Website",
  QR_CODE: "QR-Code",
};

export const participantStatusColors: Record<ParticipantStatus, string> = {
  INVITED: "bg-slate-100 text-slate-700",
  CONFIRMED: "bg-green-100 text-green-800",
  REGISTERED: "bg-green-100 text-green-800",
  GALLERY_VIEWED: "bg-aqua-100 text-aqua-800",
  ORDERED: "bg-violet-100 text-violet-800",
  REMINDER_SENT: "bg-amber-100 text-amber-800",
  ATTENDED: "bg-teal-100 text-teal-800",
  CANCELLED: "bg-red-100 text-red-700",
};

/** Status pipeline – higher index = further in workflow */
const STATUS_RANK: ParticipantStatus[] = [
  "INVITED",
  "REGISTERED",
  "CONFIRMED",
  "REMINDER_SENT",
  "ATTENDED",
  "GALLERY_VIEWED",
  "ORDERED",
];

export function normalizeParticipantStatus(status: ParticipantStatus): ParticipantStatus {
  return status === "REGISTERED" ? "CONFIRMED" : status;
}

export function canAdvanceStatus(
  current: ParticipantStatus,
  target: ParticipantStatus,
): boolean {
  if (current === "CANCELLED" || target === "CANCELLED") return target === "CANCELLED";
  const cur = normalizeParticipantStatus(current);
  const tgt = normalizeParticipantStatus(target);
  const curIdx = STATUS_RANK.indexOf(cur);
  const tgtIdx = STATUS_RANK.indexOf(tgt);
  if (curIdx === -1 || tgtIdx === -1) return false;
  return tgtIdx >= curIdx;
}

export function getWorkflowStats(participants: { status: ParticipantStatus }[]) {
  let invited = 0;
  let accepted = 0;
  let viewed = 0;
  let ordered = 0;

  for (const p of participants) {
    const s = normalizeParticipantStatus(p.status);
    if (s === "INVITED") invited++;
    if (["CONFIRMED", "REMINDER_SENT", "ATTENDED", "GALLERY_VIEWED", "ORDERED"].includes(s))
      accepted++;
    if (["GALLERY_VIEWED", "ORDERED"].includes(s)) viewed++;
    if (s === "ORDERED") ordered++;
  }

  return { invited, accepted, viewed, ordered, total: participants.length };
}

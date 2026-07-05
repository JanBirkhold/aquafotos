import type { AdminShootingPipelineInput } from "@/lib/admin-shooting-pipeline-status";
import type { VoucherStatus } from "@prisma/client";

type VoucherWithPipeline = {
  status: VoucherStatus;
  preferredDate: Date | null;
  individualShootingReq: {
    preferredDate: Date | null;
    confirmedDate: Date | null;
    participant: AdminShootingPipelineInput["participant"];
  } | null;
};

export function voucherToPipelineInput(voucher: VoucherWithPipeline): AdminShootingPipelineInput {
  const req = voucher.individualShootingReq;
  return {
    voucherStatus: voucher.status,
    hasRedemption: !!req,
    confirmedDate: req?.confirmedDate,
    preferredDate: req?.preferredDate ?? voucher.preferredDate,
    participant: req?.participant ?? null,
  };
}

export function einzelShootingToPipelineInput(row: {
  confirmedDate: string;
  preferredDate: string | null;
  pipelineParticipant: AdminShootingPipelineInput["participant"];
}): AdminShootingPipelineInput {
  return {
    voucherStatus: "REDEEMED",
    hasRedemption: true,
    confirmedDate: row.confirmedDate,
    preferredDate: row.preferredDate,
    participant: row.pipelineParticipant,
  };
}

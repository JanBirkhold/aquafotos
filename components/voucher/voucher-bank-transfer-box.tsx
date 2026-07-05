import { BankTransferBox } from "@/components/shared/bank-transfer-box";
import type { BankTransferDetails } from "@/lib/voucher-payment";

type Props = {
  bank: BankTransferDetails;
  purchaseNumber: string;
  totalCents: number;
  buyerName: string;
};

export function VoucherBankTransferBox({
  bank,
  purchaseNumber,
  totalCents,
  buyerName,
}: Props) {
  return (
    <BankTransferBox
      bank={bank}
      reference={purchaseNumber}
      totalCents={totalCents}
      payerName={buyerName}
      description="Bitte überweisen Sie den Betrag innerhalb von 7 Tagen. Geben Sie als Verwendungszweck exakt Ihre Kaufnummer an. Nach Zahlungseingang erhalten Sie Code und QR-Code per E-Mail – die Freigabe erfolgt manuell durch unser Team."
      referenceLabel="Verwendungszweck"
      referenceCopyLabel="Kaufnummer kopieren"
    />
  );
}

export type BankTransferDetails = {
  accountHolder: string;
  iban: string;
  bic: string;
  bankName: string;
};

export function getBankTransferDetails(): BankTransferDetails {
  return {
    accountHolder: process.env.BANK_ACCOUNT_HOLDER ?? "Kasimir Eckhardt",
    iban: process.env.BANK_IBAN ?? "",
    bic: process.env.BANK_BIC ?? "",
    bankName: process.env.BANK_NAME ?? "",
  };
}

export function formatIbanDisplay(iban: string): string {
  return iban.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
}

export function buildPaymentReference(purchaseNumber: string): string {
  return purchaseNumber;
}

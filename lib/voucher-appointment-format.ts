type ConfirmedAppointment = {
  confirmedDate: Date;
  confirmedTime: string | null;
  confirmedLocation: string | null;
};

export function formatConfirmedAppointmentLabel(req: ConfirmedAppointment): string {
  return [
    req.confirmedDate.toLocaleDateString("de-DE"),
    req.confirmedTime,
    req.confirmedLocation,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function toDateInputValue(date: Date | null | undefined): string {
  const value = date ?? new Date();
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

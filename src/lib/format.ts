/** Formatage localisé (français, XOF par défaut). */

export function formatMoney(amount: number, currency = "XOF"): string {
  // Intl insère des espaces fines insecables (U+202F) que certaines polices
  // rendent invisibles : on les remplace par une espace normale.
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/[\u202F\u00A0]/g, " ");
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "Non défini";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "Non défini";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export function formatShortDate(value: Date | string | null | undefined): string {
  if (!value) return "Non défini";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "Non défini";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function daysUntil(value: Date | string | null | undefined): number | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  const diff = date.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

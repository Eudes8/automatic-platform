/**
 * Reçu de paiement PDF (pdf-lib, serveur uniquement).
 * Une page A4 simple : identité, montants, moyen de paiement, mention.
 */

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatDate, formatMoney } from "@/lib/format";

export interface ReceiptInput {
  invoiceId: string;
  paymentId: string;
  amount: number;
  currency: string;
  provider: string;
  method: string;
  paidAt: Date;
  invoiceAmount: number;
  amountPaid: number;
  clientName?: string;
}

/** pdf-lib encode en WinAnsi : on neutralise les caractères non supportés. */
function safe(value: string): string {
  return (value ?? "")
    .replace(/[\u00A0\u202F\u2007\u2009\u200A]/g, " ")
    .replace(/[\u2013\u2014\u2212]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');
}

const PROVIDER_LABEL: Record<string, string> = {
  MONEROO: "Moneroo",
  FEDAPAY: "FedaPay",
  MANUAL: "Encaissement manuel",
};

export async function generateReceiptPDF(input: ReceiptInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const regular = await doc.embedFont(StandardFonts.Helvetica);

  const ink = rgb(0.06, 0.07, 0.08);
  const muted = rgb(0.42, 0.45, 0.5);
  const line = rgb(0.86, 0.86, 0.83);
  const accent = rgb(0.12, 0.23, 0.88);

  const margin = 56;
  let y = height - margin;

  // En-tête
  page.drawText("AUTOMATIC", { x: margin, y, size: 16, font: bold, color: ink });
  page.drawText("Recu de paiement", { x: margin, y: y - 28, size: 24, font: bold, color: ink });
  page.drawText(`REC-${input.paymentId.slice(-8).toUpperCase()}`, {
    x: margin,
    y: y - 48,
    size: 10,
    font: regular,
    color: muted,
  });

  y -= 78;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: line });

  // Bloc montant
  y -= 52;
  page.drawText(safe(formatMoney(input.amount, input.currency)), {
    x: margin,
    y,
    size: 30,
    font: bold,
    color: accent,
  });
  page.drawText("Montant recu", { x: margin, y: y - 16, size: 9, font: regular, color: muted });

  // Détails
  const rows: [string, string][] = [
    ["Date du paiement", formatDate(input.paidAt)],
    ["Facture", `#${input.invoiceId.slice(-6).toUpperCase()}`],
    ["Montant de la facture", formatMoney(input.invoiceAmount, input.currency)],
    ["Total encaisse", formatMoney(input.amountPaid, input.currency)],
    ["Reste a payer", formatMoney(Math.max(0, input.invoiceAmount - input.amountPaid), input.currency)],
    ["Moyen de paiement", input.method],
    ["Fournisseur", PROVIDER_LABEL[input.provider] ?? input.provider],
  ];

  y -= 52;
  for (const [label, value] of rows) {
    page.drawText(safe(label), { x: margin, y, size: 10, font: regular, color: muted });
    page.drawText(safe(value), { x: margin + 190, y, size: 11, font: bold, color: ink });
    y -= 24;
  }

  // Pied de page
  const footerY = margin + 24;
  page.drawLine({
    start: { x: margin, y: footerY + 16 },
    end: { x: width - margin, y: footerY + 16 },
    thickness: 1,
    color: line,
  });
  page.drawText(
    safe("Document genere automatiquement. Conservez ce recu comme preuve de paiement."),
    { x: margin, y: footerY, size: 9, font: regular, color: muted }
  );
  page.drawText(safe("AUTOMATIC - Developpement d'applications web et mobiles"), {
    x: margin,
    y: footerY - 14,
    size: 9,
    font: regular,
    color: muted,
  });

  return await doc.save();
}

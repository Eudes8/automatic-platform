/**
 * Service de paiement (serveur uniquement).
 *
 * Responsabilités :
 *  - appliquer un statut fournisseur (Moneroo, FedaPay) à un paiement local ;
 *  - recalculer le cumul encaissé d'une facture ;
 *  - marquer la facture payée seulement quand le cumul couvre le montant ;
 *  - produire un reçu PDF à chaque encaissement réussi ;
 *  - notifier le client et l'équipe.
 *
 * Toutes les écritures sont idempotentes : un webhook rejoué ne double pas
 * un encaissement.
 */

import prisma from "@/lib/prisma";
import type { Invoice, Payment } from "@prisma/client";
import { generateReceiptPDF } from "@/lib/receipt";
import { uploadFileToStorage } from "@/lib/storage";
import { formatMoney } from "@/lib/format";

export type LocalPaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

/** Statuts fournisseurs vers statuts locaux. */
export function mapProviderStatus(status: string | undefined | null): LocalPaymentStatus {
  switch ((status ?? "").toLowerCase()) {
    case "success":
    case "succeeded":
    case "completed":
    case "approved":
    case "paid":
      return "SUCCESS";
    case "failed":
    case "declined":
    case "error":
      return "FAILED";
    case "cancelled":
    case "canceled":
      return "CANCELLED";
    default:
      return "PENDING";
  }
}

export interface ApplyResult {
  paymentStatus: LocalPaymentStatus;
  invoiceStatus: string;
  amountPaid: number;
  changed: boolean;
}

/** Recalcule le cumul encaissé d'une facture à partir des paiements réussis. */
async function recomputeInvoice(invoice: Invoice): Promise<{ invoice: Invoice; settled: boolean }> {
  const paid = await prisma.payment.aggregate({
    where: { invoiceId: invoice.id, status: "SUCCESS" },
    _sum: { amount: true },
  });

  const amountPaid = Math.round(paid._sum.amount ?? 0);
  const settled = amountPaid >= Math.round(invoice.amount);

  const updated = await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      amountPaid,
      status: settled ? "PAID" : invoice.status === "PAID" ? "SENT" : invoice.status,
    },
  });

  return { invoice: updated, settled };
}

/**
 * Applique un statut fournisseur à un paiement local.
 * @param providerStatus statut brut renvoyé par Moneroo / FedaPay
 */
export async function applyPaymentStatus(
  payment: Payment,
  providerStatus: string | undefined,
  method?: string,
  failureReason?: string
): Promise<ApplyResult> {
  const target = mapProviderStatus(providerStatus);

  const invoice = await prisma.invoice.findUnique({ where: { id: payment.invoiceId } });
  if (!invoice) {
    return { paymentStatus: payment.status, invoiceStatus: "UNKNOWN", amountPaid: 0, changed: false };
  }

  // Déjà dans cet état : aucun effet (idempotence).
  if (payment.status === target) {
    return {
      paymentStatus: payment.status,
      invoiceStatus: invoice.status,
      amountPaid: Math.round(invoice.amountPaid),
      changed: false,
    };
  }

  // Un paiement réussi ne repart jamais en arrière.
  if (payment.status === "SUCCESS") {
    return {
      paymentStatus: "SUCCESS",
      invoiceStatus: invoice.status,
      amountPaid: Math.round(invoice.amountPaid),
      changed: false,
    };
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: target,
      method: method ?? payment.method,
      failureReason: target === "FAILED" ? failureReason ?? "Paiement refusé par le fournisseur" : null,
      paidAt: target === "SUCCESS" ? new Date() : null,
    },
  });

  let updatedInvoice = invoice;
  let settled = false;

  if (target === "SUCCESS") {
    const result = await recomputeInvoice(invoice);
    updatedInvoice = result.invoice;
    settled = result.settled;

    const receiptUrl = await createReceipt(payment, updatedInvoice, method);
    if (receiptUrl) {
      await prisma.invoice.update({ where: { id: invoice.id }, data: { receiptUrl } });
      await prisma.payment.update({ where: { id: payment.id }, data: { method: method ?? payment.method } });
    }

    await notifyPaymentSettled(updatedInvoice, payment, settled);
  }

  return {
    paymentStatus: target,
    invoiceStatus: updatedInvoice.status,
    amountPaid: Math.round(updatedInvoice.amountPaid),
    changed: true,
  };
}

/** Génère et archive le reçu PDF du paiement. Ne bloque jamais l'encaissement. */
async function createReceipt(
  payment: Payment,
  invoice: Invoice,
  method?: string
): Promise<string | null> {
  try {
    const pdf = await generateReceiptPDF({
      invoiceId: invoice.id,
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      provider: payment.provider,
      method: method ?? payment.method ?? "Mobile Money",
      paidAt: new Date(),
      invoiceAmount: invoice.amount,
      amountPaid: invoice.amountPaid,
      clientName: invoice.description ? undefined : undefined,
    });

    const path = `receipts/${invoice.id}/${payment.id}.pdf`;
    return await uploadFileToStorage("project-assets", path, Buffer.from(pdf), "application/pdf");
  } catch (error) {
    console.error("[payments] Génération du reçu impossible :", error);
    return null;
  }
}

async function notifyPaymentSettled(invoice: Invoice, payment: Payment, settled: boolean): Promise<void> {
  try {
    const amountLabel = formatMoney(payment.amount, payment.currency);
    const remaining = Math.max(0, Math.round(invoice.amount - invoice.amountPaid));

    await prisma.notification.create({
      data: {
        userId: invoice.clientId,
        title: settled ? "Facture réglée" : "Paiement reçu",
        message: settled
          ? `Votre paiement de ${amountLabel} a été confirmé. La facture est intégralement réglée.`
          : `Paiement de ${amountLabel} confirmé. Reste à régler : ${formatMoney(remaining)}.`,
        type: "PAYMENT",
        link: "/dashboard/invoices",
      },
    });

    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          title: settled ? "Facture soldée" : "Encaissement partiel",
          message: `${formatMoney(payment.amount, payment.currency)} reçus sur la facture #${invoice.id
            .slice(-6)
            .toUpperCase()}${settled ? "" : ` (reste ${formatMoney(remaining)})`}.`,
          type: "PAYMENT",
          link: "/admin/invoices",
        })),
      });
    }
  } catch (error) {
    console.error("[payments] Notification de paiement impossible :", error);
  }
}

/**
 * Encaisse manuellement (virement, espèces) : utilisé par l'administration.
 * Crée un paiement SUCCESS sans passer par un fournisseur.
 */
export async function recordManualPayment(input: {
  invoiceId: string;
  amount: number;
  method: string;
  note?: string;
}): Promise<ApplyResult> {
  const invoice = await prisma.invoice.findUnique({ where: { id: input.invoiceId } });
  if (!invoice) throw new Error("Facture introuvable.");
  if (invoice.status === "CANCELLED") throw new Error("Facture annulée.");

  const amount = Math.round(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Montant invalide.");

  const payment = await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      provider: "MANUAL",
      providerRef: `manual_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      amount,
      currency: "XOF",
      status: "SUCCESS",
      method: input.method,
      paidAt: new Date(),
    },
  });

  const result = await recomputeInvoice(invoice);
  const receiptUrl = await createReceipt(payment, result.invoice, input.method);
  if (receiptUrl) {
    await prisma.invoice.update({ where: { id: invoice.id }, data: { receiptUrl } });
  }
  await notifyPaymentSettled(result.invoice, payment, result.settled);

  return {
    paymentStatus: "SUCCESS",
    invoiceStatus: result.invoice.status,
    amountPaid: Math.round(result.invoice.amountPaid),
    changed: true,
  };
}

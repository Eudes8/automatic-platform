/**
 * Logique métier des paiements Moneroo (serveur uniquement).
 *
 * Factorise la synchronisation : statut Moneroo → Payment (DB) → Invoice →
 * Notifications. Utilisée à la fois par le webhook (source d'information
 * principale) et par la route de vérification appelée au retour du client
 * (filet de sécurité si le webhook est perdu, cf. best practices Moneroo).
 */

import prisma from "@/lib/prisma";
import type { Payment } from "@prisma/client";

/** Statuts de transaction renvoyés par Moneroo. */
export type MonerooTxStatus = "success" | "failed" | "cancelled" | "initiated" | "pending" | string;

/** Statut local correspondant à un statut Moneroo. */
export function mapMonerooStatus(status: MonerooTxStatus | undefined): "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" {
  switch ((status ?? "").toLowerCase()) {
    case "success":
    case "succeeded":
    case "completed":
      return "SUCCESS";
    case "failed":
    case "error":
      return "FAILED";
    case "cancelled":
    case "canceled":
      return "CANCELLED";
    default:
      return "PENDING";
  }
}

interface SyncResult {
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
  invoiceStatus?: string;
  changed: boolean;
}

/**
 * Synchronise un paiement local avec le statut Moneroo observé.
 * Idempotent : aucun effet si le paiement est déjà dans le même état.
 *
 * @param payment                Paiement local à synchroniser
 * @param monerooStatus          Statut renvoyé par Moneroo (webhook ou API verify)
 * @param method                 Moyen de paiement (optionnel, remonté par l'API)
 * @param failureReason          Raison d'échec éventuelle
 */
export async function syncPaymentStatus(
  payment: Payment,
  monerooStatus: MonerooTxStatus | undefined,
  method?: string,
  failureReason?: string
): Promise<SyncResult> {
  const targetStatus = mapMonerooStatus(monerooStatus);

  // Aucun changement : on sort immédiatement (idempotence des webhooks).
  if (payment.status === targetStatus) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: payment.invoiceId },
      select: { status: true },
    });
    return { paymentStatus: payment.status, invoiceStatus: invoice?.status, changed: false };
  }

  // Un paiement ne repart jamais en arrière depuis SUCCESS (garde-fou anti-rejeu).
  if (payment.status === "SUCCESS") {
    return { paymentStatus: "SUCCESS", invoiceStatus: "PAID", changed: false };
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: targetStatus,
      method: method ?? payment.method,
      failureReason:
        targetStatus === "FAILED" ? failureReason ?? "Paiement refusé par Moneroo" : null,
      paidAt: targetStatus === "SUCCESS" ? new Date() : null,
    },
  });

  let invoiceStatus: string | undefined;

  if (targetStatus === "SUCCESS") {
    // Passe la facture en PAID si elle n'est pas déjà réglée.
    const invoice = await prisma.invoice.updateMany({
      where: { id: payment.invoiceId, status: { notIn: ["PAID", "CANCELLED"] } },
      data: { status: "PAID" },
    });
    if (invoice.count > 0) {
      invoiceStatus = "PAID";
      await notifyPaymentSuccess(payment);
    } else {
      const existing = await prisma.invoice.findUnique({
        where: { id: payment.invoiceId },
        select: { status: true },
      });
      invoiceStatus = existing?.status;
    }
  } else if (targetStatus === "CANCELLED" || targetStatus === "FAILED") {
    // La facture reste "SENT"/"OVERDUE" : le client peut retenter un paiement.
    invoiceStatus = undefined;
  }

  return { paymentStatus: targetStatus, invoiceStatus, changed: true };
}

/** Crée les notifications (client + administrateurs) après un paiement réussi. */
async function notifyPaymentSuccess(payment: Payment): Promise<void> {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: payment.invoiceId },
      include: { project: { select: { title: true } } },
    });
    if (!invoice) return;

    const amountLabel = `${new Intl.NumberFormat("fr-FR").format(payment.amount)} ${payment.currency}`;
    const title = "Paiement confirmé";
    const message = `Votre paiement de ${amountLabel} pour la facture #${invoice.id.slice(-6).toUpperCase()} a été confirmé. Merci !`;

    // Notification client propriétaire de la facture.
    await prisma.notification.create({
      data: {
        userId: invoice.clientId,
        title,
        message,
        type: "PAYMENT",
        link: "/dashboard/invoices",
      },
    });

    // Notification de l'équipe (admins) pour suivi encaissement.
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          title: "Encaissement Moneroo",
          message: `Facture #${invoice.id.slice(-6).toUpperCase()} payée (${amountLabel})${
            invoice.project?.title ? ` — projet « ${invoice.project.title} »` : ""
          }.`,
          type: "PAYMENT",
          link: "/admin/invoices",
        })),
      });
    }
  } catch (error) {
    // Une erreur de notification ne doit jamais invalider un paiement réussi.
    console.error("[payments] Échec de la création des notifications de paiement :", error);
  }
}

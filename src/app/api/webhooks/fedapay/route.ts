/**
 * Webhook FedaPay — POST /api/webhooks/fedapay
 *
 * - signature `X-FEDAPAY-SIGNATURE` vérifiée sur le corps brut
 *   (format officiel : `t=<timestamp>,s=<hmac-sha256 de `${t}.${payload}`>`);
 * - la transaction est re-interrogée chez FedaPay (source de vérité) ;
 * - tout est journalisé dans WebhookLog pour diagnostiquer les livraisons.
 */

import prisma from "@/lib/prisma";
import { jsonResponse } from "@/lib/api-helpers";
import {
  extractTransactionId,
  getFedapayTransaction,
  verifyFedapaySignature,
} from "@/lib/fedapay";
import { applyPaymentStatus } from "@/lib/payments";

export const dynamic = "force-dynamic";

async function logWebhook(input: {
  event?: string;
  reference?: string;
  signatureValid: boolean;
  status: number;
  message?: string;
  payload?: string;
}) {
  try {
    await prisma.webhookLog.create({
      data: {
        provider: "FEDAPAY",
        event: input.event,
        reference: input.reference,
        signatureValid: input.signatureValid,
        status: input.status,
        message: input.message,
        payload: input.payload?.slice(0, 2000),
      },
    });
  } catch (error) {
    console.error("[fedapay/webhook] Journalisation impossible :", error);
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  const signature =
    request.headers.get("x-fedapay-signature") ?? request.headers.get("X-FEDAPAY-SIGNATURE");
  const valid = await verifyFedapaySignature(rawBody, signature);

  let payload: unknown = null;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    await logWebhook({ signatureValid: valid, status: 400, message: "JSON invalide", payload: rawBody });
    return jsonResponse({ error: "Payload JSON invalide." }, 400);
  }

  const eventName = (payload as { name?: string }).name ?? "evenement.inconnu";
  const transactionId = extractTransactionId(payload);

  if (!valid) {
    console.error("[fedapay/webhook] Signature invalide — requête rejetée.");
    await logWebhook({
      event: eventName,
      reference: transactionId ?? undefined,
      signatureValid: false,
      status: 403,
      message: "Signature invalide",
      payload: rawBody,
    });
    return jsonResponse({ error: "Signature invalide." }, 403);
  }

  if (!transactionId) {
    await logWebhook({ event: eventName, signatureValid: true, status: 200, message: "missing_id" });
    return jsonResponse({ received: true, ignored: "missing_id" });
  }

  const payment = await prisma.payment.findUnique({ where: { providerRef: transactionId } });

  if (!payment) {
    await logWebhook({
      event: eventName,
      reference: transactionId,
      signatureValid: true,
      status: 200,
      message: "unknown_payment",
    });
    return jsonResponse({ received: true, ignored: "unknown_payment" });
  }

  try {
    const transaction = await getFedapayTransaction(transactionId);

    if (
      typeof transaction.amount === "number" &&
      Math.round(transaction.amount) !== Math.round(payment.amount)
    ) {
      await logWebhook({
        event: eventName,
        reference: transactionId,
        signatureValid: true,
        status: 200,
        message: `amount_mismatch (${transaction.amount} != ${payment.amount})`,
      });
      return jsonResponse({ received: true, blocked: "amount_mismatch" });
    }

    const result = await applyPaymentStatus(payment, transaction.status, "fedapay");

    await logWebhook({
      event: eventName,
      reference: transactionId,
      signatureValid: true,
      status: 200,
      message: `${result.paymentStatus}${result.changed ? "" : " (inchangé)"}`,
    });

    return jsonResponse({
      received: true,
      event: eventName,
      status: result.paymentStatus,
      invoice: result.invoiceStatus,
    });
  } catch (error) {
    console.error("[fedapay/webhook] Échec de traitement :", error);
    await logWebhook({
      event: eventName,
      reference: transactionId,
      signatureValid: true,
      status: 500,
      message: "processing_error",
    });
    return jsonResponse({ error: "Échec de traitement du webhook." }, 500);
  }
}

export async function GET() {
  return jsonResponse({ error: "Méthode non autorisée." }, 405);
}

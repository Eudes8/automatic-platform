/**
 * Webhook FedaPay — POST /api/webhooks/fedapay
 *
 * Sécurité :
 *  - signature X-FEDAPAY-SIGNATURE vérifiée sur le corps BRUT ;
 *  - la transaction est ensuite re-interrogée chez FedaPay (source de vérité),
 *    ce qui neutralise un faux événement « approved » ;
 *  - traitement idempotent (syncPaymentStatus).
 */

import prisma from "@/lib/prisma";
import { jsonResponse } from "@/lib/api-helpers";
import {
  extractTransactionId,
  getFedapayTransaction,
  verifyFedapaySignature,
} from "@/lib/fedapay";
import { syncPaymentStatus } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = await request.text();

  const signature =
    request.headers.get("x-fedapay-signature") ?? request.headers.get("X-FEDAPAY-SIGNATURE");

  const valid = await verifyFedapaySignature(rawBody, signature);
  if (!valid) {
    console.error("[fedapay/webhook] Signature invalide — requête rejetée.");
    return jsonResponse({ error: "Signature invalide." }, 403);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: "Payload JSON invalide." }, 400);
  }

  const transactionId = extractTransactionId(payload);
  const eventName = (payload as { name?: string }).name ?? "evenement.inconnu";

  if (!transactionId) {
    return jsonResponse({ received: true, ignored: "missing_id" });
  }

  const payment = await prisma.payment.findUnique({
    where: { monerooPaymentId: transactionId },
  });

  if (!payment) {
    console.warn(`[fedapay/webhook] Paiement inconnu : ${transactionId} (${eventName})`);
    return jsonResponse({ received: true, ignored: "unknown_payment" });
  }

  try {
    // Re-interrogation : seule la réponse de l'API fait foi.
    const transaction = await getFedapayTransaction(transactionId);

    if (
      typeof transaction.amount === "number" &&
      Math.round(transaction.amount) !== Math.round(payment.amount)
    ) {
      console.error(
        `[fedapay/webhook] Montant incohérent pour ${transactionId} : ` +
          `annoncé=${transaction.amount}, attendu=${payment.amount}.`
      );
      return jsonResponse({ received: true, blocked: "amount_mismatch" });
    }

    const result = await syncPaymentStatus(
      payment,
      transaction.status,
      "fedapay"
    );

    return jsonResponse({
      received: true,
      event: eventName,
      status: result.paymentStatus,
      changed: result.changed,
    });
  } catch (error) {
    console.error("[fedapay/webhook] Échec de traitement :", error);
    return jsonResponse({ error: "Échec de traitement du webhook." }, 500);
  }
}

export async function GET() {
  return jsonResponse({ error: "Méthode non autorisée." }, 405);
}

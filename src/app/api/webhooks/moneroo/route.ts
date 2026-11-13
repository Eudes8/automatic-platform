/**
 * Webhook Moneroo — POST /api/webhooks/moneroo
 *
 * - signature HMAC-SHA256 vérifiée sur le corps brut ;
 * - la transaction est re-vérifiée auprès de l'API (source de vérité) ;
 * - traitement idempotent : un webhook rejoué ne double jamais un encaissement.
 */

import prisma from "@/lib/prisma";
import { verifyWebhookSignature, verifyPayment, type WebhookPayload } from "@/lib/moneroo";
import { applyPaymentStatus } from "@/lib/payments";
import { jsonResponse } from "@/lib/api-helpers";

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
        provider: "MONEROO",
        event: input.event,
        reference: input.reference,
        signatureValid: input.signatureValid,
        status: input.status,
        message: input.message,
        payload: input.payload?.slice(0, 2000),
      },
    });
  } catch (error) {
    console.error("[moneroo/webhook] Journalisation impossible :", error);
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  const signature =
    request.headers.get("x-moneroo-signature") ?? request.headers.get("X-Moneroo-Signature");
  const isSignatureValid = await verifyWebhookSignature(rawBody, signature);

  if (!isSignatureValid) {
    console.error("[moneroo/webhook] Signature invalide — requête rejetée.");
    await logWebhook({ signatureValid: false, status: 403, message: "Signature invalide", payload: rawBody });
    return jsonResponse({ error: "Signature invalide." }, 403);
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    await logWebhook({ signatureValid: true, status: 400, message: "JSON invalide", payload: rawBody });
    return jsonResponse({ error: "Payload JSON invalide." }, 400);
  }

  const event = payload?.event ?? "";
  const reference = payload?.data?.id ?? "";

  if (!reference) {
    await logWebhook({ event, signatureValid: true, status: 200, message: "missing_id" });
    return jsonResponse({ received: true, ignored: "missing_id" });
  }

  const payment = await prisma.payment.findUnique({ where: { providerRef: reference } });

  if (!payment) {
    await logWebhook({ event, reference, signatureValid: true, status: 200, message: "unknown_payment" });
    return jsonResponse({ received: true, ignored: "unknown_payment" });
  }

  let status = payload.data.status ?? event.replace("payment.", "");
  let method: string | undefined;
  try {
    const tx = await verifyPayment(reference);
    status = tx.status;
    method = (tx as { method?: string }).method;
  } catch (error) {
    console.warn("[moneroo/webhook] Re-vérification API impossible, payload signé utilisé :", error);
  }

  if (typeof payload.data.amount === "number" && Math.round(payload.data.amount) !== Math.round(payment.amount)) {
    await logWebhook({
      event,
      reference,
      signatureValid: true,
      status: 200,
      message: `amount_mismatch (${payload.data.amount} != ${payment.amount})`,
    });
    return jsonResponse({ received: true, blocked: "amount_mismatch" });
  }

  try {
    const result = await applyPaymentStatus(payment, status, method);
    await logWebhook({
      event,
      reference,
      signatureValid: true,
      status: 200,
      message: `${result.paymentStatus}${result.changed ? "" : " (inchangé)"}`,
    });
    return jsonResponse({ received: true, status: result.paymentStatus, invoice: result.invoiceStatus });
  } catch (error) {
    console.error("[moneroo/webhook] Échec de traitement :", error);
    await logWebhook({ event, reference, signatureValid: true, status: 500, message: "processing_error" });
    return jsonResponse({ error: "Échec de traitement du webhook." }, 500);
  }
}

export async function GET() {
  return jsonResponse({ error: "Méthode non autorisée." }, 405);
}

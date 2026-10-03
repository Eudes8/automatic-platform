/**
 * Webhook Moneroo — réception des événements de paiement.
 *
 * POST /api/webhooks/moneroo
 *
 * Sécurité :
 *  - Le corps BRUT est signé par Moneroo (HMAC-SHA256, secret du webhook) et
 *    transmis via l'en-tête "X-Moneroo-Signature". La vérification est faite
 *    sur le texte brut, AVANT tout parsing JSON.
 *  - Signature invalide → 403 Forbidden (jamais de 200 "poli").
 *
 * Conformité Moneroo :
 *  - Répondre 200 pour accuser réception (retry ×3 sinon), rapidement.
 *  - Être idempotent : les webhooks peuvent être livrés plusieurs fois.
 *  - Re-vérifier la transaction via l'API (best practice) avec repli gracieux
 *    sur le payload signé si l'API n'est pas joignable.
 */

import prisma from "@/lib/prisma";
import { verifyWebhookSignature, verifyPayment, type WebhookPayload } from "@/lib/moneroo";
import { syncPaymentStatus } from "@/lib/payments";
import { jsonResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // 1) Corps brut (indispensable pour la vérification HMAC).
  const rawBody = await request.text();

  // 2) Vérification de la signature.
  const signature =
    request.headers.get("x-moneroo-signature") ?? request.headers.get("X-Moneroo-Signature");
  const isSignatureValid = await verifyWebhookSignature(rawBody, signature);
  if (!isSignatureValid) {
    console.error("[moneroo/webhook] Signature invalide — requête rejetée.");
    return jsonResponse({ error: "Signature invalide." }, 403);
  }

  // 3) Parsing du payload.
  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return jsonResponse({ error: "Payload JSON invalide." }, 400);
  }

  const event = payload?.event ?? "";
  const monerooPaymentId = payload?.data?.id ?? "";
  if (!monerooPaymentId) {
    // Événement sans identifiant : rien à traiter, on accuse réception.
    return jsonResponse({ received: true, ignored: "missing_id" });
  }

  // 4) Recherche du paiement local correspondant.
  const payment = await prisma.payment.findUnique({
    where: { monerooPaymentId },
  });

  if (!payment) {
    // Paiement inconnu (initié hors plateforme ou webhook reçu avant la
    // création locale). On accuse réception pour éviter des retries inutiles.
    console.warn(`[moneroo/webhook] Paiement inconnu reçu : ${monerooPaymentId} (${event})`);
    return jsonResponse({ received: true, ignored: "unknown_payment" });
  }

  // 5) Re-vérification via l'API (source de vérité), avec repli sur le payload.
  let status = payload.data.status ?? event.replace("payment.", "");
  let method: string | undefined;
  let failureReason: string | undefined;
  try {
    const tx = await verifyPayment(monerooPaymentId);
    status = tx.status;
    method = (tx as { method?: string }).method;
  } catch (error) {
    console.warn(
      "[moneroo/webhook] Re-vérification API impossible, usage du payload signé :",
      error instanceof Error ? error.message : error
    );
  }

  // 6) Contrôle anti-fraude : cohérence du montant annoncé.
  if (typeof payload.data.amount === "number" && Math.round(payload.data.amount) !== Math.round(payment.amount)) {
    console.error(
      `[moneroo/webhook] Incohérence de montant pour ${monerooPaymentId} : ` +
        `annoncé=${payload.data.amount}, attendu=${payment.amount}. Synchronisation bloquée.`
    );
    await prisma.notification.createMany({
      data: {
        userId: (await prisma.invoice.findUnique({ where: { id: payment.invoiceId }, select: { clientId: true } }))?.clientId ?? "",
        title: "Anomalie de paiement détectée",
        message: `Montant incohérent pour le paiement ${monerooPaymentId}. Vérification manuelle requise.`,
        type: "WARNING",
        link: "/admin/invoices",
      },
    }).catch(() => undefined);
    return jsonResponse({ received: true, blocked: "amount_mismatch" });
  }

  // 7) Synchronisation idempotente (Payment → Invoice → Notifications).
  try {
    const result = await syncPaymentStatus(payment, status, method, failureReason);
    return jsonResponse({ received: true, status: result.paymentStatus, changed: result.changed });
  } catch (error) {
    // Erreur de traitement : on signale l'échec (Moneroo retentera jusqu'à 3 fois).
    console.error("[moneroo/webhook] Échec de synchronisation :", error);
    return jsonResponse({ error: "Échec de traitement du webhook." }, 500);
  }
}

/** Les autres méthodes ne sont pas autorisées sur ce endpoint. */
export async function GET() {
  return jsonResponse({ error: "Méthode non autorisée." }, 405);
}

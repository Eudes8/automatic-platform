/**
 * Route API — Vérification du statut d'un paiement au retour du client.
 *
 * GET /api/payments/moneroo/verify?paymentId=<id Moneroo>
 *
 * Moneroo redirige le client vers `return_url` avec `paymentId` et
 * `paymentStatus` en query. Le client appelle ensuite ce endpoint qui
 * re-vérifie le statut auprès de l'API Moneroo (source de vérité) puis
 * synchronise la base — filet de sécurité si le webhook a été perdu.
 */

import prisma from "@/lib/prisma";
import { verifyPayment, MonerooError } from "@/lib/moneroo";
import { syncPaymentStatus } from "@/lib/payments";
import { getAuthenticatedUser, jsonResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonResponse({ error: "Authentification requise." }, 401);
  }

  const { searchParams } = new URL(request.url);
  const monerooPaymentId = (searchParams.get("paymentId") ?? "").trim();
  if (!monerooPaymentId) {
    return jsonResponse({ error: "Paramètre paymentId requis." }, 400);
  }

  const payment = await prisma.payment.findUnique({
    where: { monerooPaymentId },
    include: { invoice: { select: { id: true, clientId: true, status: true } } },
  });

  if (!payment) {
    return jsonResponse({ error: "Paiement introuvable." }, 404);
  }
  if (payment.invoice.clientId !== user.id) {
    return jsonResponse({ error: "Accès refusé." }, 403);
  }

  try {
    const tx = await verifyPayment(monerooPaymentId);
    const result = await syncPaymentStatus(payment, tx.status, (tx as { method?: string }).method);

    const invoice = await prisma.invoice.findUnique({
      where: { id: payment.invoiceId },
      select: { status: true },
    });

    return jsonResponse({
      paymentStatus: result.paymentStatus,
      invoiceStatus: invoice?.status ?? result.invoiceStatus,
      changed: result.changed,
    });
  } catch (error) {
    if (error instanceof MonerooError) {
      console.error("[payments/verify] Erreur Moneroo :", error.message);
      // On renvoie le dernier état connu plutôt qu'une erreur brute.
      const invoice = await prisma.invoice.findUnique({
        where: { id: payment.invoiceId },
        select: { status: true },
      });
      return jsonResponse({
        paymentStatus: payment.status,
        invoiceStatus: invoice?.status,
        changed: false,
        warning: "Statut Moneroo momentanément indisponible.",
      });
    }
    console.error("[payments/verify] Erreur inattendue :", error);
    return jsonResponse({ error: "Erreur interne de vérification." }, 500);
  }
}

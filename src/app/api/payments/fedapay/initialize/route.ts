/**
 * POST /api/payments/fedapay/initialize
 * Body : { invoiceId: string }
 *
 * Crée une transaction FedaPay pour une facture et renvoie l'URL de paiement
 * hébergée. Les factures sont libellées en FCFA, devise native de FedaPay :
 * aucune conversion n'est nécessaire.
 */

import prisma from "@/lib/prisma";
import { getAuthenticatedUser, getAppUrl, jsonResponse } from "@/lib/api-helpers";
import { createFedapayTransaction, FedapayError, isFedapayConfigured } from "@/lib/fedapay";

export const dynamic = "force-dynamic";

const PENDING_CHECKOUT_TTL_MS = 30 * 60 * 1000;

function splitName(fullName?: string | null, fallbackEmail = "client"): { firstname: string; lastname: string } {
  const cleaned = (fullName ?? "").trim();
  if (!cleaned) {
    const local = fallbackEmail.split("@")[0] || "Client";
    return { firstname: local, lastname: "-" };
  }
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return { firstname: parts[0], lastname: "-" };
  return { firstname: parts[0], lastname: parts.slice(1).join(" ") };
}

export async function POST(request: Request) {
  if (!isFedapayConfigured()) {
    return jsonResponse({ error: "FedaPay n'est pas configuré sur cette installation." }, 503);
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonResponse({ error: "Authentification requise." }, 401);
  }

  let invoiceId: string;
  try {
    const body = (await request.json()) as { invoiceId?: string };
    invoiceId = (body.invoiceId ?? "").trim();
  } catch {
    return jsonResponse({ error: "Corps de requête invalide." }, 400);
  }
  if (!invoiceId) {
    return jsonResponse({ error: "Identifiant de facture requis." }, 400);
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { client: { select: { id: true, email: true, name: true, phone: true } }, payments: true },
  });

  if (!invoice) return jsonResponse({ error: "Facture introuvable." }, 404);
  if (invoice.clientId !== user.id) {
    return jsonResponse({ error: "Vous n'êtes pas autorisé à payer cette facture." }, 403);
  }
  if (invoice.status === "PAID") return jsonResponse({ error: "Cette facture est déjà payée." }, 409);
  if (invoice.status === "CANCELLED" || invoice.status === "DRAFT") {
    return jsonResponse({ error: "Cette facture n'est pas payable." }, 409);
  }

  // Réutilisation d'un checkout FedaPay encore valide.
  const now = Date.now();
  const reusable = invoice.payments
    .filter(
      (payment) =>
        payment.method === "FEDAPAY" &&
        payment.status === "PENDING" &&
        payment.checkoutUrl &&
        now - payment.createdAt.getTime() < PENDING_CHECKOUT_TTL_MS
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

  if (reusable) {
    return jsonResponse({
      checkoutUrl: reusable.checkoutUrl,
      paymentId: reusable.monerooPaymentId,
      provider: "fedapay",
      reused: true,
    });
  }

  const appUrl = getAppUrl(request);
  const { firstname, lastname } = splitName(user.name, user.email);

  try {
    const transaction = await createFedapayTransaction({
      amount: invoice.amount,
      description: `Facture #${invoice.id.slice(-6).toUpperCase()}${
        invoice.description ? ` - ${invoice.description}` : ""
      }`,
      callbackUrl: `${appUrl}/dashboard/invoices`,
      customer: {
        firstname,
        lastname,
        email: invoice.client.email,
      },
      metadata: { invoice_id: invoice.id, client_id: invoice.clientId },
    });

    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        monerooPaymentId: String(transaction.id),
        amount: invoice.amount,
        currency: "XOF",
        status: "PENDING",
        checkoutUrl: transaction.payment_url,
        method: "FEDAPAY",
      },
    });

    return jsonResponse({
      checkoutUrl: transaction.payment_url,
      paymentId: String(transaction.id),
      provider: "fedapay",
      reused: false,
    });
  } catch (error) {
    if (error instanceof FedapayError) {
      console.error("[payments/fedapay] Erreur :", error.message, error.apiError ?? "");
      return jsonResponse({ error: error.message }, error.statusCode);
    }
    console.error("[payments/fedapay] Erreur inattendue :", error);
    return jsonResponse({ error: "Erreur interne lors de l'initialisation du paiement." }, 500);
  }
}

/**
 * Route API — Initialisation d'un paiement Moneroo pour une facture.
 *
 * POST /api/payments/moneroo/initialize
 * Body : { invoiceId: string }
 *
 * Flux :
 *  1. Authentifie l'utilisateur (session Supabase).
 *  2. Vérifie que la facture lui appartient et est payable.
 *  3. Réutilise un checkout en attente (< 30 min) ou crée un paiement Moneroo.
 *  4. Renvoie l'URL de checkout Moneroo vers laquelle rediriger le client.
 */

import prisma from "@/lib/prisma";
import { initializePayment, MonerooError, DEFAULT_CURRENCY } from "@/lib/moneroo";
import { getAuthenticatedUser, getAppUrl, jsonResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

/** Durée de validité d'un lien de checkout en attente avant d'en recréer un. */
const PENDING_CHECKOUT_TTL_MS = 30 * 60 * 1000;

/** Découpe un nom complet en prénom / nom pour l'API Moneroo. */
function splitName(fullName?: string | null, fallbackEmail = "client"): { firstName: string; lastName: string } {
  const cleaned = (fullName ?? "").trim();
  if (!cleaned) {
    const local = fallbackEmail.split("@")[0] || "Client";
    return { firstName: local, lastName: "-" };
  }
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "-" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export async function POST(request: Request) {
  // 1) Authentification.
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonResponse({ error: "Authentification requise." }, 401);
  }

  // 2) Paramètres d'entrée.
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

  // 3) Facture : existence, propriété, payabilité.
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { client: { select: { id: true, email: true, name: true, phone: true } }, payments: true },
  });

  if (!invoice) {
    return jsonResponse({ error: "Facture introuvable." }, 404);
  }
  if (invoice.clientId !== user.id) {
    return jsonResponse({ error: "Vous n'êtes pas autorisé à payer cette facture." }, 403);
  }
  if (invoice.status === "PAID") {
    return jsonResponse({ error: "Cette facture est déjà payée." }, 409);
  }
  if (invoice.status === "CANCELLED" || invoice.status === "DRAFT") {
    return jsonResponse({ error: "Cette facture n'est pas payable." }, 409);
  }

  // 4) Réutilisation d'un checkout en attente (évite les doublons Moneroo).
  const now = Date.now();
  const reusablePending = invoice.payments
    .filter((p) => p.status === "PENDING" && p.checkoutUrl && now - p.createdAt.getTime() < PENDING_CHECKOUT_TTL_MS)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

  if (reusablePending) {
    return jsonResponse({
      checkoutUrl: reusablePending.checkoutUrl,
      paymentId: reusablePending.monerooPaymentId,
      reused: true,
    });
  }

  // 5) Initialisation du paiement chez Moneroo.
  const appUrl = getAppUrl(request);
  const { firstName, lastName } = splitName(user.name, user.email);

  try {
    const init = await initializePayment({
      amount: invoice.amount,
      currency: DEFAULT_CURRENCY,
      description: `Paiement facture #${invoice.id.slice(-6).toUpperCase()}${
        invoice.description ? ` — ${invoice.description}` : ""
      }`,
      return_url: `${appUrl}/dashboard/invoices`,
      customer: {
        email: invoice.client.email,
        first_name: firstName,
        last_name: lastName,
        ...(invoice.client.phone ? { phone: invoice.client.phone } : {}),
      },
      metadata: {
        invoice_id: invoice.id,
        client_id: invoice.clientId,
        source: "automatic-platform",
      },
    });

    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        monerooPaymentId: init.data.id,
        amount: invoice.amount,
        currency: DEFAULT_CURRENCY,
        status: "PENDING",
        checkoutUrl: init.data.checkout_url,
      },
    });

    return jsonResponse({
      checkoutUrl: init.data.checkout_url,
      paymentId: init.data.id,
      reused: false,
    });
  } catch (error) {
    if (error instanceof MonerooError) {
      console.error("[payments/initialize] Erreur Moneroo :", error.message, error.apiError ?? "");
      return jsonResponse({ error: error.message }, error.statusCode);
    }
    console.error("[payments/initialize] Erreur inattendue :", error);
    return jsonResponse({ error: "Erreur interne lors de l'initialisation du paiement." }, 500);
  }
}

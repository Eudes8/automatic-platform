/**
 * Client API Moneroo (serveur uniquement)
 *
 * Documentation : https://docs.moneroo.io
 * - Initialisation : POST /v1/payments/initialize  → { data: { id, checkout_url } }
 * - Vérification   : GET  /v1/payments/{id}/verify
 * - Webhooks       : signature HMAC-SHA256 (payload brut, secret) → header "X-Moneroo-Signature"
 *
 * ⚠️ Ne jamais importer ce module côté client : il contient la clé secrète.
 */

const MONEROO_API_BASE = "https://api.moneroo.io/v1";

/** Devise par défaut de la plateforme : Franc CFA (XOF). */
export const DEFAULT_CURRENCY = "XOF";

/** Devises supportées par Moneroo pour les marchés ciblés par la plateforme. */
export const SUPPORTED_CURRENCIES = ["XOF", "XAF", "USD", "EUR", "NGN", "GHS", "KES"] as const;
export type MonerooCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export interface MonerooCustomer {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
}

export interface InitializePaymentInput {
  /** Montant entier (Moneroo n'accepte pas de décimales). */
  amount: number;
  currency?: MonerooCurrency | string;
  description: string;
  /** URL de retour après paiement (reçoit ?paymentId=...&paymentStatus=...). */
  return_url: string;
  customer: MonerooCustomer;
  /** Métadonnées libre (valeurs string uniquement côté Moneroo). */
  metadata?: Record<string, string>;
  /** Shortcodes des moyens de paiement à proposer (optionnel). */
  methods?: string[];
}

export interface MonerooPaymentInitResponse {
  message: string;
  data: {
    id: string;
    checkout_url: string;
  };
}

export interface MonerooTransaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  metadata?: Record<string, string>;
  customer?: {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface WebhookPayload {
  event: string;
  data: {
    id: string;
    amount?: number;
    currency?: string;
    status?: string;
    customer?: Record<string, unknown>;
  };
}

/** Récupère la clé secrète Moneroo (mode test ou production). */
function getSecretKey(): string {
  const key = process.env.MONEROO_SECRET_KEY;
  if (!key) {
    throw new MonerooError(
      "MONEROO_SECRET_KEY manquante. Configurez-la dans vos variables d'environnement.",
      500
    );
  }
  return key;
}

/** Erreur HTTP normalisée pour tout échange avec l'API Moneroo. */
export class MonerooError extends Error {
  statusCode: number;
  apiError?: unknown;

  constructor(message: string, statusCode = 502, apiError?: unknown) {
    super(message);
    this.name = "MonerooError";
    this.statusCode = statusCode;
    this.apiError = apiError;
  }
}

/**
 * Initialise un paiement Moneroo et renvoie l'URL de checkout à laquelle
 * rediriger le client.
 */
export async function initializePayment(
  input: InitializePaymentInput
): Promise<MonerooPaymentInitResponse> {
  const amount = Math.round(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new MonerooError("Le montant du paiement doit être un nombre positif.", 400);
  }

  const currency = (input.currency ?? DEFAULT_CURRENCY).toUpperCase();
  if (!SUPPORTED_CURRENCIES.includes(currency as MonerooCurrency)) {
    throw new MonerooError(`Devise non supportée par Moneroo : ${currency}`, 400);
  }

  const body: Record<string, unknown> = {
    amount,
    currency,
    description: input.description,
    return_url: input.return_url,
    customer: input.customer,
  };
  if (input.metadata && Object.keys(input.metadata).length > 0) {
    body.metadata = input.metadata;
  }
  if (input.methods && input.methods.length > 0) {
    body.methods = input.methods;
  }

  let response: Response;
  try {
    response = await fetch(`${MONEROO_API_BASE}/payments/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${getSecretKey()}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (error) {
    throw new MonerooError(
      "Impossible de joindre l'API Moneroo. Vérifiez la connexion réseau.",
      502,
      error instanceof Error ? error.message : error
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const apiMessage =
      (payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message?: unknown }).message)
        : undefined) ?? "Initialisation du paiement refusée par Moneroo.";
    throw new MonerooError(apiMessage, response.status === 401 ? 500 : 502, payload);
  }

  const data = (payload as { data?: { id?: string; checkout_url?: string } })?.data;
  if (!data?.id || !data?.checkout_url) {
    throw new MonerooError(
      "Réponse inattendue de Moneroo : identifiant ou URL de checkout manquant.",
      502,
      payload
    );
  }

  return payload as MonerooPaymentInitResponse;
}

/**
 * Vérifie le statut réel d'une transaction auprès de Moneroo.
 * Source de vérité à privilégier après un retour client ou un webhook.
 */
export async function verifyPayment(monerooPaymentId: string): Promise<MonerooTransaction> {
  if (!monerooPaymentId) {
    throw new MonerooError("Identifiant de paiement Moneroo requis.", 400);
  }

  let response: Response;
  try {
    response = await fetch(
      `${MONEROO_API_BASE}/payments/${encodeURIComponent(monerooPaymentId)}/verify`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${getSecretKey()}`,
        },
        cache: "no-store",
      }
    );
  } catch (error) {
    throw new MonerooError(
      "Impossible de joindre l'API Moneroo pour la vérification.",
      502,
      error instanceof Error ? error.message : error
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new MonerooError(
      "Vérification de la transaction refusée par Moneroo.",
      response.status === 404 ? 404 : 502,
      payload
    );
  }

  const data = (payload as { data?: MonerooTransaction })?.data;
  if (!data?.id) {
    throw new MonerooError("Réponse de vérification Moneroo inattendue.", 502, payload);
  }
  return data;
}

/**
 * Vérifie la signature HMAC-SHA256 d'un webhook Moneroo.
 *
 * La signature est calculée sur le corps BRUT de la requête (raw body) avec le
 * secret du webhook, puis comparée à l'en-tête "X-Moneroo-Signature".
 *
 * @param rawBody  Corps brut de la requête (string, avant tout parsing JSON)
 * @param signature Valeur de l'en-tête X-Moneroo-Signature
 * @returns true si la signature est valide
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string | null
): Promise<boolean> {
  const secret = process.env.MONEROO_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const { createHmac, timingSafeEqual } = await import("crypto");
  const computed = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");

  const a = Buffer.from(computed, "utf8");
  const b = Buffer.from(signature.trim(), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Formate un montant dans la devise donnée (affichage). */
export function formatMoney(amount: number, currency = DEFAULT_CURRENCY): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount) + " " + currency;
}

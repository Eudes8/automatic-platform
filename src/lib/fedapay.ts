/**
 * Client API FedaPay (serveur uniquement).
 *
 * Documentation : https://docs.fedapay.com
 * - Création    : POST /v1/transactions  → { "v1/transaction": { id, payment_url, status } }
 * - Vérification: GET  /v1/transactions/{id}
 * - Webhooks    : header X-FEDAPAY-SIGNATURE (secret propre à l'endpoint)
 *
 * ⚠️ Ne jamais importer ce module côté client : il contient la clé secrète.
 */

const SANDBOX_BASE = "https://sandbox-api.fedapay.com/v1";
const LIVE_BASE = "https://api.fedapay.com/v1";

function getSecretKey(): string {
  const key = process.env.FEDAPAY_SECRET_KEY;
  if (!key) {
    throw new FedapayError("FEDAPAY_SECRET_KEY manquante dans les variables d'environnement.", 500);
  }
  return key;
}

/** La clé sandbox commence par `sk_sandbox_`, la clé de production par `sk_live_`. */
export function isFedapayConfigured(): boolean {
  return Boolean(process.env.FEDAPAY_SECRET_KEY);
}

function baseUrl(): string {
  return getSecretKey().startsWith("sk_live_") ? LIVE_BASE : SANDBOX_BASE;
}

export class FedapayError extends Error {
  statusCode: number;
  apiError?: unknown;

  constructor(message: string, statusCode = 502, apiError?: unknown) {
    super(message);
    this.name = "FedapayError";
    this.statusCode = statusCode;
    this.apiError = apiError;
  }
}

export interface FedapayCustomer {
  firstname: string;
  lastname: string;
  email: string;
  phone_number?: { number: string; country: string };
}

export interface CreateTransactionInput {
  amount: number;
  description: string;
  callbackUrl: string;
  customer: FedapayCustomer;
  metadata?: Record<string, string>;
}

export interface FedapayTransaction {
  id: number;
  reference: string;
  amount: number;
  status: string;
  payment_url: string | null;
  payment_token: string | null;
  mode: string | null;
}

interface FedapayEnvelope {
  "v1/transaction"?: FedapayTransaction;
  message?: string;
  errors?: unknown;
}

function unwrap(payload: unknown): FedapayTransaction | null {
  const envelope = payload as FedapayEnvelope | null;
  const transaction = envelope?.["v1/transaction"];
  if (transaction && typeof transaction.id === "number") return transaction;

  // Certaines versions renvoient directement l'objet.
  const direct = payload as FedapayTransaction | null;
  if (direct && typeof direct.id === "number") return direct;
  return null;
}

async function request(path: string, init: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch (error) {
    throw new FedapayError(
      "Impossible de joindre FedaPay. Vérifiez la connexion réseau.",
      502,
      error instanceof Error ? error.message : error
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (payload as { message?: string } | null)?.message ??
      "FedaPay a refusé la requête.";
    throw new FedapayError(message, response.status === 401 ? 500 : 502, payload);
  }

  return payload;
}

/** Crée une transaction (collecte) et renvoie l'URL de paiement hébergée. */
export async function createFedapayTransaction(
  input: CreateTransactionInput
): Promise<FedapayTransaction> {
  const amount = Math.round(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new FedapayError("Le montant du paiement doit être un nombre positif.", 400);
  }

  const payload = await request("/transactions", {
    method: "POST",
    body: JSON.stringify({
      description: input.description,
      amount,
      currency: { iso: "XOF" },
      callback_url: input.callbackUrl,
      customer: input.customer,
      ...(input.metadata ? { custom_metadata: input.metadata } : {}),
    }),
  });

  const transaction = unwrap(payload);
  if (!transaction?.payment_url) {
    throw new FedapayError("FedaPay n'a pas renvoyé d'URL de paiement.", 502, payload);
  }

  return transaction;
}

/** Récupère l'état réel d'une transaction : source de vérité. */
export async function getFedapayTransaction(transactionId: string | number): Promise<FedapayTransaction> {
  const payload = await request(`/transactions/${encodeURIComponent(String(transactionId))}`, {
    method: "GET",
  });

  const transaction = unwrap(payload);
  if (!transaction) {
    throw new FedapayError("Réponse FedaPay inattendue.", 502, payload);
  }
  return transaction;
}

/**
 * Vérifie la signature d'un webhook FedaPay.
 *
 * FedaPay signe comme Stripe : en-tête `t=<timestamp>,s=<signature>` et
 * HMAC-SHA256 hexadécimal sur `${timestamp}.${corps brut}`. On accepte aussi
 * un HMAC direct du corps, certaines versions l'envoyant ainsi.
 */
export async function verifyFedapaySignature(rawBody: string, signature: string | null): Promise<boolean> {
  const secret = process.env.FEDAPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const { createHmac, timingSafeEqual } = await import("crypto");
  const compare = (candidate: string) => {
    const a = Buffer.from(candidate, "utf8");
    const b = Buffer.from(signature.trim(), "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  };

  const hmac = (value: string) => createHmac("sha256", secret).update(value, "utf8").digest("hex");

  if (compare(hmac(rawBody))) return true;

  const parts = signature.split(",").reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split("=");
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
  }, {});

  if (parts.t && parts.s) {
    const expected = hmac(`${parts.t}.${rawBody}`);
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(parts.s, "utf8");
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }

  return false;
}

/** Extrait l'identifiant de transaction d'un événement, quel que soit le format. */
export function extractTransactionId(payload: unknown): string | null {
  const event = payload as {
    name?: string;
    data?: { id?: number | string };
    object?: { id?: number | string };
    entity?: { id?: number | string };
  } | null;

  const candidate = event?.data?.id ?? event?.object?.id ?? event?.entity?.id;
  return candidate ? String(candidate) : null;
}

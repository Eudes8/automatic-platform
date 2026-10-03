/**
 * Helpers partagés pour les routes API (serveur uniquement).
 */

import prisma from "@/lib/prisma";
import { auth, ADMIN_EMAIL } from "@/lib/auth-server";
import type { User } from "@prisma/client";

/**
 * Récupère l'utilisateur authentifié (Neon Auth / Better Auth) et son profil
 * Prisma. Renvoie null si la session est absente ou inconnue de la base.
 *
 * Bootstrap : si la session correspond à ADMIN_EMAIL et qu'aucun profil
 * n'existe encore (nouvelle base), le profil ADMIN est créé automatiquement.
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const { data } = await auth.getSession();
    const email = data?.user?.email?.toLowerCase();
    if (!email) return null;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return existing;

    if (email === ADMIN_EMAIL.toLowerCase()) {
      // Bootstrap idempotent du profil administrateur (réservé à cet email)
      return await prisma.user.create({
        data: { email: ADMIN_EMAIL, name: "Super Admin", role: "ADMIN" },
      });
    }

    return null;
  } catch (error) {
    console.error("[api-helpers] Échec de récupération de l'utilisateur :", error);
    return null;
  }
}

/**
 * Détermine l'URL publique de l'application :
 * 1. NEXT_PUBLIC_APP_URL (variable d'environnement, recommandé en production)
 * 2. Origine de la requête entrante (fonctionne en local et sur Vercel)
 */
export function getAppUrl(request: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, "");

  const origin = request.headers.get("origin");
  if (origin) return origin.replace(/\/+$/, "");

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return "http://localhost:3000";
}

/** Réponse JSON normalisée. */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

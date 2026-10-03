/**
 * Helpers partagés pour les routes API (serveur uniquement).
 */

import prisma from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@prisma/client";

/**
 * Récupère l'utilisateur authentifié (Supabase Auth) et son profil Prisma.
 * Renvoie null si la session est absente ou inconnue de la base.
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser?.email) return null;

    return await prisma.user.findUnique({ where: { email: authUser.email } });
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

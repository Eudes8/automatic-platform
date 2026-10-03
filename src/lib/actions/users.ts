"use server";

import { getAuthenticatedUser } from "@/lib/api-helpers";

/**
 * Utilisateur authentifié (Neon Auth) + profil Prisma, ou null.
 * Le contrôle de rôle s'appuie sur User.role (table Prisma).
 */
export async function getCurrentUser() {
    return getAuthenticatedUser();
}

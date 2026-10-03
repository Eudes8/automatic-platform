// Neon Auth (Better Auth managé) — instance serveur.
// Les variables NEON_AUTH_BASE_URL / NEON_AUTH_COOKIE_SECRET sont
// fournies par `neon deploy` / `neon env pull` (voir .env.example).
import { createNeonAuth } from "@neondatabase/auth/next/server";

export const auth = createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL!,
    cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
});

// Email du compte administrateur principal (bootstrap).
// Ne constitue PAS une autorisation à lui seul : le rôle ADMIN est
// vérifié dans la table Prisma `User` (voir getAuthenticatedUser).
export const ADMIN_EMAIL = "automaticbmje@gmail.com";

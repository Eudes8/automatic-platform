import prisma from "@/lib/prisma";
import { ADMIN_EMAIL } from "@/lib/auth-server";

/**
 * Crée le profil Prisma du compte administrateur s'il est absent (idempotent).
 * À invoquer uniquement depuis /api/admin/init (session + email vérifiés).
 * Le mot de passe / compte d'authentification est géré dans Neon Auth
 * (le premier compte inscrit avec cet email obtiendra le rôle ADMIN).
 */
export async function createAdminUser() {
    const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

    if (!existing) {
        await prisma.user.create({
            data: {
                email: ADMIN_EMAIL,
                name: "Super Admin",
                role: "ADMIN"
            }
        });
        console.log("[initAdmin] Profil admin créé.");
    }
}

import { createAdminUser } from "@/lib/actions/initAdmin";
import { auth, ADMIN_EMAIL } from "@/lib/auth-server";
import { NextResponse } from "next/server";

/**
 * Bootstrap du profil ADMIN dans Prisma (idempotent).
 * Sécurisé : réservé à l'utilisateur authentifié dont l'email correspond
 * à ADMIN_EMAIL. Crée le profil si absent — ne crée JAMAIS de compte
 * d'authentification et n'accorde aucun droit par lui-même.
 */
export async function POST() {
    const { data } = await auth.getSession();
    const sessionUser = data?.user;

    if (!sessionUser) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (sessionUser.email !== ADMIN_EMAIL) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await createAdminUser();
    return NextResponse.json({ success: true, message: "Admin initialization check complete." });
}

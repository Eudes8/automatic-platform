import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { getAuthenticatedUser } from "@/lib/api-helpers";
import { z } from "zod";

// ⚠️ Sécurité : cette route est maintenant RÉSERVÉE aux utilisateurs
// authentifiés (Neon Auth). Le compte client est créé côté navigateur via
// authClient.signUp.email (endpoint public Better Auth) AVANT d'appeler
// cette route. Le serveur ne manipule plus jamais de mot de passe :
// l'ancien comportement (réinitialisation du mot de passe d'un email
// existant depuis le formulaire public) était une faille de prise de
// contrôle de compte et a été supprimé.
const projectSchema = z.object({
    projectTitle: z.string().min(3),
    name: z.string().min(2),
    email: z.string().email(),
    type: z.enum(["starter", "web", "mobile", "saas"]),
    features: z.array(z.string()).min(1),
    timeline: z.string(),
});

export async function POST(req: Request) {
    try {
        // 0. Authentification obligatoire (session Neon Auth + profil Prisma)
        const authenticated = await getAuthenticatedUser();
        if (!authenticated) {
            return NextResponse.json(
                { success: false, error: "Authentification requise." },
                { status: 401 }
            );
        }

        const body = await req.json();

        // Validation
        const result = projectSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({
                success: false,
                error: "Données invalides",
                details: result.error.format()
            }, { status: 400 });
        }

        const { projectTitle, name, email, type, features, timeline } = result.data;

        // 1. L'email de la requête doit correspondre au compte authentifié
        if (email.toLowerCase() !== authenticated.email.toLowerCase()) {
            return NextResponse.json(
                { success: false, error: "Cet email ne correspond pas à votre session." },
                { status: 403 }
            );
        }

        // 2. Synchroniser le profil Prisma (nom affichable)
        const user = await prisma.user.upsert({
            where: { email: authenticated.email },
            update: { name },
            create: {
                email: authenticated.email,
                name,
                role: "CLIENT",
            },
        });

        // 3. Create Project with serious-tech pricing
        const basePrices = { starter: 800, web: 1800, mobile: 3200, saas: 5000 };
        const featurePrices: Record<string, number> = { auth: 300, payments: 600, chat: 900, admin: 1200 };

        const basePrice = basePrices[type as keyof typeof basePrices] || 800;
        const featuresTotal = features.reduce((acc, f) => acc + (featurePrices[f] || 0), 0);
        const totalBudget = basePrice + featuresTotal;

        const project = await prisma.project.create({
            data: {
                title: projectTitle.toUpperCase(),
                status: "ONBOARDING",
                clientId: user.id,
                progress: 10,
                budget: totalBudget,
            },
        });

        // 4. Send Custom Estimation Email (best effort — ne bloque pas la création)
        try {
            await resend.emails.send({
                from: 'AUTOMATIC <hello@resend.dev>',
                to: email,
                subject: `🚀 Protocole Initialisé - Nexus Build Overview`,
                html: `
        <div style="font-family: 'Courier New', Courier, monospace; max-width: 600px; margin: 0 auto; background: #000000; color: #ffffff; padding: 40px; border: 1px solid #333;">
          <h1 style="color: #ffffff; font-size: 20px; border-bottom: 1px solid #222; padding-bottom: 20px;">AUTOMATIC_SYSTÈME // RAPPORT_INITIAL</h1>
          <p style="color: #666; font-size: 12px;">ID_SESSION: ${project.id}</p>
          <p>Opérateur ${name}, votre demande d'initialisation pour <strong>${project.title}</strong> a été enregistrée.</p>
          
          <div style="background: #111; border: 1px solid #222; padding: 25px; border-radius: 4px; margin: 30px 0; text-align: center;">
            <p style="margin: 0; font-size: 11px; color: #444; text-transform: uppercase; letter-spacing: 2px;">Estimation_Ressources</p>
            <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: 900; color: #ffffff;">${totalBudget}€</p>
            <p style="margin: 5px 0 0 0; font-size: 10px; color: #333;">~ ${Math.round(totalBudget * 655).toLocaleString()} FCFA</p>
          </div>

          <p style="color: #888; font-size: 13px; line-height: 1.6;">Le manifeste de mission a été injecté dans votre Command Center. Authentifiez-vous pour superviser le build.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${new URL(req.url).origin}/login" style="display: inline-block; background: #ffffff; color: #000000; padding: 15px 30px; border-radius: 2px; text-decoration: none; font-weight: bold; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">
              ACCÉDER_AU_MAINFRAME
            </a>
          </div>
        </div>`,
            });
        } catch (mailError) {
            console.error("[projects] Envoi email de confirmation échoué (non bloquant):", mailError);
        }

        return NextResponse.json({
            success: true,
            project,
            message: "Projet créé avec succès.",
        });
    } catch (error) {
        console.error("[projects] Erreur création projet:", error);
        return NextResponse.json(
            { success: false, error: "Erreur serveur lors de la création du projet." },
            { status: 500 }
        );
    }
}

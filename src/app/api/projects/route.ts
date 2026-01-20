import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { z } from "zod";

const projectSchema = z.object({
    projectTitle: z.string().min(3),
    name: z.string().min(2),
    email: z.string().email(),
    type: z.enum(["starter", "web", "mobile", "saas"]),
    features: z.array(z.string()).min(1),
    timeline: z.string(),
    password: z.string().min(8),
});

export async function POST(req: Request) {
    try {
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

        const { projectTitle, name, email, type, features, timeline, password } = result.data;

        // 1. Create/Update User in Supabase Auth (Directly)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: name },
            app_metadata: { role: 'CLIENT' }
        });

        if (authError) {
            if (authError.message.includes('already been registered')) {
                const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
                const existingUser = users.find(u => u.email === email);
                if (existingUser) {
                    await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
                        password,
                        app_metadata: { role: 'CLIENT' }
                    });
                }
            } else {
                throw authError;
            }
        }

        // 2. Sync with Prisma
        const user = await prisma.user.upsert({
            where: { email },
            update: { name },
            create: {
                email,
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

        // 4. Send Custom Estimation Email
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
        </div>
      `,
        });

        return NextResponse.json({ success: true, projectId: project.id, userId: user.id });
    } catch (error) {
        console.error("Project Creation Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}


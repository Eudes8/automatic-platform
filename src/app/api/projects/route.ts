import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { z } from "zod";

const projectSchema = z.object({
    projectTitle: z.string().min(3),
    name: z.string().min(2),
    email: z.string().email(),
    type: z.enum(["web", "mobile", "saas"]),
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
        // We try to create the user, if they exist we update their password
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: name },
            app_metadata: { role: 'CLIENT' }
        });

        if (authError) {
            if (authError.message.includes('already been registered')) {
                // Find user to get ID and update password
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

        // 3. Create Project
        const basePrices = { web: 2000, mobile: 3500, saas: 5000 };
        const featurePrices: Record<string, number> = { auth: 500, payments: 800, chat: 1200, admin: 1500 };

        const basePrice = basePrices[type as keyof typeof basePrices];
        const featuresTotal = features.reduce((acc, f) => acc + (featurePrices[f] || 0), 0);
        const totalBudget = basePrice + featuresTotal;

        const project = await prisma.project.create({
            data: {
                title: projectTitle.toUpperCase(),
                description: `Architecture: ${type.toUpperCase()} | Modules: ${features.join(", ")} | Timeline: ${timeline.toUpperCase()}`,
                status: "ONBOARDING",
                clientId: user.id,
                progress: 10,
                budget: totalBudget,
            },
        });

        // 4. Send Custom Estimation Email (Confirmation only, no need for link)
        await resend.emails.send({
            from: 'AUTOMATIC <hello@resend.dev>',
            to: email,
            subject: `🚀 Projet Confirmé - Votre Estimation AUTOMATIC`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #020617; color: white; padding: 40px; border-radius: 20px; border: 1px solid #1e293b;">
          <h1 style="color: #3b82f6; font-size: 24px;">AUTOMATIC // CONFIRMATION</h1>
          <p style="color: #94a3b8;">Bonjour ${name},</p>
          <p>Votre projet <strong>${project.title}</strong> est maintenant initialisé.</p>
          
          <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); padding: 25px; border-radius: 15px; margin: 30px 0; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #60a5fa; text-transform: uppercase; letter-spacing: 1px;">Estimation Immédiate</p>
            <p style="margin: 10px 0 0 0; font-size: 42px; font-weight: 900; color: #ffffff;">${totalBudget}€</p>
          </div>

          <p style="color: #94a3b8; line-height: 1.6;">Vous pouvez maintenant vous connecter à votre console avec l'e-mail et le mot de passe que vous venez de choisir.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${new URL(req.url).origin}/login" style="display: inline-block; background: #2563eb; color: white; padding: 18px 35px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
              ACCÉDER À MA CONSOLE
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

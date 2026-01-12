"use server";

import prisma from "@/lib/prisma";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getClientProjects() {
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

        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) return [];

        // Attempting standard Prisma query first for type safety
        const projects = await prisma.project.findMany({
            where: {
                client: {
                    email: user.email
                }
            },
            include: {
                client: true,
                assets: true,
                contracts: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`[Action] Fetched ${projects?.length} projects for ${user.email}.`);
        return projects;
    } catch (error) {
        console.error("[Action Error] getClientProjects:", error);
        // Fallback or empty array in case of Prisma sync issues
        return [];
    }
}

import { revalidatePath } from "next/cache";


import { generateContractPDF } from "@/lib/pdf-generator";
import { uploadFileToStorage } from "@/lib/storage";

export async function signContract(projectId: string, signatureBase64?: string) {
    console.log(`[Action] Signing contract for project: ${projectId}`);

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { client: true }
        });

        if (!project) return { success: false, error: "Project not found" };

        let pdfUrl = null;

        if (signatureBase64) {
            // 1. Generate PDF
            const pdfBytes = await generateContractPDF(
                project.title,
                project.client?.name || "Client",
                signatureBase64,
                new Date()
            );

            // 2. Upload PDF
            const path = `contracts/${projectId}/${Date.now()}_signed_contract.pdf`;
            pdfUrl = await uploadFileToStorage("project-assets", path, Buffer.from(pdfBytes), "application/pdf");
        }

        const result = await prisma.project.update({
            where: { id: projectId },
            data: {
                contractSigned: true,
                contractUrl: pdfUrl
            }
        });

        // Update or Create Contract Record
        const contractData = {
            signatureBase64,
            signedAt: new Date(),
            status: "SIGNED",
            content: "Contrat signé généré automatiquement.",
        };

        const existingContract = await prisma.contract.findFirst({
            where: { projectId }
        });

        if (existingContract) {
            await prisma.contract.update({
                where: { id: existingContract.id },
                data: contractData
            });
        } else {
            await prisma.contract.create({
                data: {
                    projectId,
                    ...contractData
                }
            });
        }

        // Bust cache
        revalidatePath('/dashboard');
        revalidatePath(`/dashboard/projects/${projectId}`);
        revalidatePath('/dashboard/projects');

        return { success: true, pdfUrl };
    } catch (error) {
        console.error("[Action Error] signContract:", error);
        return { success: false, error };
    }
}

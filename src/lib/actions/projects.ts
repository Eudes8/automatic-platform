"use server";

import prisma from "@/lib/prisma";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ContractStatus } from "@prisma/client";

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
                contracts: true,
                invoices: true
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

        if (!project) {
            console.error(`[Action] Project not found: ${projectId}`);
            return { success: false, error: "Project not found" };
        }

        let pdfUrl = null;

        if (signatureBase64) {
            try {
                // 1. Generate PDF
                console.log("[Action] Generating contract PDF...");
                const pdfBytes = await generateContractPDF(
                    project.title,
                    project.client?.name || "Client",
                    signatureBase64,
                    new Date()
                );
                console.log("[Action] PDF generated:", pdfBytes.length, "bytes");

                // 2. Upload PDF
                const path = `contracts/${projectId}/${Date.now()}_signed_contract.pdf`;
                console.log("[Action] Uploading PDF to storage:", path);
                pdfUrl = await uploadFileToStorage("project-assets", path, Buffer.from(pdfBytes), "application/pdf");
                console.log("[Action] PDF uploaded:", pdfUrl);
            } catch (pdfError) {
                console.error("[Action] Error generating/uploading PDF:", pdfError);
                // Continue without PDF upload, still save signature
            }
        }

        console.log("[Action] Updating project...");
        const result = await prisma.project.update({
            where: { id: projectId },
            data: {
                contractSigned: true,
                contractUrl: pdfUrl
            }
        });
        console.log("[Action] Project updated:", result.id);

        // Update or Create Contract Record
        const contractData = {
            signatureBase64,
            signedAt: new Date(),
            status: ContractStatus.SIGNED,
            content: "Contrat signé généré automatiquement.",
        };

        const existingContract = await prisma.contract.findFirst({
            where: { projectId }
        });

        if (existingContract) {
            console.log("[Action] Updating existing contract...");
            await prisma.contract.update({
                where: { id: existingContract.id },
                data: contractData
            });
        } else {
            console.log("[Action] Creating new contract...");
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

        console.log("[Action] Contract signed successfully!");
        return { success: true, pdfUrl };
    } catch (error) {
        console.error("[Action Error] signContract:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: errorMessage };
    }
}

export async function getUserProjects() {
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

        const projects = await prisma.project.findMany({
            where: {
                client: {
                    email: user.email
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return projects;
    } catch (error) {
        console.error("[Action Error] getUserProjects:", error);
        return [];
    }
}

export async function getDashboardStats() {
    try {
        const projects = await getClientProjects();

        const totalProjects = projects.length;
        const activeProjects = projects.filter(p => p.status !== 'DONE').length;
        const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
        const pendingContracts = projects.filter(p => !p.contractSigned).length;

        return {
            totalProjects,
            activeProjects,
            totalBudget,
            pendingContracts
        };
    } catch (error) {
        console.error("[Action Error] getDashboardStats:", error);
        return {
            totalProjects: 0,
            activeProjects: 0,
            totalBudget: 0,
            pendingContracts: 0
        };
    }
}

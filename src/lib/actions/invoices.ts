"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateInvoicePDF } from "@/lib/pdf-generator";
import { uploadFileToStorage } from "@/lib/storage";
import { requireAdmin } from "@/lib/utils/adminAuth";
import { logAdminAction } from "@/lib/utils/audit";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createInvoice(formData: FormData) {
    const admin = await requireAdmin();
    const projectId = formData.get("projectId") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const dueDate = new Date(formData.get("dueDate") as string);
    const description = formData.get("description") as string;

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { client: true }
        });

        if (!project) return { success: false, error: "Project not found" };

        const invoice = await prisma.invoice.create({
            data: {
                projectId,
                clientId: project.clientId,
                amount,
                dueDate,
                description,
                status: "SENT",
            }
        });

        const pdfBytes = await generateInvoicePDF(
            invoice.id,
            project.client?.name || "Client",
            project.title,
            amount,
            new Date()
        );

        const path = `invoices/${invoice.id}.pdf`;
        const pdfUrl = await uploadFileToStorage("project-assets", path, Buffer.from(pdfBytes), "application/pdf");

        await prisma.invoice.update({
            where: { id: invoice.id },
            data: { pdfUrl }
        });

        await logAdminAction(
            "CREATE_INVOICE",
            `Facture d'un montant de ${amount} CFA générée pour le projet "${project.title}"`,
            "INVOICE",
            invoice.id
        );

        revalidatePath(`/admin/projects/${projectId}`);
        revalidatePath("/admin/invoices");
        return { success: true };
    } catch (error) {
        console.error("Failed to create invoice", error);
        return { success: false, error: "Create failed" };
    }
}

export async function getAllInvoices() {
    await requireAdmin();
    try {
        return await prisma.invoice.findMany({
            include: {
                client: true,
                project: true
            },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Failed to fetch invoices:", error);
        return [];
    }
}

export async function getClientInvoices() {
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

        return await prisma.invoice.findMany({
            where: {
                client: {
                    email: user.email
                }
            },
            include: {
                project: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    } catch (error) {
        console.error("Failed to fetch client invoices:", error);
        return [];
    }
}

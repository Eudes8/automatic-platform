"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateInvoicePDF } from "@/lib/pdf-generator";
import { uploadFileToStorage } from "@/lib/storage";
import { requireAdmin } from "@/lib/utils/adminAuth";

export async function createInvoice(formData: FormData) {
    await requireAdmin();
    const projectId = formData.get("projectId") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const dueDate = new Date(formData.get("dueDate") as string);

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { client: true }
        });

        if (!project) return { success: false, error: "Project not found" };

        // 1. Create Invoice Record in Draft
        const invoice = await prisma.invoice.create({
            data: {
                projectId,
                clientId: project.clientId,
                amount,
                dueDate,
                status: "SENT",
            }
        });

        // 2. Generate PDF
        const pdfBytes = await generateInvoicePDF(
            invoice.id,
            project.client?.name || "Client",
            project.title,
            amount,
            new Date()
        );

        // 3. Upload PDF
        const path = `invoices/${invoice.id}.pdf`;
        const pdfUrl = await uploadFileToStorage("project-assets", path, Buffer.from(pdfBytes), "application/pdf");

        // 4. Update Invoice with PDF URL
        await prisma.invoice.update({
            where: { id: invoice.id },
            data: { pdfUrl }
        });

        revalidatePath(`/admin/projects/${projectId}`);
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

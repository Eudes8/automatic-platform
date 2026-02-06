"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/utils/adminAuth";
import { createAdminNotification } from "@/lib/actions/notifications";

import { getCurrentUser } from "@/lib/actions/users";
import { logAuditAction } from "@/lib/actions/audit";

export async function createProject(formData: FormData) {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    const title = formData.get("title") as string;
    const clientEmail = formData.get("clientEmail") as string;
    const budget = parseFloat(formData.get("budget") as string) || 0;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const timeline = formData.get("timeline") as string;
    const techStackRaw = formData.get("techStack") as string;
    const techStack = techStackRaw ? techStackRaw.split(',').map(t => t.trim()) : [];

    const client = await prisma.user.findUnique({
        where: { email: clientEmail }
    });

    if (!client) return { success: false, error: "Client not found" };

    try {
        const project = await prisma.project.create({
            data: {
                title,
                description,
                category,
                timeline,
                techStack,
                clientId: client.id,
                budget,
                status: "ONBOARDING"
            } as any
        });

        await logAuditAction({
            adminId: admin.id,
            action: "CREATE_PROJECT",
            entity: "PROJECT",
            entityId: project.id,
            details: `Project "${title}" créé pour ${client.name} (${clientEmail}). Catégorie: ${category}, Budget: ${budget} CFA.`
        });

        await createAdminNotification(
            "Nouveau Project",
            `Project "${title}" créé pour ${client.name}`,
            "PROJECT",
            `/admin/projects/${project.id}`
        );
        revalidatePath("/admin/projects");
        return { success: true };
    } catch (error) {
        console.error("Project creation failed:", error);
        return { success: false, error: "Creation failed" };
    }
}

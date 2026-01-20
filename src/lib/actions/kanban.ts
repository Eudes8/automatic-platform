"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/utils/adminAuth";
import { revalidatePath } from "next/cache";
import { ProjectStatus } from "@prisma/client";

export async function updateProjectStatus(projectId: string, newStatus: ProjectStatus) {
    await requireAdmin();
    try {
        await prisma.project.update({
            where: { id: projectId },
            data: { status: newStatus }
        });
        revalidatePath("/admin/projects");
        return { success: true };
    } catch (error) {
        console.error("Failed to update project status:", error);
        return { success: false, error: "Failed to update status" };
    }
}

export async function updateProjectProgress(projectId: string, progress: number) {
    await requireAdmin();
    try {
        await prisma.project.update({
            where: { id: projectId },
            data: { progress }
        });
        revalidatePath("/admin/projects");
        return { success: true };
    } catch (error) {
        console.error("Failed to update project progress:", error);
        return { success: false, error: "Failed to update progress" };
    }
}

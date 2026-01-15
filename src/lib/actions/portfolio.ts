// TODO: Implement PortfolioProject model in Prisma schema
/*
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/utils/adminAuth";

export async function getPortfolioProjects() {
    await requireAdmin();
    try {
        return await prisma.portfolioProject.findMany({
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Failed to fetch portfolio projects:", error);
        return [];
    }
}

export async function createPortfolioProject(data: {
    title: string;
    category: string;
    image: string;
    description: string;
    tech: string[];
    githubUrl?: string;
    liveUrl?: string;
}) {
    await requireAdmin();
    try {
        const project = await prisma.portfolioProject.create({
            data
        });
        revalidatePath("/");
        revalidatePath("/admin/portfolio");
        return { success: true, project };
    } catch (error) {
        console.error("Failed to create portfolio project:", error);
        return { success: false, error: "Creation failed" };
    }
}

export async function updatePortfolioProject(id: string, data: any) {
    await requireAdmin();
    try {
        await prisma.portfolioProject.update({
            where: { id },
            data
        });
        revalidatePath("/");
        revalidatePath("/admin/portfolio");
        return { success: true };
    } catch (error) {
        console.error("Failed to update portfolio project:", error);
        return { success: false, error: "Update failed" };
    }
}

export async function deletePortfolioProject(id: string) {
    await requireAdmin();
    try {
        await prisma.portfolioProject.delete({
            where: { id }
        });
        revalidatePath("/");
        revalidatePath("/admin/portfolio");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete portfolio project:", error);
        return { success: false, error: "Deletion failed" };
    }
}
*/

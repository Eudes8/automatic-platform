"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/utils/adminAuth";

export async function getPortfolioProjects() {
    try {
        return await prisma.portfolioProject.findMany({
            orderBy: { createdAt: "desc" }
        });
    } catch (error) {
        console.error("Failed to fetch portfolio projects:", error);
        return [];
    }
}

export async function createPortfolioProject(formData: FormData) {
    await requireAdmin();
    try {
        const title = formData.get("title") as string;
        const category = formData.get("category") as string;
        const description = formData.get("description") as string;
        const image = formData.get("image") as string;
        const techStr = formData.get("tech") as string;
        const url = formData.get("url") as string || null;
        const github = formData.get("github") as string || null;
        const featured = formData.get("featured") === "true";

        const tech = techStr.split(",").map(t => t.trim()).filter(t => t !== "");

        await prisma.portfolioProject.create({
            data: {
                title,
                category,
                description,
                image,
                tech,
                url,
                github,
                featured
            }
        });

        revalidatePath("/");
        revalidatePath("/admin/portfolio");
        return { success: true };
    } catch (error) {
        console.error("Failed to create portfolio project:", error);
        return { success: false, error: "Failed to create project" };
    }
}

export async function updatePortfolioProject(id: string, formData: FormData) {
    await requireAdmin();
    try {
        const title = formData.get("title") as string;
        const category = formData.get("category") as string;
        const description = formData.get("description") as string;
        const image = formData.get("image") as string;
        const techStr = formData.get("tech") as string;
        const url = formData.get("url") as string || null;
        const github = formData.get("github") as string || null;
        const featured = formData.get("featured") === "true";

        const tech = techStr.split(",").map(t => t.trim()).filter(t => t !== "");

        await prisma.portfolioProject.update({
            where: { id },
            data: {
                title,
                category,
                description,
                image,
                tech,
                url,
                github,
                featured
            }
        });

        revalidatePath("/");
        revalidatePath("/admin/portfolio");
        return { success: true };
    } catch (error) {
        console.error("Failed to update portfolio project:", error);
        return { success: false, error: "Failed to update project" };
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
        return { success: false, error: "Failed to delete project" };
    }
}

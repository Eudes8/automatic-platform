"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
    const title = formData.get("title") as string;
    const clientEmail = formData.get("clientEmail") as string;
    const budget = parseFloat(formData.get("budget") as string) || 0;

    const client = await prisma.user.findUnique({
        where: { email: clientEmail }
    });

    if (!client) return { success: false, error: "Client not found" };

    try {
        await prisma.project.create({
            data: {
                title,
                clientId: client.id,
                budget,
                status: "ONBOARDING"
            }
        });
        revalidatePath("/admin/projects");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Creation failed" };
    }
}

"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "./users";
import { revalidatePath } from "next/cache";
import { createAdminNotification } from "./notifications";

export async function sendAdminMessage(projectId: string, text: string) {
    const admin = await getCurrentUser();

    if (!admin || admin.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await prisma.message.create({
            data: {
                text,
                senderId: admin.id,
                projectId: projectId
            }
        });
        revalidatePath(`/admin/chat`);
        return { success: true };
    } catch (error) {
        console.error("Sending message failed:", error);
        return { success: false, error: "Failed to send" };
    }
}

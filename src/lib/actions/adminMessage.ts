"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "./users";
import { revalidatePath } from "next/cache";
import { createAdminNotification } from "./notifications";

export async function sendAdminMessage(projectId: string, text: string, attachment?: string) {
    const admin = await getCurrentUser();

    if (!admin || admin.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Find if there's a conversation for this project to ensure support widget also gets the message
        const conversation = await prisma.conversation.findFirst({
            where: { projectId: projectId }
        });

        await prisma.message.create({
            data: {
                text,
                senderId: admin.id,
                projectId: projectId,
                attachment,
                conversationId: conversation?.id // Link to conversation if exists
            }
        });
        revalidatePath(`/admin/chat`);
        revalidatePath(`/dashboard/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Sending message failed:", error);
        return { success: false, error: "Failed to send" };
    }
}

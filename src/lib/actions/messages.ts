"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "./users";
import { createAdminNotification } from "./notifications";

export async function getProjectMessages(projectId: string) {
    try {
        // Get both direct project messages and messages from project conversations
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    // Direct project messages
                    {
                        projectId,
                        conversationId: null
                    },
                    // Messages from project conversations
                    {
                        conversation: {
                            projectId
                        }
                    }
                ]
            },
            include: {
                sender: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        });
        return messages;
    } catch (error) {
        console.error("[Action Error] getProjectMessages:", error);
        return [];
    }
}

export async function sendChatMessage(projectId: string, text: string) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error("Unauthorized");

        const message = await prisma.message.create({
            data: {
                projectId,
                senderId: user.id,
                text,
            },
            include: {
                sender: true,
            },
        });

        // Notify admins of new client message
        if (user.role === "CLIENT") {
            const project = await prisma.project.findUnique({
                where: { id: projectId },
                select: { title: true }
            });
            await createAdminNotification(
                "Nouveau Message Client",
                `${user.name} a envoyé un message sur "${project?.title}"`,
                `/admin/chat`
            );
        }

        return message;
    } catch (error) {
        console.error("[Action Error] sendChatMessage:", error);
        throw error;
    }
}

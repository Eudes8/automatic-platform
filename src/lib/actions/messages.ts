"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "./users";

export async function getProjectMessages(projectId: string) {
    try {
        const messages = await prisma.message.findMany({
            where: { projectId },
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
        return message;
    } catch (error) {
        console.error("[Action Error] sendChatMessage:", error);
        throw error;
    }
}

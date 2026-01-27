"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "./users";

export async function getOrCreateConversation(projectId?: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // If projectId is provided, try to find existing conversation linked to it
    if (projectId) {
        const existing = await prisma.conversation.findFirst({
            where: { projectId },
            include: {
                messages: { orderBy: { createdAt: 'asc' } },
                users: true
            }
        });
        if (existing) return existing;
    } else {
        // If no project, find a general support conversation for this user
        // We assume a general conversation has NO projectId and includes this user
        const existing = await prisma.conversation.findFirst({
            where: {
                projectId: null,
                users: { some: { id: user.id } }
            },
            include: {
                messages: { orderBy: { createdAt: 'asc' } },
                users: true
            }
        });
        if (existing) return existing;
    }

    // Create new conversation
    // For now, initially just add the current user. Admin will see it in the list.
    return await prisma.conversation.create({
        data: {
            projectId,
            users: { connect: { id: user.id } }
            // Future: auto-connect support admin?
        },
        include: {
            messages: true,
            users: true
        }
    });
}

export async function sendMessage(conversationId: string, content: string, attachment?: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    // Important: Get the conversation to find if it belongs to a project
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { projectId: true }
    });

    const message = await prisma.message.create({
        data: {
            conversationId,
            projectId: conversation?.projectId, // Pass the project ID so project-based listeners react
            senderId: user.id,
            text: content,
            attachment,
            read: false,
        },
        include: { sender: true }
    });

    return message;
}

export async function getConversationsForAdmin() {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

    return await prisma.conversation.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
            users: true,
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
            },
            project: true
        }
    });
}

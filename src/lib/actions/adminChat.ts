"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/utils/adminAuth";

import { Message, User } from "@prisma/client";

export type ChatChannel = {
    id: string;
    type: 'PROJECT' | 'SUPPORT';
    title: string;
    client: User | null;
    messages: (Message & { sender?: User })[];
    updatedAt: string;
    status: string;
    originalId: string;
};

export async function getAllChatChannels(): Promise<ChatChannel[]> {
    await requireAdmin();

    const [projects, conversations] = await Promise.all([
        prisma.project.findMany({
            include: {
                client: true,
                messages: {
                    include: { sender: true },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { updatedAt: 'desc' }
        }),
        prisma.conversation.findMany({
            include: {
                users: true,
                messages: {
                    include: { sender: true },
                    orderBy: { createdAt: 'asc' }
                },
                project: true
            },
            orderBy: { updatedAt: 'desc' }
        })
    ]);

    // Map projects to channels
    const projectChannels: ChatChannel[] = projects
        .map((p) => ({
            id: p.id,
            type: 'PROJECT' as const,
            title: p.title,
            client: p.client,
            messages: p.messages, // Show all messages for the project, don't filter out those with conversationId
            updatedAt: p.updatedAt.toISOString(),
            status: p.status,
            originalId: p.id // Keep original ID for determining message target
        }));

    // Map conversations to channels
    const conversationChannels: ChatChannel[] = conversations.map((c) => {
        const client = c.users.find((u) => u.role === 'CLIENT') || c.users[0] || null;
        return {
            id: c.id,
            type: 'SUPPORT' as const,
            title: c.subject || (c.project ? `${c.project.title} (Support)` : "Support Général"),
            client: client,
            messages: c.messages,
            updatedAt: c.updatedAt.toISOString(),
            status: 'ACTIVE',
            originalId: c.id
        };
    });

    const all: ChatChannel[] = [...projectChannels, ...conversationChannels].sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return all;
}

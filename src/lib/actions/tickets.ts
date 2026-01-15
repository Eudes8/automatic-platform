"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/utils/adminAuth";
import { getCurrentUser } from "./users";
import { createAdminNotification } from "./notifications";
import { TicketStatus, TicketPriority } from "@prisma/client";

export async function getAllTickets(page: number = 1, limit: number = 20) {
    await requireAdmin();
    const skip = (page - 1) * limit;
    const [tickets, total] = await Promise.all([
        prisma.ticket.findMany({
            include: {
                client: true,
                assignedTo: true,
                project: true,
                responses: {
                    include: { author: true },
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.ticket.count()
    ]);
    return { tickets, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getClientTickets() {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    return await prisma.ticket.findMany({
        where: { clientId: user.id },
        include: {
            assignedTo: true,
            project: true,
            responses: {
                include: { author: true },
                orderBy: { createdAt: 'desc' }
            }
        },
        orderBy: { updatedAt: 'desc' }
    });
}

export async function createTicket(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as TicketPriority || "MEDIUM";
    const projectId = formData.get("projectId") as string || null;

    const ticket = await prisma.ticket.create({
        data: {
            title,
            description,
            priority,
            clientId: user.id,
            projectId
        }
    });

    // Notify admins
    await createAdminNotification(
        "Nouveau Ticket Support",
        `Ticket "${title}" créé par ${user.name}`,
        `/admin/tickets/${ticket.id}`
    );

    return { success: true, ticket };
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus) {
    await requireAdmin();

    const ticket = await prisma.ticket.update({
        where: { id: ticketId },
        data: { status },
        include: { client: true }
    });

    // Notify client
    await prisma.notification.create({
        data: {
            userId: ticket.clientId,
            title: "Mise à jour de votre ticket",
            message: `Le statut de votre ticket "${ticket.title}" est maintenant : ${status}`,
            link: `/dashboard/tickets/${ticket.id}`
        }
    });

    return { success: true };
}

export async function assignTicket(ticketId: string, assignedToId: string) {
    await requireAdmin();

    const ticket = await prisma.ticket.update({
        where: { id: ticketId },
        data: { assignedToId },
        include: { client: true, assignedTo: true }
    });

    // Notify assigned admin
    if (assignedToId) {
        await prisma.notification.create({
            data: {
                userId: assignedToId,
                title: "Ticket assigné",
                message: `Vous avez été assigné au ticket "${ticket.title}"`,
                link: `/admin/tickets/${ticket.id}`
            }
        });
    }

    return { success: true };
}

export async function addTicketResponse(ticketId: string, message: string, isInternal: boolean = false) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const response = await prisma.ticketResponse.create({
        data: {
            ticketId,
            authorId: user.id,
            message,
            isInternal
        },
        include: { author: true }
    });

    // Update ticket updatedAt
    await prisma.ticket.update({
        where: { id: ticketId },
        data: { updatedAt: new Date() }
    });

    // Notify the other party
    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { client: true, assignedTo: true }
    });

    if (ticket) {
        const notifyUserId = user.role === "ADMIN" ? ticket.clientId : (ticket.assignedToId || ticket.clientId);
        if (notifyUserId !== user.id) {
            await prisma.notification.create({
                data: {
                    userId: notifyUserId,
                    title: "Nouvelle réponse sur votre ticket",
                    message: `Réponse sur "${ticket.title}"`,
                    link: user.role === "ADMIN" ? `/admin/tickets/${ticketId}` : `/dashboard/tickets/${ticketId}`
                }
            });
        }
    }

    return { success: true, response };
}

export async function getTicketDetails(ticketId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
            client: true,
            assignedTo: true,
            project: true,
            responses: {
                include: { author: true },
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    if (!ticket) return null;

    // Check if user can access this ticket
    if (user.role !== "ADMIN" && ticket.clientId !== user.id) {
        throw new Error("Unauthorized");
    }

    return ticket;
}
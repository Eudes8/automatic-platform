"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "./users";
import { revalidatePath } from "next/cache";

// Use local type if Prisma generate hasn't fully propagated to IDE
export type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "PROJECT" | "PAYMENT" | "CHAT";

export async function createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = "INFO",
    link?: string
) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link,
                read: false
            }
        });

        revalidatePath('/dashboard');
        revalidatePath('/admin');
        return notification;
    } catch (error) {
        console.error("Failed to create notification:", error);
        return null;
    }
}

export async function getUserNotifications() {
    const user = await getCurrentUser();
    if (!user) return [];

    return await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 50
    });
}

export async function getUnreadCount() {
    const user = await getCurrentUser();
    if (!user) return 0;

    return await prisma.notification.count({
        where: {
            userId: user.id,
            read: false
        }
    });
}

export async function markAsRead(notificationId: string) {
    const user = await getCurrentUser();
    if (!user) return { success: false };

    try {
        await prisma.notification.update({
            where: { id: notificationId, userId: user.id },
            data: { read: true }
        });

        revalidatePath('/dashboard');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function markAllAsRead() {
    const user = await getCurrentUser();
    if (!user) return { success: false };

    try {
        await prisma.notification.updateMany({
            where: { userId: user.id, read: false },
            data: { read: true }
        });

        revalidatePath('/dashboard');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function deleteAllNotifications() {
    const user = await getCurrentUser();
    if (!user) return { success: false };

    try {
        await prisma.notification.deleteMany({
            where: { userId: user.id }
        });

        revalidatePath('/dashboard');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function deleteNotification(notificationId: string) {
    const user = await getCurrentUser();
    if (!user) return { success: false };

    try {
        await prisma.notification.delete({
            where: { id: notificationId, userId: user.id }
        });

        revalidatePath('/dashboard');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function createAdminNotification(title: string, message: string, type: NotificationType = "INFO", link?: string) {
    try {
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' }
        });

        for (const admin of admins) {
            await createNotification(admin.id, title, message, type, link);
        }
        return { success: true };
    } catch (error) {
        console.error("Failed to create admin notifications:", error);
        return { success: false };
    }
}

// Helper: Notify when new requirement is created
export async function notifyNewRequirement(projectId: string, requirementTitle: string, createdByUserId: string) {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { client: true }
    });

    if (!project) return;

    // Get all admins
    const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' }
    });

    // Notify admin if client created it
    if (project.clientId === createdByUserId) {
        for (const admin of admins) {
            await createNotification(
                admin.id,
                "Nouveau Besoin Client",
                `${project.client?.name || 'Un client'} a ajouté "${requirementTitle}" au projet ${project.title}`,
                "PROJECT",
                `/admin/projects/${projectId}`
            );
        }
    }
    // Notify client if admin created it
    else {
        await createNotification(
            project.clientId,
            "Nouvelle Proposition",
            `AUTOMATIC a proposé "${requirementTitle}" pour votre projet ${project.title}`,
            "PROJECT",
            `/dashboard/projects/${projectId}`
        );
    }
}

// Helper: Notify when requirement status changes
export async function notifyRequirementStatusChange(
    requirementId: string,
    newStatus: string,
    changedByUserId: string
) {
    const requirement = await prisma.requirement.findUnique({
        where: { id: requirementId },
        include: { project: { include: { client: true } } }
    });

    if (!requirement) return;

    const project = requirement.project;
    const statusEmoji = newStatus === 'APPROVED' ? '✅' : newStatus === 'REJECTED' ? '❌' : '🔄';

    // Notify client if admin changed it
    if (project.clientId !== changedByUserId) {
        await createNotification(
            project.clientId,
            `Mise à Jour Cahier des Charges`,
            `"${requirement.title}" est maintenant ${newStatus}`,
            "PROJECT",
            `/dashboard/projects/${project.id}`
        );
    }
}

// Helper: Notify when new asset is uploaded
export async function notifyNewAsset(projectId: string, assetName: string) {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { client: true }
    });

    if (!project) return;

    await createNotification(
        project.clientId,
        "Nouveau Livrable",
        `${assetName} a été ajouté à votre projet ${project.title}`,
        "SUCCESS",
        `/dashboard/projects/${projectId}`
    );
}

// Helper: Notify when contract is ready
export async function notifyContractReady(projectId: string) {
    const project = await prisma.project.findUnique({
        where: { id: projectId }
    });

    if (!project) return;

    await createNotification(
        project.clientId,
        "Contrat Prêt",
        `Votre contrat pour ${project.title} est prêt à être signé`,
        "WARNING",
        `/dashboard/projects/${projectId}`
    );
}
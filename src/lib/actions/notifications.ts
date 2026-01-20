"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/utils/adminAuth";

export async function getAdminNotifications() {
    await requireAdmin();
    try {
        const notifications = await prisma.notification.findMany({
            where: { user: { role: "ADMIN" } },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        return notifications;
    } catch (error) {
        console.error("Failed to fetch admin notifications:", error);
        return [];
    }
}

export async function createAdminNotification(title: string, message: string, link?: string) {
    try {
        // Get all admin users
        const admins = await prisma.user.findMany({
            where: { role: "ADMIN" }
        });

        const notifications = await Promise.all(
            admins.map(admin =>
                prisma.notification.create({
                    data: {
                        userId: admin.id,
                        title,
                        message,
                        link
                    }
                })
            )
        );
        return { success: true, notifications };
    } catch (error) {
        console.error("Failed to create admin notification:", error);
        return { success: false, error: "Failed to create notification" };
    }
}

export async function markNotificationAsRead(notificationId: string) {
    await requireAdmin();
    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true }
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to mark as read" };
    }
}
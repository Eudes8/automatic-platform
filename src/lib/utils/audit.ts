"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "./adminAuth";

export async function logAdminAction(action: string, details?: string) {
    const admin = await requireAdmin();
    try {
        await prisma.auditLog.create({
            data: {
                adminId: admin.id,
                action,
                details
            }
        });
    } catch (error) {
        console.error("Failed to log admin action:", error);
    }
}
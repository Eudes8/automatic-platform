"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "./adminAuth";
import { headers } from "next/headers";

export async function logAdminAction(action: string, details?: string, entity?: string, entityId?: string) {
    const admin = await requireAdmin();
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    try {
        await prisma.auditLog.create({
            data: {
                adminId: admin.id,
                action,
                details,
                entity,
                entityId,
                ipAddress: ip,
                userAgent: userAgent
            }
        });
    } catch (error) {
        console.error("Failed to log admin action:", error);
    }
}
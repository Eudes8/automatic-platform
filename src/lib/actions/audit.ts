"use server";

import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function logAuditAction({
    adminId,
    action,
    entity,
    entityId,
    details
}: {
    adminId: string;
    action: string;
    entity: string;
    entityId?: string;
    details?: string;
}) {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    try {
        await prisma.auditLog.create({
            data: {
                adminId,
                action,
                entity,
                entityId,
                details,
                ipAddress: ip,
                userAgent: userAgent
            }
        });
    } catch (error) {
        console.error("Failed to log audit action", error);
    }
}

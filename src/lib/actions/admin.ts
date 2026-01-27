"use server";

import prisma from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/utils/adminAuth";
import { logAdminAction } from "@/lib/utils/audit";

export async function getAdminStats() {
    await requireAdmin();
    const totalProjects = await prisma.project.count();
    const totalUsers = await prisma.user.count({ where: { role: 'CLIENT' } });

    const projects = await prisma.project.findMany({
        select: { budget: true }
    });

    const invoices = await prisma.invoice.findMany({
        where: { status: "PAID" },
        select: { amount: true }
    });

    // Real revenue from paid invoices
    const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.amount || 0), 0);
    // Potential revenue from all project budgets
    const potentialRevenue = projects.reduce((acc, p) => acc + (p.budget || 0), 0);

    // Count messages from clients in the last 24 hours
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const newMessages = await prisma.message.count({
        where: {
            createdAt: {
                gte: yesterday
            },
            sender: {
                role: "CLIENT"
            }
        }
    });

    const signedContracts = await prisma.contract.count({
        where: { status: "SIGNED" }
    });

    return {
        totalProjects,
        totalUsers,
        totalRevenue,
        potentialRevenue,
        newMessages,
        signedContracts
    };
}

export async function getProjectsByStatus() {
    await requireAdmin();
    const projects = await prisma.project.findMany({
        include: {
            client: true,
            messages: {
                select: { id: true }
            },
            assets: {
                select: { id: true }
            }
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    return projects;
}

export async function updateProjectStatus(projectId: string, status: ProjectStatus) {
    const admin = await requireAdmin();
    const result = await prisma.project.update({
        where: { id: projectId },
        data: { status },
    });
    await logAdminAction("UPDATE_PROJECT_STATUS", `Statut du projet mis à jour vers ${status}`, "PROJECT", projectId);
    return result;
}

"use server";

import prisma from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/utils/adminAuth";
import { logAdminAction } from "@/lib/utils/audit";

export async function getAdminStats() {
    await requireAdmin();
    const totalProjects = await prisma.project.count();
    const totalUsers = await prisma.user.count();

    const projects = await prisma.project.findMany({
        select: { budget: true }
    });

    // Calculate total revenue from project budgets
    const totalRevenue = projects.reduce((acc, p) => acc + (p.budget || 0), 0);

    // Count messages from clients in the last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

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
        newMessages,
        signedContracts
    };
}

export async function getProjectsByStatus() {
    const projects = await prisma.project.findMany({
        include: {
            client: true,
        },
        orderBy: {
            createdAt: "desc",
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
    await logAdminAction("UPDATE_PROJECT_STATUS", `Project ${projectId} status changed to ${status}`);
    return result;
}

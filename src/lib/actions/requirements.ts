"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "./users";
import { revalidatePath } from "next/cache";
import { RequirementStatus, RequirementCategory } from "@prisma/client";
import { notifyNewRequirement, notifyRequirementStatusChange } from "./notifications";

export async function createRequirement(projectId: string, title: string, description: string, category: RequirementCategory = "OTHER") {
    const user = await getCurrentUser();
    if (!user) throw new Error("Non autorisé");

    const requirement = await prisma.requirement.create({
        data: {
            projectId,
            title,
            description,
            category,
            createdBy: user.id,
            status: RequirementStatus.SUGGESTED
        }
    });

    // Notify relevant parties
    await notifyNewRequirement(projectId, title, user.id);

    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath(`/admin/projects/${projectId}`);
    return requirement;
}

export async function addRequirementComment(requirementId: string, text: string, attachments: string[] = []) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Non autorisé");

    const comment = await prisma.requirementComment.create({
        data: {
            requirementId,
            authorId: user.id,
            text,
            attachments
        }
    });

    const requirement = await prisma.requirement.findUnique({
        where: { id: requirementId },
        select: { projectId: true }
    });

    if (requirement) {
        revalidatePath(`/dashboard/projects/${requirement.projectId}`);
        revalidatePath(`/admin/projects/${requirement.projectId}`);
    }

    return comment;
}

export async function updateRequirementStatus(requirementId: string, status: RequirementStatus) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Non autorisé");

    const existing = await prisma.requirement.findUnique({
        where: { id: requirementId },
        select: { status: true, projectId: true }
    });

    if (!existing) throw new Error("Requirement not found");

    if (existing.status !== status) {
        const [requirement] = await prisma.$transaction([
            prisma.requirement.update({
                where: { id: requirementId },
                data: { status }
            }),
            prisma.requirementStatusHistory.create({
                data: {
                    requirementId,
                    from: existing.status,
                    to: status,
                    changedBy: user.id
                }
            })
        ]);

        // Notify about status change
        await notifyRequirementStatusChange(requirementId, status, user.id);

        revalidatePath(`/dashboard/projects/${existing.projectId}`);
        revalidatePath(`/admin/projects/${existing.projectId}`);
        return requirement;
    }

    return existing;
}

export async function getProjectRequirements(projectId: string) {
    return await prisma.requirement.findMany({
        where: { projectId },
        include: {
            comments: {
                orderBy: { createdAt: 'asc' }
            },
            statusHistory: {
                orderBy: { createdAt: 'desc' }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function deleteRequirement(requirementId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Non autorisé");

    const requirement = await prisma.requirement.findUnique({
        where: { id: requirementId },
        select: { projectId: true, createdBy: true }
    });

    if (!requirement) throw new Error("Not found");

    await prisma.requirement.delete({
        where: { id: requirementId }
    });

    revalidatePath(`/dashboard/projects/${requirement.projectId}`);
    revalidatePath(`/admin/projects/${requirement.projectId}`);
}

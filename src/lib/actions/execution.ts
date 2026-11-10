"use server";

/**
 * Socle d'exécution des projets : équipe, tâches, jalons et livrables.
 *
 * Règles d'accès (vérifiées à chaque appel, jamais côté client) :
 *  - ADMIN            → lecture + écriture complètes ;
 *  - membre d'équipe  → lecture + écriture sur les tâches de son projet ;
 *  - client du projet → lecture + validation des livrables.
 * Toute autre session est rejetée.
 */

import prisma from "@/lib/prisma";
import { getCurrentUser } from "./users";
import { revalidatePath } from "next/cache";
import {
    DeliverableStatus,
    MilestoneStatus,
    TaskPriority,
    TaskStatus,
    TeamRole,
} from "@prisma/client";
import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Accès                                                               */
/* ------------------------------------------------------------------ */

interface ProjectActor {
    userId: string;
    role: "ADMIN" | "STAFF" | "CLIENT";
    isAdmin: boolean;
    isClientOwner: boolean;
    isMember: boolean;
}

async function resolveActor(projectId: string): Promise<ProjectActor> {
    const user = await getCurrentUser();
    if (!user) throw new Error("Non autorisé : session requise.");

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { clientId: true, members: { where: { userId: user.id }, select: { id: true } } },
    });
    if (!project) throw new Error("Projet introuvable.");

    return {
        userId: user.id,
        role: user.role,
        isAdmin: user.role === "ADMIN",
        isClientOwner: project.clientId === user.id,
        isMember: project.members.length > 0,
    };
}

async function requireWriteAccess(projectId: string): Promise<ProjectActor> {
    const actor = await resolveActor(projectId);
    if (!actor.isAdmin && !actor.isMember) {
        throw new Error("Accès refusé : seul l'équipe projet peut modifier l'exécution.");
    }
    return actor;
}

async function requireReadAccess(projectId: string): Promise<ProjectActor> {
    const actor = await resolveActor(projectId);
    if (!actor.isAdmin && !actor.isMember && !actor.isClientOwner) {
        throw new Error("Accès refusé à ce projet.");
    }
    return actor;
}

async function requireReviewAccess(projectId: string): Promise<ProjectActor> {
    const actor = await resolveActor(projectId);
    if (!actor.isAdmin && !actor.isClientOwner) {
        throw new Error("Accès refusé : seul le client du projet (ou un admin) valide un livrable.");
    }
    return actor;
}

function touch(projectId: string) {
    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath(`/admin/projects/${projectId}/execution`);
    revalidatePath("/admin/projects");
    revalidatePath("/dashboard/projects");
}

/**
 * Recalcule l'avancement du projet à partir des tâches réellement terminées.
 * Sans tâche, on retombe sur les jalons validés — jamais d'écrasement par 0.
 */
async function recomputeProgress(projectId: string): Promise<number> {
    const [totalTasks, doneTasks, totalMilestones, validatedMilestones] = await Promise.all([
        prisma.task.count({ where: { projectId } }),
        prisma.task.count({ where: { projectId, status: "DONE" } }),
        prisma.milestone.count({ where: { projectId } }),
        prisma.milestone.count({ where: { projectId, status: "VALIDATED" } }),
    ]);

    let progress: number | null = null;
    if (totalTasks > 0) {
        progress = Math.round((doneTasks / totalTasks) * 100);
    } else if (totalMilestones > 0) {
        progress = Math.round((validatedMilestones / totalMilestones) * 100);
    }

    if (progress === null) return 0;

    await prisma.project.update({ where: { id: projectId }, data: { progress } });
    return progress;
}

/* ------------------------------------------------------------------ */
/* Lecture                                                             */
/* ------------------------------------------------------------------ */

export async function getProjectExecution(projectId: string) {
    await requireReadAccess(projectId);

    const [tasks, milestones, deliverables, members] = await Promise.all([
        prisma.task.findMany({
            where: { projectId },
            include: {
                assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
                milestone: { select: { id: true, title: true } },
            },
            orderBy: [{ status: "asc" }, { position: "asc" }, { createdAt: "asc" }],
        }),
        prisma.milestone.findMany({
            where: { projectId },
            include: { _count: { select: { tasks: true, deliverables: true } } },
            orderBy: [{ position: "asc" }, { dueDate: "asc" }],
        }),
        prisma.deliverable.findMany({
            where: { projectId },
            include: { milestone: { select: { id: true, title: true } } },
            orderBy: { createdAt: "desc" },
        }),
        prisma.projectMember.findMany({
            where: { projectId },
            include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } },
            orderBy: { createdAt: "asc" },
        }),
    ]);

    return { tasks, milestones, deliverables, members };
}

/** Collaborateurs affectables : admins, staff et membres déjà rattachés. */
export async function getAssignableUsers() {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") return [];

    return prisma.user.findMany({
        where: { role: { in: ["ADMIN", "STAFF"] } },
        select: { id: true, name: true, email: true, role: true },
        orderBy: { name: "asc" },
    });
}

/* ------------------------------------------------------------------ */
/* Équipe                                                              */
/* ------------------------------------------------------------------ */

const memberSchema = z.object({
    projectId: z.string().min(1),
    userId: z.string().min(1),
    role: z.enum(["LEAD", "DEVELOPER", "DESIGNER", "QA", "DEVOPS", "CONSULTANT"]).default("DEVELOPER"),
    allocation: z.number().int().min(0).max(100).default(100),
});

export async function addProjectMember(input: unknown) {
    const parsed = memberSchema.safeParse(input);
    if (!parsed.success) return { success: false as const, error: "Données invalides." };

    const { projectId, userId, role, allocation } = parsed.data;
    await requireWriteAccess(projectId);

    const existing = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId } },
    });
    if (existing) return { success: false as const, error: "Ce collaborateur est déjà dans l'équipe." };

    const member = await prisma.projectMember.create({
        data: { projectId, userId, role: role as TeamRole, allocation },
    });

    touch(projectId);
    return { success: true as const, member };
}

export async function removeProjectMember(memberId: string) {
    const member = await prisma.projectMember.findUnique({
        where: { id: memberId },
        select: { projectId: true },
    });
    if (!member) return { success: false as const, error: "Membre introuvable." };

    await requireWriteAccess(member.projectId);
    await prisma.projectMember.delete({ where: { id: memberId } });
    touch(member.projectId);
    return { success: true as const };
}

/* ------------------------------------------------------------------ */
/* Tâches                                                              */
/* ------------------------------------------------------------------ */

const taskSchema = z.object({
    projectId: z.string().min(1),
    title: z.string().trim().min(3, "Titre trop court (3 caractères minimum).").max(160),
    description: z.string().trim().max(4000).optional().nullable(),
    status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "DONE"]).default("BACKLOG"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
    assigneeId: z.string().min(1).optional().nullable(),
    milestoneId: z.string().min(1).optional().nullable(),
    dueDate: z.string().optional().nullable(),
    estimateH: z.number().min(0).max(999).optional().nullable(),
});

function parseDate(value?: string | null): Date | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export async function createTask(input: unknown) {
    const parsed = taskSchema.safeParse(input);
    if (!parsed.success) {
        return { success: false as const, error: parsed.error.issues[0]?.message ?? "Données invalides." };
    }

    const data = parsed.data;
    const actor = await requireWriteAccess(data.projectId);

    const last = await prisma.task.findFirst({
        where: { projectId: data.projectId, status: data.status as TaskStatus },
        orderBy: { position: "desc" },
        select: { position: true },
    });

    const task = await prisma.task.create({
        data: {
            projectId: data.projectId,
            title: data.title,
            description: data.description || null,
            status: data.status as TaskStatus,
            priority: data.priority as TaskPriority,
            assigneeId: data.assigneeId || null,
            milestoneId: data.milestoneId || null,
            dueDate: parseDate(data.dueDate),
            estimateH: data.estimateH ?? null,
            createdById: actor.userId,
            position: (last?.position ?? 0) + 1,
        },
    });

    await recomputeProgress(data.projectId);
    touch(data.projectId);
    return { success: true as const, task };
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
    const task = await prisma.task.findUnique({ where: { id: taskId }, select: { projectId: true } });
    if (!task) return { success: false as const, error: "Tâche introuvable." };

    await requireWriteAccess(task.projectId);

    await prisma.task.update({ where: { id: taskId }, data: { status } });
    const progress = await recomputeProgress(task.projectId);
    touch(task.projectId);
    return { success: true as const, progress };
}

export async function updateTask(taskId: string, input: unknown) {
    const task = await prisma.task.findUnique({ where: { id: taskId }, select: { projectId: true } });
    if (!task) return { success: false as const, error: "Tâche introuvable." };

    await requireWriteAccess(task.projectId);

    const parsed = taskSchema.partial().safeParse(input);
    if (!parsed.success) {
        return { success: false as const, error: parsed.error.issues[0]?.message ?? "Données invalides." };
    }

    const data = parsed.data;
    await prisma.task.update({
        where: { id: taskId },
        data: {
            ...(data.title !== undefined ? { title: data.title } : {}),
            ...(data.description !== undefined ? { description: data.description || null } : {}),
            ...(data.status !== undefined ? { status: data.status as TaskStatus } : {}),
            ...(data.priority !== undefined ? { priority: data.priority as TaskPriority } : {}),
            ...(data.assigneeId !== undefined ? { assigneeId: data.assigneeId || null } : {}),
            ...(data.milestoneId !== undefined ? { milestoneId: data.milestoneId || null } : {}),
            ...(data.dueDate !== undefined ? { dueDate: parseDate(data.dueDate) } : {}),
            ...(data.estimateH !== undefined ? { estimateH: data.estimateH ?? null } : {}),
        },
    });

    await recomputeProgress(task.projectId);
    touch(task.projectId);
    return { success: true as const };
}

export async function deleteTask(taskId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId }, select: { projectId: true } });
    if (!task) return { success: false as const, error: "Tâche introuvable." };

    await requireWriteAccess(task.projectId);
    await prisma.task.delete({ where: { id: taskId } });
    await recomputeProgress(task.projectId);
    touch(task.projectId);
    return { success: true as const };
}

/* ------------------------------------------------------------------ */
/* Jalons                                                             */
/* ------------------------------------------------------------------ */

const milestoneSchema = z.object({
    projectId: z.string().min(1),
    title: z.string().trim().min(3, "Titre trop court (3 caractères minimum).").max(160),
    description: z.string().trim().max(2000).optional().nullable(),
    dueDate: z.string().optional().nullable(),
    position: z.number().int().min(0).optional(),
});

export async function createMilestone(input: unknown) {
    const parsed = milestoneSchema.safeParse(input);
    if (!parsed.success) {
        return { success: false as const, error: parsed.error.issues[0]?.message ?? "Données invalides." };
    }

    const data = parsed.data;
    await requireWriteAccess(data.projectId);

    const last = await prisma.milestone.findFirst({
        where: { projectId: data.projectId },
        orderBy: { position: "desc" },
        select: { position: true },
    });

    const milestone = await prisma.milestone.create({
        data: {
            projectId: data.projectId,
            title: data.title,
            description: data.description || null,
            dueDate: parseDate(data.dueDate),
            position: data.position ?? (last?.position ?? 0) + 1,
        },
    });

    await recomputeProgress(data.projectId);
    touch(data.projectId);
    return { success: true as const, milestone };
}

export async function updateMilestoneStatus(milestoneId: string, status: MilestoneStatus) {
    const milestone = await prisma.milestone.findUnique({
        where: { id: milestoneId },
        select: { projectId: true },
    });
    if (!milestone) return { success: false as const, error: "Jalon introuvable." };

    await requireWriteAccess(milestone.projectId);

    await prisma.milestone.update({
        where: { id: milestoneId },
        data: {
            status,
            validatedAt: status === "VALIDATED" ? new Date() : null,
        },
    });

    await recomputeProgress(milestone.projectId);
    touch(milestone.projectId);
    return { success: true as const };
}

export async function deleteMilestone(milestoneId: string) {
    const milestone = await prisma.milestone.findUnique({
        where: { id: milestoneId },
        select: { projectId: true },
    });
    if (!milestone) return { success: false as const, error: "Jalon introuvable." };

    await requireWriteAccess(milestone.projectId);
    await prisma.milestone.delete({ where: { id: milestoneId } });
    await recomputeProgress(milestone.projectId);
    touch(milestone.projectId);
    return { success: true as const };
}

/* ------------------------------------------------------------------ */
/* Livrables                                                          */
/* ------------------------------------------------------------------ */

const deliverableSchema = z.object({
    projectId: z.string().min(1),
    name: z.string().trim().min(3, "Nom trop court (3 caractères minimum).").max(160),
    description: z.string().trim().max(2000).optional().nullable(),
    version: z.string().trim().max(24).optional(),
    fileUrl: z.string().trim().max(2048).optional().nullable(),
    milestoneId: z.string().min(1).optional().nullable(),
});

export async function createDeliverable(input: unknown) {
    const parsed = deliverableSchema.safeParse(input);
    if (!parsed.success) {
        return { success: false as const, error: parsed.error.issues[0]?.message ?? "Données invalides." };
    }

    const data = parsed.data;
    await requireWriteAccess(data.projectId);

    const deliverable = await prisma.deliverable.create({
        data: {
            projectId: data.projectId,
            name: data.name,
            description: data.description || null,
            version: data.version || "v1.0",
            fileUrl: data.fileUrl || null,
            milestoneId: data.milestoneId || null,
            status: DeliverableStatus.DRAFT,
        },
    });

    touch(data.projectId);
    return { success: true as const, deliverable };
}

/** L'équipe soumet le livrable au client pour validation. */
export async function submitDeliverable(deliverableId: string) {
    const deliverable = await prisma.deliverable.findUnique({
        where: { id: deliverableId },
        include: { project: { select: { clientId: true, title: true } } },
    });
    if (!deliverable) return { success: false as const, error: "Livrable introuvable." };

    await requireWriteAccess(deliverable.projectId);

    await prisma.deliverable.update({
        where: { id: deliverableId },
        data: { status: DeliverableStatus.SUBMITTED, submittedAt: new Date(), feedback: null },
    });

    const { createNotification } = await import("./notifications");
    await createNotification(
        deliverable.project.clientId,
        "Livrable à valider",
        `« ${deliverable.name} » (${deliverable.version}) est prêt à être validé pour ${deliverable.project.title}.`,
        "PROJECT",
        `/dashboard/projects/${deliverable.projectId}`
    );

    touch(deliverable.projectId);
    return { success: true as const };
}

/** Le client (ou un admin) accepte le livrable ou demande des corrections. */
export async function reviewDeliverable(deliverableId: string, decision: "ACCEPT" | "REQUEST_CHANGES", feedback?: string) {
    const deliverable = await prisma.deliverable.findUnique({
        where: { id: deliverableId },
        include: { project: { select: { title: true } } },
    });
    if (!deliverable) return { success: false as const, error: "Livrable introuvable." };
    if (deliverable.status !== "SUBMITTED") {
        return { success: false as const, error: "Ce livrable n'est pas en attente de validation." };
    }

    const actor = await requireReviewAccess(deliverable.projectId);
    const accepted = decision === "ACCEPT";

    await prisma.deliverable.update({
        where: { id: deliverableId },
        data: {
            status: accepted ? DeliverableStatus.ACCEPTED : DeliverableStatus.CHANGES_REQUESTED,
            reviewedAt: new Date(),
            reviewedById: actor.userId,
            feedback: feedback?.trim() || null,
        },
    });

    const { createAdminNotification } = await import("./notifications");
    await createAdminNotification(
        accepted ? "Livrable validé" : "Corrections demandées",
        `« ${deliverable.name} » ${accepted ? "a été accepté" : "nécessite des corrections"} sur ${deliverable.project.title}.`,
        accepted ? "SUCCESS" : "WARNING",
        `/admin/projects/${deliverable.projectId}/execution`
    );

    touch(deliverable.projectId);
    return { success: true as const };
}

export async function deleteDeliverable(deliverableId: string) {
    const deliverable = await prisma.deliverable.findUnique({
        where: { id: deliverableId },
        select: { projectId: true },
    });
    if (!deliverable) return { success: false as const, error: "Livrable introuvable." };

    await requireWriteAccess(deliverable.projectId);
    await prisma.deliverable.delete({ where: { id: deliverableId } });
    touch(deliverable.projectId);
    return { success: true as const };
}

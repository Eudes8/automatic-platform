/** Types de présentation du socle d'exécution (aucun import Prisma côté client). */

export type TaskStatusKey = "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type TaskPriorityKey = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type MilestoneStatusKey = "PLANNED" | "IN_PROGRESS" | "IN_REVIEW" | "VALIDATED";
export type DeliverableStatusKey = "DRAFT" | "SUBMITTED" | "CHANGES_REQUESTED" | "ACCEPTED";
export type DeliverableCategoryKey = "DESIGN" | "DEVELOPMENT" | "DOCUMENTATION" | "CONTENT" | "DEPLOYMENT" | "OTHER";
export type TeamRoleKey = "LEAD" | "DEVELOPER" | "DESIGNER" | "QA" | "DEVOPS" | "CONSULTANT";

export type DateLike = string | Date;

export interface PersonView {
    id: string;
    name: string | null;
    email: string;
}

export interface TeamUserView {
    id: string;
    name: string | null;
    email: string;
    role: string;
}

export interface TaskView {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatusKey;
    priority: TaskPriorityKey;
    assigneeId: string | null;
    assignee: PersonView | null;
    milestoneId: string | null;
    milestone: { id: string; title: string } | null;
    dueDate: DateLike | null;
    estimateH: number | null;
    createdAt: DateLike;
}

export interface MilestoneView {
    id: string;
    title: string;
    description: string | null;
    dueDate: DateLike | null;
    status: MilestoneStatusKey;
    position: number;
    _count?: { tasks: number; deliverables: number };
}

export interface DeliverableFileView {
    id: string;
    name: string;
    url: string;
    mimeType: string;
    size: number;
}

export interface DeliverableView {
    id: string;
    name: string;
    description: string | null;
    version: string;
    category: DeliverableCategoryKey;
    files: DeliverableFileView[];
    fileUrl: string | null;
    status: DeliverableStatusKey;
    feedback: string | null;
    submittedAt: DateLike | null;
    reviewedAt: DateLike | null;
    milestoneId: string | null;
    milestone: { id: string; title: string } | null;
    createdAt: DateLike;
}

export interface MemberView {
    id: string;
    role: TeamRoleKey;
    allocation: number;
    user: PersonView & { role: string };
}

export const TASK_COLUMNS: { key: TaskStatusKey; label: string; hint: string }[] = [
    { key: "BACKLOG", label: "Backlog", hint: "Idées à cadrer" },
    { key: "TODO", label: "À faire", hint: "Prêt à démarrer" },
    { key: "IN_PROGRESS", label: "En cours", hint: "En production" },
    { key: "REVIEW", label: "Revue", hint: "Contrôle qualité" },
    { key: "DONE", label: "Terminé", hint: "Livré" },
];

export const PRIORITY_LABEL: Record<TaskPriorityKey, string> = {
    LOW: "Basse",
    MEDIUM: "Moyenne",
    HIGH: "Haute",
    URGENT: "Urgente",
};

export const PRIORITY_STYLE: Record<TaskPriorityKey, string> = {
    LOW: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    MEDIUM: "bg-primary/10 text-primary border-primary/20",
    HIGH: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    URGENT: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

export const MILESTONE_LABEL: Record<MilestoneStatusKey, string> = {
    PLANNED: "Planifié",
    IN_PROGRESS: "En cours",
    IN_REVIEW: "En revue",
    VALIDATED: "Validé",
};

export const MILESTONE_STYLE: Record<MilestoneStatusKey, string> = {
    PLANNED: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    IN_PROGRESS: "bg-primary/10 text-primary border-primary/20",
    IN_REVIEW: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    VALIDATED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

export const DELIVERABLE_LABEL: Record<DeliverableStatusKey, string> = {
    DRAFT: "Brouillon",
    SUBMITTED: "En attente de validation",
    CHANGES_REQUESTED: "Corrections demandées",
    ACCEPTED: "Validé",
};

export const DELIVERABLE_STYLE: Record<DeliverableStatusKey, string> = {
    DRAFT: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    SUBMITTED: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    CHANGES_REQUESTED: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    ACCEPTED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

export const TEAM_ROLE_LABEL: Record<TeamRoleKey, string> = {
    LEAD: "Chef de projet",
    DEVELOPER: "Développeur",
    DESIGNER: "Designer",
    QA: "Qualité / QA",
    DEVOPS: "DevOps",
    CONSULTANT: "Consultant",
};

export function formatDay(value: DateLike | null | undefined): string {
    if (!value) return "—";
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function toDateInputValue(value: DateLike | null | undefined): string {
    if (!value) return "";
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
}

export function initialsOf(name: string | null, email: string): string {
    const base = (name || email || "?").trim();
    const parts = base.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return base.slice(0, 2).toUpperCase();
}

export const DELIVERABLE_CATEGORY_LABEL: Record<DeliverableCategoryKey, string> = {
    DESIGN: "Design",
    DEVELOPMENT: "Développement",
    DOCUMENTATION: "Documentation",
    CONTENT: "Contenu",
    DEPLOYMENT: "Mise en ligne",
    OTHER: "Autre",
};


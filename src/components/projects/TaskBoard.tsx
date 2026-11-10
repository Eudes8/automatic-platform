"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Plus, Trash2, Calendar, User, Loader2, AlertCircle } from "lucide-react";
import {
    createTask,
    deleteTask,
    updateTaskStatus,
} from "@/lib/actions/execution";
import {
    PRIORITY_LABEL,
    PRIORITY_STYLE,
    TASK_COLUMNS,
    formatDay,
    initialsOf,
    toDateInputValue,
    type MilestoneView,
    type PersonView,
    type TaskPriorityKey,
    type TaskStatusKey,
    type TaskView,
} from "@/types/execution";

interface TaskBoardProps {
    projectId: string;
    tasks: TaskView[];
    members: { user: PersonView }[];
    milestones: MilestoneView[];
    canEdit: boolean;
}

export default function TaskBoard({ projectId, tasks, members, milestones, canEdit }: TaskBoardProps) {
    const [items, setItems] = useState<TaskView[]>(tasks);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        setItems(tasks);
    }, [tasks]);

    const grouped = useMemo(() => {
        const map = new Map<TaskStatusKey, TaskView[]>();
        for (const column of TASK_COLUMNS) map.set(column.key, []);
        for (const task of items) {
            const bucket = map.get(task.status);
            if (bucket) bucket.push(task);
        }
        return map;
    }, [items]);

    const done = items.filter((task) => task.status === "DONE").length;
    const ratio = items.length > 0 ? Math.round((done / items.length) * 100) : 0;

    function moveTask(taskId: string, status: TaskStatusKey) {
        const current = items.find((task) => task.id === taskId);
        if (!current || current.status === status) return;

        setError(null);
        const previous = items;
        setItems((list) => list.map((task) => (task.id === taskId ? { ...task, status } : task)));

        startTransition(async () => {
            const result = await updateTaskStatus(taskId, status);
            if (!result.success) {
                setItems(previous);
                setError(result.error ?? "Déplacement impossible.");
            }
        });
    }

    function removeTask(taskId: string) {
        setError(null);
        const previous = items;
        setItems((list) => list.filter((task) => task.id !== taskId));

        startTransition(async () => {
            const result = await deleteTask(taskId);
            if (!result.success) {
                setItems(previous);
                setError(result.error ?? "Suppression impossible.");
            }
        });
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40">
                        Exécution — {items.length} tâche{items.length > 1 ? "s" : ""}
                    </h3>
                    <p className="text-2xl font-bold text-primary tracking-tight mt-1">
                        {done}/{items.length || 0} terminée{done > 1 ? "s" : ""}
                        <span className="ml-3 text-sm font-bold text-secondary/40 align-middle">{ratio}%</span>
                    </p>
                </div>

                {canEdit && (
                    <button
                        type="button"
                        onClick={() => setShowForm((value) => !value)}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-background text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-transform"
                    >
                        <Plus size={14} /> Nouvelle tâche
                    </button>
                )}
            </div>

            {error && (
                <p className="flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                    <AlertCircle size={14} /> {error}
                </p>
            )}

            {canEdit && showForm && (
                <TaskForm
                    projectId={projectId}
                    members={members}
                    milestones={milestones}
                    onCreated={(task) => {
                        setItems((list) => [...list, task]);
                        setShowForm(false);
                    }}
                    onError={setError}
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                {TASK_COLUMNS.map((column) => {
                    const columnTasks = grouped.get(column.key) ?? [];
                    return (
                        <div
                            key={column.key}
                            onDragOver={(event) => {
                                if (canEdit) event.preventDefault();
                            }}
                            onDrop={(event) => {
                                if (!canEdit) return;
                                event.preventDefault();
                                const taskId = event.dataTransfer.getData("text/plain") || draggingId;
                                if (taskId) moveTask(taskId, column.key);
                                setDraggingId(null);
                            }}
                            className={`rounded-2xl border border-border/60 bg-card/60 p-4 min-h-[180px] transition-colors ${
                                draggingId ? "border-primary/30" : ""
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                                    {column.label}
                                </span>
                                <span className="text-[9px] font-bold text-secondary/40">
                                    {columnTasks.length}
                                </span>
                            </div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-secondary/30 mb-4">
                                {column.hint}
                            </p>

                            <div className="space-y-3">
                                {columnTasks.map((task) => (
                                    <article
                                        key={task.id}
                                        draggable={canEdit}
                                        onDragStart={(event) => {
                                            setDraggingId(task.id);
                                            event.dataTransfer.setData("text/plain", task.id);
                                        }}
                                        onDragEnd={() => setDraggingId(null)}
                                        className={`group rounded-xl border border-border/60 bg-background p-3 shadow-sm transition-all ${
                                            canEdit ? "cursor-grab active:cursor-grabbing hover:border-primary/40" : ""
                                        } ${isPending ? "opacity-90" : ""}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-xs font-bold text-primary leading-snug">
                                                {task.title}
                                            </p>
                                            {canEdit && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTask(task.id)}
                                                    aria-label={`Supprimer ${task.title}`}
                                                    className="opacity-0 group-hover:opacity-100 text-secondary/30 hover:text-rose-500 transition-all"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>

                                        {task.description && (
                                            <p className="mt-1 text-[11px] text-secondary/60 line-clamp-2">
                                                {task.description}
                                            </p>
                                        )}

                                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                            <span
                                                className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                                    PRIORITY_STYLE[task.priority]
                                                }`}
                                            >
                                                {PRIORITY_LABEL[task.priority]}
                                            </span>
                                            {task.milestone && (
                                                <span className="text-[8px] font-bold uppercase tracking-widest text-secondary/50 bg-secondary/5 border border-border/60 px-2 py-0.5 rounded-full">
                                                    {task.milestone.title}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-3 flex items-center justify-between text-[9px] text-secondary/40 font-bold uppercase tracking-widest">
                                            <span className="inline-flex items-center gap-1">
                                                <Calendar size={10} /> {formatDay(task.dueDate)}
                                            </span>
                                            {task.assignee ? (
                                                <span
                                                    title={task.assignee.name ?? task.assignee.email}
                                                    className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-[8px] font-black"
                                                >
                                                    {initialsOf(task.assignee.name, task.assignee.email)}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-secondary/30">
                                                    <User size={10} /> —
                                                </span>
                                            )}
                                        </div>

                                        {canEdit && (
                                            <select
                                                value={task.status}
                                                onChange={(event) =>
                                                    moveTask(task.id, event.target.value as TaskStatusKey)
                                                }
                                                aria-label={`Statut de ${task.title}`}
                                                className="mt-2 w-full rounded-lg border border-border/60 bg-background px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-secondary/60 outline-none focus:border-primary"
                                            >
                                                {TASK_COLUMNS.map((c) => (
                                                    <option key={c.key} value={c.key}>
                                                        {c.label}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </article>
                                ))}

                                {columnTasks.length === 0 && (
                                    <p className="text-[10px] italic text-secondary/30 py-4 text-center">
                                        Aucune tâche
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface TaskFormProps {
    projectId: string;
    members: { user: PersonView }[];
    milestones: MilestoneView[];
    onCreated: (task: TaskView) => void;
    onError: (message: string | null) => void;
}

function TaskForm({ projectId, members, milestones, onCreated, onError }: TaskFormProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<TaskPriorityKey>("MEDIUM");
    const [assigneeId, setAssigneeId] = useState("");
    const [milestoneId, setMilestoneId] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [saving, setSaving] = useState(false);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        if (saving) return;
        setSaving(true);
        onError(null);

        const result = await createTask({
            projectId,
            title,
            description: description || null,
            priority,
            assigneeId: assigneeId || null,
            milestoneId: milestoneId || null,
            dueDate: dueDate || null,
            status: "TODO",
        });

        setSaving(false);
        if (!result.success) {
            onError(result.error ?? "Création impossible.");
            return;
        }

        onCreated({
            id: result.task.id,
            title: result.task.title,
            description: result.task.description,
            status: result.task.status,
            priority: result.task.priority,
            assigneeId: result.task.assigneeId,
            assignee: members.find((m) => m.user.id === result.task.assigneeId)?.user ?? null,
            milestoneId: result.task.milestoneId,
            milestone: milestones.find((m) => m.id === result.task.milestoneId)
                ? { id: result.task.milestoneId!, title: milestones.find((m) => m.id === result.task.milestoneId)!.title }
                : null,
            dueDate: result.task.dueDate ? toDateInputValue(result.task.dueDate) : null,
            estimateH: result.task.estimateH,
            createdAt: result.task.createdAt,
        });
        setTitle("");
        setDescription("");
        setDueDate("");
    }

    return (
        <form
            onSubmit={submit}
            className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-5 grid grid-cols-1 md:grid-cols-6 gap-3"
        >
            <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                minLength={3}
                placeholder="Intitulé de la tâche"
                className="md:col-span-3 rounded-xl border border-border/60 bg-background px-4 py-3 text-xs font-bold text-primary outline-none focus:border-primary"
            />
            <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as TaskPriorityKey)}
                className="rounded-xl border border-border/60 bg-background px-3 py-3 text-[10px] font-black uppercase tracking-widest text-primary outline-none focus:border-primary"
            >
                {(Object.keys(PRIORITY_LABEL) as TaskPriorityKey[]).map((key) => (
                    <option key={key} value={key}>
                        {PRIORITY_LABEL[key]}
                    </option>
                ))}
            </select>
            <select
                value={assigneeId}
                onChange={(event) => setAssigneeId(event.target.value)}
                className="rounded-xl border border-border/60 bg-background px-3 py-3 text-[10px] font-bold text-primary outline-none focus:border-primary"
            >
                <option value="">Non assignée</option>
                {members.map((member) => (
                    <option key={member.user.id} value={member.user.id}>
                        {member.user.name ?? member.user.email}
                    </option>
                ))}
            </select>
            <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="rounded-xl border border-border/60 bg-background px-3 py-3 text-[10px] font-bold text-primary outline-none focus:border-primary"
            />
            <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Détail (optionnel)"
                className="md:col-span-4 rounded-xl border border-border/60 bg-background px-4 py-3 text-xs text-primary outline-none focus:border-primary"
            />
            <select
                value={milestoneId}
                onChange={(event) => setMilestoneId(event.target.value)}
                className="rounded-xl border border-border/60 bg-background px-3 py-3 text-[10px] font-bold text-primary outline-none focus:border-primary"
            >
                <option value="">Sans jalon</option>
                {milestones.map((milestone) => (
                    <option key={milestone.id} value={milestone.id}>
                        {milestone.title}
                    </option>
                ))}
            </select>
            <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-primary text-background text-[10px] font-black uppercase tracking-widest px-4 py-3 inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Ajouter
            </button>
        </form>
    );
}

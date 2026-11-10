"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarClock, CheckCircle2, Flag, Loader2, Plus, Trash2 } from "lucide-react";
import { createMilestone, deleteMilestone, updateMilestoneStatus } from "@/lib/actions/execution";
import {
    MILESTONE_LABEL,
    MILESTONE_STYLE,
    formatDay,
    type MilestoneStatusKey,
    type MilestoneView,
} from "@/types/execution";

interface MilestonePanelProps {
    projectId: string;
    milestones: MilestoneView[];
    canEdit: boolean;
}

export default function MilestonePanel({ projectId, milestones, canEdit }: MilestonePanelProps) {
    const [items, setItems] = useState<MilestoneView[]>(milestones);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        setItems(milestones);
    }, [milestones]);

    function changeStatus(id: string, status: MilestoneStatusKey) {
        setError(null);
        const previous = items;
        setItems((list) => list.map((item) => (item.id === id ? { ...item, status } : item)));
        startTransition(async () => {
            const result = await updateMilestoneStatus(id, status);
            if (!result.success) {
                setItems(previous);
                setError(result.error ?? "Mise à jour impossible.");
            }
        });
    }

    function remove(id: string) {
        setError(null);
        const previous = items;
        setItems((list) => list.filter((item) => item.id !== id));
        startTransition(async () => {
            const result = await deleteMilestone(id);
            if (!result.success) {
                setItems(previous);
                setError(result.error ?? "Suppression impossible.");
            }
        });
    }

    async function create(event: React.FormEvent) {
        event.preventDefault();
        setError(null);
        const result = await createMilestone({ projectId, title, dueDate: dueDate || null });
        if (!result.success) {
            setError(result.error ?? "Création impossible.");
            return;
        }
        setItems((list) => [
            ...list,
            {
                id: result.milestone.id,
                title: result.milestone.title,
                description: result.milestone.description,
                dueDate: result.milestone.dueDate,
                status: result.milestone.status,
                position: result.milestone.position,
                _count: { tasks: 0, deliverables: 0 },
            },
        ]);
        setTitle("");
        setDueDate("");
        setShowForm(false);
    }

    const validated = items.filter((item) => item.status === "VALIDATED").length;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40">
                        Jalons du projet
                    </h3>
                    <p className="text-2xl font-bold text-primary tracking-tight mt-1">
                        {validated}/{items.length || 0} validé{validated > 1 ? "s" : ""}
                    </p>
                </div>
                {canEdit && (
                    <button
                        type="button"
                        onClick={() => setShowForm((value) => !value)}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-border/60 text-primary text-[10px] font-black uppercase tracking-widest hover:border-primary/40 transition-colors"
                    >
                        <Plus size={14} /> Nouveau jalon
                    </button>
                )}
            </div>

            {error && <p className="text-xs font-bold text-rose-600">{error}</p>}

            {canEdit && showForm && (
                <form onSubmit={create} className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-primary/20 bg-primary/[0.03] p-4">
                    <input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        required
                        minLength={3}
                        placeholder="Ex. Livraison MVP — lot 1"
                        className="flex-1 rounded-xl border border-border/60 bg-background px-4 py-3 text-xs font-bold text-primary outline-none focus:border-primary"
                    />
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(event) => setDueDate(event.target.value)}
                        className="rounded-xl border border-border/60 bg-background px-3 py-3 text-[10px] font-bold text-primary outline-none focus:border-primary"
                    />
                    <button
                        type="submit"
                        className="rounded-xl bg-primary text-background text-[10px] font-black uppercase tracking-widest px-5 py-3 inline-flex items-center justify-center gap-2"
                    >
                        <Plus size={13} /> Créer
                    </button>
                </form>
            )}

            {items.length === 0 ? (
                <p className="text-xs italic text-secondary/40">
                    Aucun jalon défini. Découpez le projet en étapes livrables pour suivre l&apos;avancement réel.
                </p>
            ) : (
                <ol className="relative space-y-4 border-l border-border/60 pl-6">
                    {items.map((milestone) => (
                        <li key={milestone.id} className="relative">
                            <span className="absolute -left-[31px] top-4 w-3 h-3 rounded-full bg-background border-2 border-primary/40" />
                            <div className="rounded-2xl border border-border/60 bg-card/60 p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Flag size={13} className="text-primary" />
                                            <p className="text-sm font-bold text-primary">{milestone.title}</p>
                                        </div>
                                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-secondary/40 inline-flex items-center gap-1">
                                            <CalendarClock size={11} /> Échéance {formatDay(milestone.dueDate)}
                                            {milestone._count && (
                                                <span className="ml-3">
                                                    {milestone._count.tasks} tâche(s) · {milestone._count.deliverables} livrable(s)
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                                                MILESTONE_STYLE[milestone.status]
                                            }`}
                                        >
                                            {MILESTONE_LABEL[milestone.status]}
                                        </span>
                                        {canEdit && (
                                            <>
                                                <select
                                                    value={milestone.status}
                                                    onChange={(event) =>
                                                        changeStatus(milestone.id, event.target.value as MilestoneStatusKey)
                                                    }
                                                    className="rounded-lg border border-border/60 bg-background px-2 py-1.5 text-[9px] font-bold uppercase tracking-widest text-primary outline-none"
                                                >
                                                    {(Object.keys(MILESTONE_LABEL) as MilestoneStatusKey[]).map((key) => (
                                                        <option key={key} value={key}>
                                                            {MILESTONE_LABEL[key]}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => remove(milestone.id)}
                                                    aria-label={`Supprimer ${milestone.title}`}
                                                    className="text-secondary/30 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ol>
            )}

            {isPending && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/40 inline-flex items-center gap-2">
                    <Loader2 size={12} className="animate-spin" /> Synchronisation…
                </p>
            )}

            {validated > 0 && validated === items.length && (
                <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                    <CheckCircle2 size={13} /> Tous les jalons sont validés
                </p>
            )}
        </div>
    );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import {
    BadgeCheck,
    CalendarClock,
    CheckCircle2,
    Flag,
    Loader2,
    MessageSquareWarning,
    Package,
    Users,
} from "lucide-react";
import { reviewDeliverable } from "@/lib/actions/execution";
import {
    DELIVERABLE_LABEL,
    DELIVERABLE_STYLE,
    MILESTONE_LABEL,
    MILESTONE_STYLE,
    TEAM_ROLE_LABEL,
    formatDay,
    initialsOf,
    type DeliverableView,
    type MemberView,
    type MilestoneView,
} from "@/types/execution";

interface ClientExecutionProps {
    projectId: string;
    progress: number;
    tasks: { total: number; done: number };
    milestones: MilestoneView[];
    deliverables: DeliverableView[];
    members: MemberView[];
    canReview: boolean;
}

export default function ClientExecution({
    progress,
    tasks,
    milestones,
    deliverables,
    members,
    canReview,
}: ClientExecutionProps) {
    const [items, setItems] = useState<DeliverableView[]>(deliverables);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [openFeedback, setOpenFeedback] = useState<string | null>(null);
    const [feedback, setFeedback] = useState("");

    const toValidate = useMemo(() => items.filter((item) => item.status === "SUBMITTED"), [items]);
    const validatedMilestones = milestones.filter((milestone) => milestone.status === "VALIDATED").length;

    function decide(id: string, decision: "ACCEPT" | "REQUEST_CHANGES") {
        setError(null);
        if (decision === "REQUEST_CHANGES" && feedback.trim().length < 5) {
            setError("Précisez les corrections attendues (5 caractères minimum).");
            return;
        }

        startTransition(async () => {
            const result = await reviewDeliverable(id, decision, decision === "REQUEST_CHANGES" ? feedback : undefined);
            if (!result.success) {
                setError(result.error ?? "Action impossible.");
                return;
            }
            setItems((list) =>
                list.map((item) =>
                    item.id === id
                        ? {
                              ...item,
                              status: decision === "ACCEPT" ? "ACCEPTED" : "CHANGES_REQUESTED",
                              reviewedAt: new Date().toISOString(),
                              feedback: decision === "REQUEST_CHANGES" ? feedback : null,
                          }
                        : item
                )
            );
            setFeedback("");
            setOpenFeedback(null);
        });
    }

    return (
        <section className="space-y-10">
            {/* Avancement global */}
            <div className="rounded-[2rem] border border-border/60 bg-card/60 p-8">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40">
                            Avancement du projet
                        </h3>
                        <p className="mt-2 text-5xl font-bold text-primary tracking-tight leading-none">
                            {progress}
                            <span className="text-lg text-secondary/40 align-top ml-1">%</span>
                        </p>
                        <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-secondary/40">
                            {tasks.done}/{tasks.total} tâche{tasks.total > 1 ? "s" : ""} terminée{tasks.done > 1 ? "s" : ""} ·{" "}
                            {validatedMilestones}/{milestones.length} jalon{milestones.length > 1 ? "s" : ""} validé
                            {validatedMilestones > 1 ? "s" : ""}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {members.length > 0 && (
                            <div className="flex items-center -space-x-2">
                                {members.slice(0, 5).map((member) => (
                                    <span
                                        key={member.id}
                                        title={`${member.user.name ?? member.user.email} · ${
                                            TEAM_ROLE_LABEL[member.role]
                                        }`}
                                        className="w-9 h-9 rounded-full bg-background border-2 border-card text-primary flex items-center justify-center text-[9px] font-black"
                                    >
                                        {initialsOf(member.user.name, member.user.email)}
                                    </span>
                                ))}
                            </div>
                        )}
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-secondary/40">
                            <Users size={12} /> Équipe dédiée
                        </span>
                    </div>
                </div>

                <div className="mt-6 h-2 w-full rounded-full bg-secondary/10 overflow-hidden">
                    <div
                        className="h-full bg-accent rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                </div>
            </div>

            {error && (
                <p className="text-xs font-bold text-rose-600 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                    {error}
                </p>
            )}

            {/* Livrables à valider */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40">
                        Livrables à valider
                    </h3>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-secondary/40">
                        {toValidate.length} en attente
                    </span>
                </div>

                {toValidate.length === 0 ? (
                    <p className="text-xs italic text-secondary/40">
                        Aucun livrable en attente de votre décision.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {toValidate.map((item) => (
                            <article key={item.id} className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Package size={14} className="text-amber-600" />
                                    <p className="text-sm font-bold text-primary">{item.name}</p>
                                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                        {item.version}
                                    </span>
                                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-amber-500/30 text-amber-700">
                                        {DELIVERABLE_LABEL[item.status]}
                                    </span>
                                </div>
                                {item.description && (
                                    <p className="mt-2 text-[11px] text-secondary/60">{item.description}</p>
                                )}
                                <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-secondary/40">
                                    Soumis le {formatDay(item.submittedAt)}
                                </p>

                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    {item.fileUrl && (
                                        <a
                                            href={item.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[9px] font-black uppercase tracking-widest text-primary border border-border/60 rounded-xl px-3 py-2 hover:border-primary/40 transition-colors"
                                        >
                                            Consulter
                                        </a>
                                    )}
                                    {canReview ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => decide(item.id, "ACCEPT")}
                                                disabled={isPending}
                                                className="text-[9px] font-black uppercase tracking-widest text-background bg-emerald-600 rounded-xl px-3 py-2 inline-flex items-center gap-1.5 disabled:opacity-60"
                                            >
                                                <BadgeCheck size={12} /> Valider
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setOpenFeedback(openFeedback === item.id ? null : item.id)}
                                                className="text-[9px] font-black uppercase tracking-widest text-rose-600 border border-rose-500/30 rounded-xl px-3 py-2 inline-flex items-center gap-1.5 hover:bg-rose-500/5"
                                            >
                                                <MessageSquareWarning size={12} /> Demander des corrections
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-secondary/40">
                                            En attente de la décision du client
                                        </span>
                                    )}
                                    {isPending && <Loader2 size={13} className="animate-spin text-secondary/40" />}
                                </div>

                                {openFeedback === item.id && (
                                    <div className="mt-3 space-y-2">
                                        <textarea
                                            value={feedback}
                                            onChange={(event) => setFeedback(event.target.value)}
                                            rows={3}
                                            placeholder="Décrivez ce qui doit être corrigé…"
                                            className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-xs text-primary outline-none focus:border-primary resize-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => decide(item.id, "REQUEST_CHANGES")}
                                            disabled={isPending}
                                            className="text-[9px] font-black uppercase tracking-widest text-background bg-rose-600 rounded-xl px-3 py-2 disabled:opacity-60"
                                        >
                                            Envoyer la demande
                                        </button>
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>

            {/* Jalons */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40">
                    Jalons & étapes de livraison
                </h3>

                {milestones.length === 0 ? (
                    <p className="text-xs italic text-secondary/40">Les jalons seront publiés par l&apos;équipe projet.</p>
                ) : (
                    <ol className="grid gap-3 md:grid-cols-2">
                        {milestones.map((milestone) => (
                            <li
                                key={milestone.id}
                                className="rounded-2xl border border-border/60 bg-card/60 p-5 flex items-start gap-3"
                            >
                                <span className="mt-0.5 w-8 h-8 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0">
                                    {milestone.status === "VALIDATED" ? <CheckCircle2 size={14} /> : <Flag size={14} />}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-xs font-bold text-primary truncate">{milestone.title}</p>
                                        <span
                                            className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                                MILESTONE_STYLE[milestone.status]
                                            }`}
                                        >
                                            {MILESTONE_LABEL[milestone.status]}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-secondary/40 inline-flex items-center gap-1">
                                        <CalendarClock size={11} /> {formatDay(milestone.dueDate)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>
                )}
            </div>

            {/* Historique livrables */}
            {items.some((item) => item.status !== "SUBMITTED") && (
                <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40">
                        Historique des livrables
                    </h3>
                    <div className="space-y-2">
                        {items
                            .filter((item) => item.status !== "SUBMITTED")
                            .map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-xl border border-border/50 bg-card/40 px-4 py-3 flex flex-wrap items-center gap-2"
                                >
                                    <span className="text-xs font-bold text-primary">{item.name}</span>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-secondary/40">
                                        {item.version}
                                    </span>
                                    <span
                                        className={`ml-auto text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                            DELIVERABLE_STYLE[item.status]
                                        }`}
                                    >
                                        {DELIVERABLE_LABEL[item.status]}
                                    </span>
                                    {item.fileUrl && (
                                        <a
                                            href={item.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[8px] font-black uppercase tracking-widest text-primary hover:underline"
                                        >
                                            Ouvrir
                                        </a>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </section>
    );
}

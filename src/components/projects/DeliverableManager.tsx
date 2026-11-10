"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
    CheckCircle2,
    FileUp,
    Loader2,
    Package,
    Send,
    Trash2,
    X,
} from "lucide-react";
import {
    createDeliverable,
    deleteDeliverable,
    submitDeliverable,
} from "@/lib/actions/execution";
import {
    DELIVERABLE_LABEL,
    DELIVERABLE_STYLE,
    formatDay,
    type DeliverableView,
    type MilestoneView,
} from "@/types/execution";

interface DeliverableManagerProps {
    projectId: string;
    deliverables: DeliverableView[];
    milestones: MilestoneView[];
    canEdit: boolean;
    clientName: string;
}

export default function DeliverableManager({
    projectId,
    deliverables,
    milestones,
    canEdit,
    clientName,
}: DeliverableManagerProps) {
    const [items, setItems] = useState<DeliverableView[]>(deliverables);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        setItems(deliverables);
    }, [deliverables]);

    function submit(id: string) {
        setError(null);
        startTransition(async () => {
            const result = await submitDeliverable(id);
            if (!result.success) {
                setError(result.error ?? "Envoi impossible.");
                return;
            }
            setItems((list) =>
                list.map((item) =>
                    item.id === id
                        ? { ...item, status: "SUBMITTED", submittedAt: new Date().toISOString(), feedback: null }
                        : item
                )
            );
        });
    }

    function remove(id: string) {
        setError(null);
        const previous = items;
        setItems((list) => list.filter((item) => item.id !== id));
        startTransition(async () => {
            const result = await deleteDeliverable(id);
            if (!result.success) {
                setItems(previous);
                setError(result.error ?? "Suppression impossible.");
            }
        });
    }

    const pending = items.filter((item) => item.status === "SUBMITTED").length;
    const accepted = items.filter((item) => item.status === "ACCEPTED").length;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40">
                        Livrables
                    </h3>
                    <p className="text-2xl font-bold text-primary tracking-tight mt-1">
                        {accepted}/{items.length || 0} validé{accepted > 1 ? "s" : ""}
                        {pending > 0 && (
                            <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-amber-600 align-middle">
                                {pending} en attente client
                            </span>
                        )}
                    </p>
                </div>
                {canEdit && (
                    <button
                        type="button"
                        onClick={() => setShowForm((value) => !value)}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-border/60 text-primary text-[10px] font-black uppercase tracking-widest hover:border-primary/40 transition-colors"
                    >
                        <Package size={14} /> Nouveau livrable
                    </button>
                )}
            </div>

            {error && <p className="text-xs font-bold text-rose-600">{error}</p>}

            {canEdit && showForm && (
                <DeliverableForm
                    projectId={projectId}
                    milestones={milestones}
                    onCreated={(deliverable) => {
                        setItems((list) => [deliverable, ...list]);
                        setShowForm(false);
                    }}
                    onError={setError}
                />
            )}

            {items.length === 0 ? (
                <p className="text-xs italic text-secondary/40">
                    Aucun livrable publié. Ajoutez un fichier ou une version à faire valider par {clientName}.
                </p>
            ) : (
                <div className="space-y-3">
                    {items.map((item) => (
                        <article
                            key={item.id}
                            className="rounded-2xl border border-border/60 bg-card/60 p-5 flex flex-col md:flex-row md:items-center gap-4"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-bold text-primary truncate">{item.name}</p>
                                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                        {item.version}
                                    </span>
                                    <span
                                        className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                            DELIVERABLE_STYLE[item.status]
                                        }`}
                                    >
                                        {DELIVERABLE_LABEL[item.status]}
                                    </span>
                                </div>

                                {item.description && (
                                    <p className="mt-1 text-[11px] text-secondary/60 line-clamp-2">{item.description}</p>
                                )}

                                <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-secondary/40">
                                    {item.milestone ? `${item.milestone.title} · ` : ""}
                                    Créé le {formatDay(item.createdAt)}
                                    {item.submittedAt ? ` · Soumis le ${formatDay(item.submittedAt)}` : ""}
                                    {item.reviewedAt ? ` · Revu le ${formatDay(item.reviewedAt)}` : ""}
                                </p>

                                {item.feedback && (
                                    <p className="mt-2 text-[11px] text-rose-600 bg-rose-500/5 border border-rose-500/20 rounded-lg px-3 py-2">
                                        <strong className="uppercase tracking-widest text-[9px]">Retour client :</strong>{" "}
                                        {item.feedback}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {item.fileUrl && (
                                    <a
                                        href={item.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[9px] font-black uppercase tracking-widest text-primary border border-border/60 rounded-xl px-3 py-2 hover:border-primary/40 transition-colors"
                                    >
                                        Ouvrir
                                    </a>
                                )}
                                {canEdit && item.status !== "SUBMITTED" && item.status !== "ACCEPTED" && (
                                    <button
                                        type="button"
                                        onClick={() => submit(item.id)}
                                        disabled={isPending}
                                        className="text-[9px] font-black uppercase tracking-widest text-background bg-primary rounded-xl px-3 py-2 inline-flex items-center gap-1.5 disabled:opacity-60"
                                    >
                                        <Send size={11} /> Soumettre
                                    </button>
                                )}
                                {canEdit && (
                                    <button
                                        type="button"
                                        onClick={() => remove(item.id)}
                                        aria-label={`Supprimer ${item.name}`}
                                        className="text-secondary/30 hover:text-rose-500 transition-colors p-2"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

interface DeliverableFormProps {
    projectId: string;
    milestones: MilestoneView[];
    onCreated: (deliverable: DeliverableView) => void;
    onError: (message: string | null) => void;
}

function DeliverableForm({ projectId, milestones, onCreated, onError }: DeliverableFormProps) {
    const [name, setName] = useState("");
    const [version, setVersion] = useState("v1.0");
    const [description, setDescription] = useState("");
    const [milestoneId, setMilestoneId] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        if (saving) return;
        setSaving(true);
        onError(null);

        let fileUrl: string | null = null;
        if (file) {
            const body = new FormData();
            body.append("file", file);
            body.append("projectId", projectId);
            body.append("folder", "deliverables");
            const response = await fetch("/api/files/upload", { method: "POST", body });
            const payload = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
            if (!response.ok || !payload?.url) {
                setSaving(false);
                onError(payload?.error ?? "Échec de l'envoi du fichier.");
                return;
            }
            fileUrl = payload.url;
        }

        const result = await createDeliverable({
            projectId,
            name,
            version,
            description: description || null,
            milestoneId: milestoneId || null,
            fileUrl,
        });
        setSaving(false);

        if (!result.success) {
            onError(result.error ?? "Création impossible.");
            return;
        }

        onCreated({
            id: result.deliverable.id,
            name: result.deliverable.name,
            description: result.deliverable.description,
            version: result.deliverable.version,
            fileUrl: result.deliverable.fileUrl,
            status: result.deliverable.status,
            feedback: null,
            submittedAt: null,
            reviewedAt: null,
            milestoneId: result.deliverable.milestoneId,
            milestone: milestones.find((m) => m.id === result.deliverable.milestoneId)
                ? {
                      id: result.deliverable.milestoneId!,
                      title: milestones.find((m) => m.id === result.deliverable.milestoneId)!.title,
                  }
                : null,
            createdAt: result.deliverable.createdAt,
        });

        setName("");
        setDescription("");
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
    }

    return (
        <form
            onSubmit={submit}
            className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-5 space-y-3"
        >
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    minLength={3}
                    placeholder="Nom du livrable (ex. Application mobile — build 1)"
                    className="md:col-span-3 rounded-xl border border-border/60 bg-background px-4 py-3 text-xs font-bold text-primary outline-none focus:border-primary"
                />
                <input
                    value={version}
                    onChange={(event) => setVersion(event.target.value)}
                    placeholder="v1.0"
                    className="rounded-xl border border-border/60 bg-background px-3 py-3 text-[10px] font-bold text-primary outline-none focus:border-primary"
                />
                <select
                    value={milestoneId}
                    onChange={(event) => setMilestoneId(event.target.value)}
                    className="md:col-span-2 rounded-xl border border-border/60 bg-background px-3 py-3 text-[10px] font-bold text-primary outline-none focus:border-primary"
                >
                    <option value="">Sans jalon</option>
                    {milestones.map((milestone) => (
                        <option key={milestone.id} value={milestone.id}>
                            {milestone.title}
                        </option>
                    ))}
                </select>
            </div>

            <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={2}
                placeholder="Contenu du livrable, points à vérifier…"
                className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-xs text-primary outline-none focus:border-primary resize-none"
            />

            <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/60 bg-background text-[9px] font-black uppercase tracking-widest text-primary cursor-pointer hover:border-primary/40">
                    <FileUp size={13} />
                    {file ? file.name : "Joindre un fichier"}
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    />
                </label>
                {file && (
                    <button
                        type="button"
                        onClick={() => {
                            setFile(null);
                            if (inputRef.current) inputRef.current.value = "";
                        }}
                        className="text-secondary/40 hover:text-rose-500"
                        aria-label="Retirer le fichier"
                    >
                        <X size={14} />
                    </button>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    className="ml-auto rounded-xl bg-primary text-background text-[10px] font-black uppercase tracking-widest px-5 py-3 inline-flex items-center gap-2 disabled:opacity-60"
                >
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />} Enregistrer
                </button>
            </div>
        </form>
    );
}

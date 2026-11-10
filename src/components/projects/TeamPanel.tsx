"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Plus, Trash2, Users } from "lucide-react";
import { addProjectMember, removeProjectMember } from "@/lib/actions/execution";
import { TEAM_ROLE_LABEL, initialsOf, type MemberView, type TeamRoleKey, type TeamUserView } from "@/types/execution";

interface TeamPanelProps {
    projectId: string;
    members: MemberView[];
    availableUsers: TeamUserView[];
    canEdit: boolean;
    client: { name: string | null; email: string };
}

const ROLES = Object.keys(TEAM_ROLE_LABEL) as TeamRoleKey[];

export default function TeamPanel({ projectId, members, availableUsers, canEdit, client }: TeamPanelProps) {
    const [items, setItems] = useState<MemberView[]>(members);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState("");
    const [role, setRole] = useState<TeamRoleKey>("DEVELOPER");
    const [allocation, setAllocation] = useState(100);

    useEffect(() => {
        setItems(members);
    }, [members]);

    const alreadyIn = new Set(items.map((member) => member.user.id));
    const candidates = availableUsers.filter((user) => !alreadyIn.has(user.id));

    async function add(event: React.FormEvent) {
        event.preventDefault();
        if (!userId) {
            setError("Sélectionnez un collaborateur.");
            return;
        }
        setError(null);

        const result = await addProjectMember({ projectId, userId, role, allocation });
        if (!result.success) {
            setError(result.error ?? "Ajout impossible.");
            return;
        }

        const user = availableUsers.find((candidate) => candidate.id === userId);
        if (user) {
            setItems((list) => [
                ...list,
                { id: result.member.id, role, allocation, user: { ...user, email: user.email } },
            ]);
        }
        setUserId("");
    }

    function remove(memberId: string) {
        setError(null);
        const previous = items;
        setItems((list) => list.filter((member) => member.id !== memberId));
        startTransition(async () => {
            const result = await removeProjectMember(memberId);
            if (!result.success) {
                setItems(previous);
                setError(result.error ?? "Retrait impossible.");
            }
        });
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40">Équipe projet</h3>
                <p className="text-2xl font-bold text-primary tracking-tight mt-1">
                    {items.length + 1} personne{items.length > 0 ? "s" : ""} mobilisée{items.length > 0 ? "s" : ""}
                </p>
            </div>

            {error && <p className="text-xs font-bold text-rose-600">{error}</p>}

            <div className="space-y-3">
                <article className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 flex items-center gap-4">
                    <span className="w-10 h-10 rounded-xl bg-primary text-background flex items-center justify-center text-[10px] font-black">
                        {initialsOf(client.name, client.email)}
                    </span>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-primary truncate">{client.name || "Client"}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-secondary/40 truncate">
                            {client.email}
                        </p>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        Client
                    </span>
                </article>

                {items.map((member) => (
                    <article
                        key={member.id}
                        className="rounded-2xl border border-border/60 bg-card/60 p-4 flex items-center gap-4"
                    >
                        <span className="w-10 h-10 rounded-xl bg-secondary/5 border border-border/60 text-primary flex items-center justify-center text-[10px] font-black">
                            {initialsOf(member.user.name, member.user.email)}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-primary truncate">
                                {member.user.name || member.user.email}
                            </p>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-secondary/40 truncate">
                                {TEAM_ROLE_LABEL[member.role]} · {member.allocation}% d&apos;affectation
                            </p>
                        </div>
                        {canEdit && (
                            <button
                                type="button"
                                onClick={() => remove(member.id)}
                                aria-label={`Retirer ${member.user.name ?? member.user.email}`}
                                className="text-secondary/30 hover:text-rose-500 transition-colors p-2"
                            >
                                <Trash2 size={13} />
                            </button>
                        )}
                    </article>
                ))}

                {items.length === 0 && (
                    <p className="text-xs italic text-secondary/40">
                        Aucun collaborateur affecté : le projet est piloté uniquement par l&apos;administration.
                    </p>
                )}
            </div>

            {canEdit && (
                <form onSubmit={add} className="rounded-2xl border border-border/60 bg-card/40 p-4 flex flex-col md:flex-row gap-3 md:items-center">
                    <div className="flex items-center gap-2 text-secondary/40">
                        <Users size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Ajouter</span>
                    </div>
                    <select
                        value={userId}
                        onChange={(event) => setUserId(event.target.value)}
                        className="flex-1 rounded-xl border border-border/60 bg-background px-3 py-2.5 text-[10px] font-bold text-primary outline-none focus:border-primary"
                    >
                        <option value="">Choisir un collaborateur…</option>
                        {candidates.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name || user.email} ({user.role})
                            </option>
                        ))}
                    </select>
                    <select
                        value={role}
                        onChange={(event) => setRole(event.target.value as TeamRoleKey)}
                        className="rounded-xl border border-border/60 bg-background px-3 py-2.5 text-[10px] font-bold text-primary outline-none focus:border-primary"
                    >
                        {ROLES.map((key) => (
                            <option key={key} value={key}>
                                {TEAM_ROLE_LABEL[key]}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        min={0}
                        max={100}
                        value={allocation}
                        onChange={(event) => setAllocation(Number(event.target.value))}
                        className="w-20 rounded-xl border border-border/60 bg-background px-3 py-2.5 text-[10px] font-bold text-primary outline-none focus:border-primary"
                        aria-label="Pourcentage d'affectation"
                    />
                    <button
                        type="submit"
                        className="rounded-xl bg-primary text-background text-[10px] font-black uppercase tracking-widest px-4 py-2.5 inline-flex items-center justify-center gap-2"
                    >
                        {isPending ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Ajouter
                    </button>
                </form>
            )}

            {candidates.length === 0 && canEdit && items.length > 0 && (
                <p className="text-[10px] italic text-secondary/40">
                    Tous les comptes internes disponibles sont déjà affectés à ce projet.
                </p>
            )}
        </div>
    );
}

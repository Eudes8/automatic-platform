"use client";

import { useEffect, useState } from "react";
import { getClientProjects } from "@/lib/actions/projects";
import ContractBarrier from "@/components/dashboard/ContractBarrier";
import Chat from "@/components/dashboard/ChatSidebar";
import { Skeleton } from "@/components/shared/Skeleton";

export default function ChatPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = await getClientProjects();
            setProjects(data);
            if (data.length > 0) {
                setSelectedProjectId(data[0].id);
            }
            setLoading(false);
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8 h-full">
                <Skeleton className="h-20 w-1/3 rounded-[2rem]" />
                <Skeleton className="h-[calc(100vh-20rem)] w-full rounded-[2.5rem]" />
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <h1 className="text-4xl font-heading font-bold text-primary mb-4">Aucun projet actif</h1>
                <p className="text-secondary max-w-md">Commencez par lancer un projet pour ouvrir un canal de communication technique.</p>
            </div>
        );
    }

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    if (selectedProject && !selectedProject.contractSigned) {
        return (
            <ContractBarrier
                projectName={selectedProject.title}
                projectId={selectedProject.id}
                clientName={selectedProject.client?.name || "Client"}
                budget={selectedProject.budget ? `${selectedProject.budget}€` : undefined}
            />
        );
    }

    return (
        <div className="h-[calc(100vh-10rem)] flex flex-col">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-blue-500 font-bold uppercase text-[10px] tracking-[0.3em] inline-block py-1.5 px-4 bg-blue-500/10 rounded-full border border-blue-500/10 animate-pulse">Session Sécurisée</span>
                        <span className="text-secondary/40 font-bold text-[10px] uppercase tracking-widest">/ Chiffrement E2E</span>
                    </div>
                    <h1 className="text-5xl font-heading font-bold text-primary tracking-tight">Salon de <span className="text-blue-500">Pilotage.</span></h1>
                </div>

                {projects.length > 1 && (
                    <div className="flex gap-2 bg-card/50 p-1.5 rounded-2xl border border-border">
                        {projects.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedProjectId(p.id)}
                                className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${selectedProjectId === p.id
                                        ? "bg-primary text-background shadow-lg shadow-primary/10"
                                        : "text-secondary hover:bg-primary/5"
                                    }`}
                            >
                                {p.title.split(' - ')[0]}
                            </button>
                        ))}
                    </div>
                )}
            </header>

            <div className="flex-1 min-h-0">
                <Chat projectId={selectedProjectId || undefined} />
            </div>
        </div>
    );
}

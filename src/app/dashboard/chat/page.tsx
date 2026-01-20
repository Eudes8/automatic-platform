"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
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
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-12 bg-card/30 border border-border/50 rounded-[3rem] shadow-2xl">
                <div className="w-24 h-24 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-center justify-center mb-8 shadow-inner">
                    <MessageSquare size={48} className="text-secondary/20" />
                </div>
                <h1 className="text-5xl font-heading font-black text-primary mb-6 italic uppercase tracking-tighter">Aucun canal_actif.</h1>
                <p className="text-secondary/40 max-w-md font-black uppercase text-[10px] tracking-[0.4em] italic leading-relaxed">// Initialiser_Protocole_Projet pour ouvrir un canal de communication technique.</p>
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
        <div className="h-[calc(100vh-12rem)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-accent font-black uppercase text-[10px] tracking-[0.5em] inline-block py-2 px-6 bg-accent/5 rounded-full border border-accent/10 animate-pulse italic shadow-inner">// Session_Sécurisée.Active</span>
                        <span className="text-secondary/20 font-black text-[10px] uppercase tracking-[0.3em] italic">/ CHIFFREMENT_E2E_ACTIF</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-heading font-black text-primary tracking-tighter uppercase italic leading-[0.8]">
                        Salon de <br /><span className="text-secondary/20 tracking-[-0.05em]">Pilotage.</span>
                    </h1>
                </div>

                {projects.length > 1 && (
                    <div className="flex gap-3 bg-secondary/5 p-2 rounded-[2rem] border border-border/50 shadow-inner">
                        {projects.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedProjectId(p.id)}
                                className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all italic ${selectedProjectId === p.id
                                    ? "bg-primary text-background shadow-xl shadow-primary/20"
                                    : "text-secondary/40 hover:text-primary hover:bg-primary/5"
                                    }`}
                            >
                                {p.title.split(' - ')[0]}
                            </button>
                        ))}
                    </div>
                )}
            </header>

            <div className="flex-1 min-h-0 bg-card/30 border border-border/50 rounded-[3rem] shadow-2xl relative overflow-hidden p-1">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/2 rounded-full blur-[100px] -mr-64 -mt-64 pointer-events-none" />
                <Chat projectId={selectedProjectId || undefined} />
            </div>
        </div>
    );
}

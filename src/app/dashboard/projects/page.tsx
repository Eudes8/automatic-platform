"use client";

import { getClientProjects } from "@/lib/actions/projects";
import Link from "next/link";
import { Lock, FileSignature, ChevronRight, Terminal } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ProjectsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getClientProjects().then(data => {
            setProjects(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-secondary/40 font-black uppercase tracking-[0.4em] text-xs italic">// Synchronisation_Nexus...</p>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
                <div className="p-8 rounded-full bg-primary/5 border border-primary/10">
                    <Terminal className="w-12 h-12 text-primary/20" />
                </div>
                <p className="text-secondary/40 font-black uppercase tracking-[0.4em] text-xs italic">// Aucun_Signal_Actif</p>
                <Link href="/onboarding" className="group relative px-10 py-4 bg-primary text-background rounded-full text-xs font-black uppercase tracking-[0.3em] overflow-hidden hover:scale-105 transition-all">
                    <span className="relative z-10">INITIALISER_PROTOCOLE</span>
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header>
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-10 h-[1px] bg-accent" />
                    <span className="text-accent font-black tracking-[0.4em] uppercase text-[10px] italic">OPÉRATIONS_MAINFRAME</span>
                </div>
                <h1 className="text-6xl font-black text-primary tracking-tighter uppercase italic leading-none">Actifs <br /><span className="text-secondary/20">Numériques.</span></h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {projects.map((project) => (
                    <Link
                        key={project.id}
                        href={`/dashboard/projects/${project.id}`}
                        className="p-10 rounded-[3rem] bg-card/30 border border-border/50 relative overflow-hidden group hover:border-primary/30 transition-all flex flex-col shadow-2xl hover:shadow-primary/5"
                    >
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none group-hover:bg-primary/10 transition-all" />

                        <div className="flex justify-between items-start mb-12 relative z-10">
                            <span className={`px-4 py-1.5 border text-[9px] font-black uppercase tracking-[0.2em] rounded-full italic ${project.contractSigned
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                                : "bg-accent/10 border-accent/20 text-accent"
                                }`}>
                                {project.contractSigned ? `STATUS: ${project.status}` : "ATTENTE_SIGNATURE_LÉGALE"}
                            </span>
                            {!project.contractSigned && <Lock className="w-4 h-4 text-accent animate-pulse" />}
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-3xl font-black text-primary mb-4 group-hover:text-primary/80 transition-colors uppercase italic tracking-tighter truncate">{project.title}</h3>
                            <p className="text-secondary/60 text-sm mb-12 font-medium leading-relaxed italic line-clamp-2 h-10">{project.description || "Aucune description technique enregistrée pour ce domaine."}</p>
                        </div>

                        <div className="space-y-4 mb-12 relative z-10">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em] mb-2 italic">
                                <span className="text-secondary/30">Niveau_Déploiement</span>
                                <span className="text-primary">{project.progress}%</span>
                            </div>
                            <div className="h-1 bg-secondary/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${project.progress}%` }}
                                    transition={{ duration: 1.5, ease: "circOut" }}
                                    className="h-full bg-primary shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                                />
                            </div>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-10 border-t border-border/20 relative z-10">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-secondary/20 uppercase tracking-[0.4em] italic">Désignation_Hex</span>
                                <span className="text-xs font-black text-primary uppercase italic tracking-widest">{project.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[9px] font-black text-secondary/40 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 italic">Accéder_Console</span>
                                <div className="w-14 h-14 rounded-2xl bg-background border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:text-background group-hover:border-primary transition-all shadow-inner">
                                    {project.contractSigned ? <ChevronRight className="w-6 h-6" /> : <FileSignature className="w-5 h-5 animate-bounce" />}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

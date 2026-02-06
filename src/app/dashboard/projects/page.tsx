"use client";

import { getClientProjects } from "@/lib/actions/projects";
import Link from "next/link";
import { Lock, FileSignature, ChevronRight, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Project } from "@prisma/client";

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getClientProjects().then(data => {
            setProjects(data as Project[]);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-secondary/40 font-bold uppercase tracking-widest text-xs">Chargement en cours...</p>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
                <div className="p-8 rounded-full bg-primary/5 border border-primary/10">
                    <Target className="w-12 h-12 text-primary/20" />
                </div>
                <p className="text-secondary/40 font-bold uppercase tracking-widest text-xs">Aucun projet pour le moment</p>
                <Link href="/onboarding" className="group relative px-10 py-4 bg-primary text-background rounded-full text-xs font-bold uppercase tracking-widest overflow-hidden hover:scale-105 transition-all">
                    <span className="relative z-10">Démarrer un projet</span>
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 sm:space-y-12 md:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header>
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <span className="w-8 sm:w-10 h-[1px] bg-accent" />
                    <span className="text-accent font-bold tracking-widest uppercase text-[9px] sm:text-[10px]">Mes Projets</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary tracking-tight uppercase leading-none">Projets <br /><span className="text-secondary/20">Immobiliers.</span></h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {projects.map((project) => (
                    <Link
                        key={project.id}
                        href={`/dashboard/projects/${project.id}`}
                        className="p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] bg-card/30 border border-border/50 relative overflow-hidden group hover:border-primary/30 transition-all flex flex-col shadow-2xl hover:shadow-primary/5"
                    >
                        <div className="absolute top-0 right-0 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-primary/5 rounded-full blur-[80px] sm:blur-[100px] -mr-32 sm:-mr-48 -mt-32 sm:-mt-48 pointer-events-none group-hover:bg-primary/10 transition-all" />

                        <div className="flex justify-between items-start mb-8 sm:mb-12 relative z-10">
                            <span className={`px-3 sm:px-4 py-1 sm:py-1.5 border text-[8px] sm:text-[9px] font-bold uppercase tracking-widest rounded-full ${project.contractSigned
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                                : "bg-accent/10 border-accent/20 text-accent"
                                }`}>
                                {project.contractSigned ? `${project.status}` : "SIGNATURE REQUISE"}
                            </span>
                            {!project.contractSigned && <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent animate-pulse" />}
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-2xl sm:text-3xl font-bold text-primary mb-3 sm:mb-4 group-hover:text-primary/80 transition-colors uppercase tracking-tight truncate leading-tight">{project.title}</h3>
                            <p className="text-secondary/60 text-[11px] sm:text-sm mb-8 sm:mb-12 font-medium leading-relaxed line-clamp-2 h-auto sm:h-10">{project.description || "Aucune description disponible pour ce projet."}</p>
                        </div>

                        <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-12 relative z-10">
                            <div className="flex justify-between text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1.5 sm:mb-2">
                                <span className="text-secondary/30">Progression</span>
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

                        <div className="mt-auto flex items-center justify-between pt-6 sm:pt-10 border-t border-border/20 relative z-10">
                            <div className="flex flex-col">
                                <span className="text-[8px] sm:text-[9px] font-bold text-secondary/20 uppercase tracking-widest">ID</span>
                                <span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest">{project.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4">
                                <span className="text-[8px] sm:text-[9px] font-bold text-secondary/40 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 hidden sm:inline">Accéder au projet</span>
                                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-background border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:text-background group-hover:border-primary transition-all shadow-inner">
                                    {project.contractSigned ? <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" /> : <FileSignature className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

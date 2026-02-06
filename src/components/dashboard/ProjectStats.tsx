"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Rocket, ShieldCheck, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { Project } from "@prisma/client";

const PHASES = [
    { id: "ONBOARDING", label: "CADRAGE" },
    { id: "ANALYSIS", label: "ANALYSE" },
    { id: "DESIGN", label: "DESIGN" },
    { id: "DEV", label: "DÉVELOPPEMENT" },
    { id: "QA", label: "TESTS" },
    { id: "DEPLOYMENT", label: "DÉPLOIEMENT" },
    { id: "DONE", label: "TERMINÉ" },
];

export default function ProjectStats({ project }: { project: Project }) {
    const progress = project.progress || 0;
    const currentStatus = project.status || "ONBOARDING";

    const currentStatusIndex = PHASES.findIndex(p => p.id === currentStatus);
    const activePhaseLabel = PHASES[currentStatusIndex]?.label || "EN_COURS";

    const updatedPhases = PHASES.map((p, idx) => ({
        ...p,
        status: idx < currentStatusIndex ? "completed" : idx === currentStatusIndex ? "active" : "pending"
    }));

    const startDate = new Date(project.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const updatedAt = new Date(project.updatedAt);
    const timeSinceUpdate = Math.floor((today.getTime() - updatedAt.getTime()) / 60000);
    let updateLabel = "À l'instant";
    if (timeSinceUpdate > 0) {
        if (timeSinceUpdate < 60) updateLabel = `Il y a ${timeSinceUpdate} min`;
        else if (timeSinceUpdate < 1440) updateLabel = `Il y a ${Math.floor(timeSinceUpdate / 60)}h`;
        else updateLabel = `Il y a ${Math.floor(timeSinceUpdate / 1440)}j`;
    }

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
            <div className="bg-card/30 border border-border/50 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 md:p-14 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/5 rounded-full blur-[60px] sm:blur-[100px] -mr-32 sm:-mr-64 -mt-32 sm:-mt-64 pointer-events-none" />

                <div className="flex flex-col md:flex-row justify-between items-end gap-6 sm:gap-12 relative z-10">
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <span className="text-secondary/40 font-bold uppercase tracking-widest text-[8px] sm:text-[10px]">Statut du projet</span>
                        </div>

                        <h2 className="text-4xl sm:text-6xl md:text-8xl font-black text-primary mt-1 sm:mt-2 mb-8 sm:mb-14 tracking-tighter uppercase italic leading-[0.8]">
                            Phase <br /> <span className="text-secondary/20">{activePhaseLabel}.</span>
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-6">
                            {updatedPhases.map((phase, idx) => (
                                <div key={phase.id} className="space-y-2 sm:space-y-3">
                                    <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest block italic truncate ${phase.status === "completed" ? "text-primary" : phase.status === "active" ? "text-accent" : "text-secondary/20"
                                        }`}>
                                        {phase.label}
                                    </span>
                                    <div className="h-1 w-full rounded-full bg-secondary/5 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: phase.status === "completed" ? "100%" : phase.status === "active" ? "65%" : "0%" }}
                                            transition={{ duration: 1, delay: idx * 0.1 }}
                                            className={`h-full ${phase.status === "completed" ? "bg-primary" : "bg-accent shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                                                }`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end w-full md:w-auto">
                        <div className="relative mb-4 sm:mb-6">
                            <svg className="w-32 h-32 sm:w-40 sm:h-40 transform -rotate-90">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-secondary/5"
                                />
                                <motion.circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={351.86}
                                    initial={{ strokeDashoffset: 351.86 }}
                                    animate={{ strokeDashoffset: 351.86 * (1 - (progress / 100)) }}
                                    transition={{ duration: 2, ease: "circOut" }}
                                    className="text-primary"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl sm:text-4xl font-bold text-primary leading-none">{progress}%</span>
                                <span className="text-[8px] sm:text-[9px] font-bold text-secondary/30 uppercase tracking-widest mt-1 sm:mt-2">Progression</span>
                            </div>
                        </div>
                        <p className="text-secondary/20 font-bold uppercase text-[8px] sm:text-[9px] tracking-widest">Mise à jour : {updateLabel}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
                <div className="p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-card/30 border border-border/50 flex items-center gap-4 sm:gap-6 shadow-xl group hover:border-primary/20 transition-all">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform"><Clock className="w-5 h-5 sm:w-7 sm:h-7" /></div>
                    <div>
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase text-secondary/40 tracking-widest mb-1">Temps écoulé</p>
                        <p className="text-2xl sm:text-3xl font-bold text-primary tracking-tight uppercase leading-none">{diffDays} Jour{diffDays > 1 ? 's' : ''}</p>
                    </div>
                </div>
                <div className="p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-card/30 border border-border/50 flex items-center gap-4 sm:gap-6 shadow-xl group hover:border-primary/20 transition-all">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-emerald-500/5 flex items-center justify-center text-emerald-600 shadow-inner group-hover:scale-110 transition-transform"><CheckCircle2 className="w-5 h-5 sm:w-7 sm:h-7" /></div>
                    <div>
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase text-secondary/40 tracking-widest mb-1">Progression</p>
                        <p className="text-2xl sm:text-3xl font-bold text-primary tracking-tight uppercase leading-none">{progress}%</p>
                    </div>
                </div>
                <div className="p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-card/30 border border-border/50 flex items-center gap-4 sm:gap-6 shadow-xl group hover:border-primary/20 transition-all">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-accent/5 flex items-center justify-center text-accent shadow-inner group-hover:scale-110 transition-transform"><ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7" /></div>
                    <div>
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase text-secondary/40 tracking-widest mb-1">Étape actuelle</p>
                        <p className="text-2xl sm:text-3xl font-bold text-primary tracking-tight uppercase leading-none">{activePhaseLabel}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

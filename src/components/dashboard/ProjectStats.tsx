"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Rocket, ShieldCheck } from "lucide-react";

const PHASES = [
    { id: "ONBOARDING", label: "Cadrage" },
    { id: "ANALYSIS", label: "Analyse" },
    { id: "DESIGN", label: "Design" },
    { id: "DEV", label: "Développement" },
    { id: "QA", label: "Tests" },
    { id: "DEPLOYMENT", label: "Déploiement" },
    { id: "DONE", label: "Livré" },
];

export default function ProjectStats({ project }: { project: any }) {
    const progress = project.progress || 0;
    const currentStatus = project.status || "ONBOARDING";

    const currentStatusIndex = PHASES.findIndex(p => p.id === currentStatus);
    const activePhaseLabel = PHASES[currentStatusIndex]?.label || "En cours";

    const updatedPhases = PHASES.map((p, idx) => ({
        ...p,
        status: idx < currentStatusIndex ? "completed" : idx === currentStatusIndex ? "active" : "pending"
    }));

    // Calculate days since project start
    const startDate = new Date(project.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    // Calculate relative time for update
    const updatedAt = new Date(project.updatedAt);
    const timeSinceUpdate = Math.floor((today.getTime() - updatedAt.getTime()) / 60000); // minutes
    let updateLabel = "À l'instant";
    if (timeSinceUpdate > 0) {
        if (timeSinceUpdate < 60) updateLabel = `Il y a ${timeSinceUpdate} min`;
        else if (timeSinceUpdate < 1440) updateLabel = `Il y a ${Math.floor(timeSinceUpdate / 60)}h`;
        else updateLabel = `Il y a ${Math.floor(timeSinceUpdate / 1440)}j`;
    }

    return (
        <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />

                <div className="flex flex-col md:flex-row justify-between items-end gap-10 relative z-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-blue-500 font-bold uppercase tracking-[0.2em] text-xs">Statut du projet</span>
                            <span className={`px-3 py-1 bg-opacity-10 border border-opacity-20 text-[10px] font-black uppercase rounded-full ${progress === 100 ? "bg-green-500 border-green-500 text-green-500" : "bg-blue-500 border-blue-500 text-blue-500"
                                }`}>
                                {progress === 100 ? "Terminé" : "Actif"}
                            </span>
                        </div>
                        <h2 className="text-5xl font-black text-white mt-2 mb-10 tracking-tighter uppercase italic leading-none">
                            Phase <br /> <span className="text-blue-500">{activePhaseLabel}</span>
                        </h2>

                        <div className="flex flex-wrap gap-4">
                            {updatedPhases.map((phase, idx) => (
                                <div key={phase.id} className="flex items-center gap-3">
                                    <div className="flex flex-col gap-2 italic">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${phase.status === "completed" ? "text-blue-400" : phase.status === "active" ? "text-orange-500" : "text-slate-600"
                                            }`}>
                                            {phase.label}
                                        </span>
                                        <div className={`h-1.5 w-24 rounded-full overflow-hidden bg-slate-800`}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: phase.status === "completed" ? "100%" : phase.status === "active" ? "65%" : "0%" }}
                                                transition={{ duration: 1, delay: idx * 0.2 }}
                                                className={`h-full ${phase.status === "completed" ? "bg-blue-500" : "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                    {idx < PHASES.length - 1 && <Circle className="w-1.5 h-1.5 text-slate-800 fill-slate-800" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                        <div className="relative mb-4">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="58"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-slate-800"
                                />
                                <motion.circle
                                    cx="64"
                                    cy="64"
                                    r="58"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={364.4}
                                    initial={{ strokeDashoffset: 364.4 }}
                                    animate={{ strokeDashoffset: 364.4 * (1 - (progress / 100)) }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="text-blue-500"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-white leading-none">{progress}%</span>
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total</span>
                            </div>
                        </div>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest italic">Mise à jour : {updateLabel}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-blue-600/5 border border-blue-500/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500"><Clock className="w-6 h-6" /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Temps écoulé</p>
                        <p className="text-xl font-bold text-white tracking-tight">{diffDays} Jour{diffDays > 1 ? 's' : ''}</p>
                    </div>
                </div>
                <div className="p-6 rounded-3xl bg-orange-600/5 border border-orange-500/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500"><CheckCircle2 className="w-6 h-6" /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Progression</p>
                        <p className="text-xl font-bold text-white tracking-tight">{progress}% Complétés</p>
                    </div>
                </div>
                <div className="p-6 rounded-3xl bg-purple-600/5 border border-purple-500/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500"><ShieldCheck className="w-6 h-6" /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-purple-500 tracking-widest">Status Flux</p>
                        <p className="text-xl font-bold text-white tracking-tight">{activePhaseLabel}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

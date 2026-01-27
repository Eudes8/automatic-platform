"use client";

import { motion } from "framer-motion";
import { LucideIcon, Zap, CheckCircle2, Circle, Clock, Rocket, ShieldCheck, Code2, Database } from "lucide-react";

interface Step {
    id: string;
    label: string;
    description: string;
    icon: LucideIcon;
    status: 'completed' | 'current' | 'upcoming';
}

export default function DeploymentTimeline({ progress }: { progress: number }) {
    const steps: Step[] = [
        {
            id: 'vision',
            label: 'Vision & Concept',
            description: 'Alignement des objectifs et architecture initiale.',
            icon: Rocket,
            status: progress > 20 ? 'completed' : progress <= 20 ? 'current' : 'upcoming'
        },
        {
            id: 'fusion',
            label: 'Fusion Backend',
            description: 'Déploiement du Core Web Engine et bases de données.',
            icon: Database,
            status: progress > 40 ? 'completed' : (progress > 20 && progress <= 40) ? 'current' : 'upcoming'
        },
        {
            id: 'engineering',
            label: 'Ingénierie UI',
            description: 'Implémentation des protocoles SecOps et interface.',
            icon: Code2,
            status: progress > 70 ? 'completed' : (progress > 40 && progress <= 70) ? 'current' : 'upcoming'
        },
        {
            id: 'deployment',
            label: 'Mainframe Live',
            description: 'Tests de charge, audit Sec et mise en production.',
            icon: ShieldCheck,
            status: progress >= 100 ? 'completed' : (progress > 70 && progress < 100) ? 'current' : 'upcoming'
        }
    ];

    return (
        <div className="p-10 bg-card/30 border border-border/50 rounded-[3rem] relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/2 rounded-full blur-[80px] pointer-events-none" />

            <header className="flex justify-between items-center mb-12">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary italic mb-1 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-accent animate-pulse" /> Timeline_De_Déploiement
                    </h3>
                    <p className="text-[10px] text-secondary/40 font-black uppercase tracking-widest italic opacity-60">// Status_Interne: Opérationnel</p>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-black text-primary italic tracking-tighter leading-none">{progress}%</span>
                    <p className="text-[9px] text-secondary/20 font-black uppercase tracking-widest italic">Global_Sync</p>
                </div>
            </header>

            <div className="relative space-y-12">
                {/* Vertical Line */}
                <div className="absolute left-[23px] top-2 bottom-2 w-px bg-white/5" />

                {steps.map((step, i) => (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative flex items-start gap-8 group"
                    >
                        {/* Dot */}
                        <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 ${step.status === 'completed'
                            ? "bg-primary border-primary text-background shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            : step.status === 'current'
                                ? "bg-primary/10 border-primary text-primary animate-pulse"
                                : "bg-card border-border text-secondary/40"
                            }`}>
                            {step.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}

                            {/* Connector for completed steps */}
                            {step.status === 'completed' && i < steps.length - 1 && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-12 bg-primary/30" />
                            )}
                        </div>

                        <div className="flex-grow pt-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h4 className={`text-base font-black uppercase tracking-widest italic transition-colors ${step.status === 'upcoming' ? "text-secondary/40" : "text-primary"
                                    }`}>
                                    {step.label}
                                </h4>
                                {step.status === 'current' && (
                                    <span className="text-[8px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-black animate-pulse">EXECUTING...</span>
                                )}
                            </div>
                            <p className={`text-[11px] leading-relaxed font-medium transition-colors ${step.status === 'upcoming' ? "text-secondary/20" : "text-secondary"
                                }`}>
                                {step.description}
                            </p>
                        </div>

                        {step.status === 'completed' && (
                            <Clock className="w-4 h-4 text-green-500 opacity-40 absolute right-0 top-2" />
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 flex items-center gap-4">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                <p className="text-[9px] text-secondary font-bold uppercase tracking-[0.2em] italic">
                    Accès_Sécurisé: Les ressources techniques sont isolées par phase.
                </p>
            </div>
        </div>
    );
}

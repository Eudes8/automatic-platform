"use client";

import { PenTool, MessageSquare } from "lucide-react";

const FEATURES = [
    {
        title: "Vault_Contracts",
        desc: "Signature cryptographique et archivage légal de tous vos accords de service.",
        icon: PenTool,
        tag: "LEGAL_SAFE"
    },
    {
        title: "Direct_Link",
        desc: "Communication chiffrée de bout en bout avec vos ingénieurs dédiés.",
        icon: MessageSquare,
        tag: "ELITE_SUPPORT"
    }
];

export default function ControlCenter() {
    return (
        <section className="py-40 bg-card/30 relative">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-8">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-[1px] bg-accent" />
                            <h2 className="text-accent font-black tracking-[0.4em] uppercase text-[10px] italic">Système_Nexus</h2>
                        </div>
                        <p className="text-5xl md:text-7xl font-black text-primary tracking-tighter leading-[0.85] uppercase italic">
                            Un Pilotage <br /><span className="text-secondary/20">en Temps Réel.</span>
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Main Feature: Dashboard Preview */}
                    <div className="lg:col-span-8 p-12 rounded-[2.5rem] bg-background border border-border/50 relative overflow-hidden flex flex-col justify-end min-h-[600px] shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

                        {/* Mock UI Elements */}
                        <div className="absolute top-20 right-10 left-10 bottom-10 bg-card rounded-2xl border border-border/50 shadow-inner group-hover:scale-[1.02] transition-transform duration-700 opacity-40">
                            <div className="p-6 border-b border-border/50 flex items-center justify-between">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/20" />
                                </div>
                                <div className="text-[10px] font-mono opacity-20 italic">AUTOMATIC_COMMAND_CENTER_V2</div>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <div className="px-4 py-1 bg-accent/10 border border-accent/20 rounded-full w-fit mb-6">
                                <span className="text-[9px] font-black text-accent uppercase tracking-widest italic">Live_Interface</span>
                            </div>
                            <h4 className="text-4xl font-black text-primary mb-6 leading-none uppercase italic tracking-tighter">Nexus_Control Dashboard</h4>
                            <p className="text-secondary/70 max-w-sm mb-0 font-medium">Faites l'expérience d'une transparence totale. Suivez chaque ligne de code, chaque jalon et chaque sprint en temps réel depuis votre portail dédié.</p>
                        </div>
                    </div>

                    {/* Side Features */}
                    <div className="lg:col-span-4 flex flex-col gap-8">
                        {FEATURES.map((item, i) => (
                            <div key={i} className="flex-grow p-12 rounded-[2.5rem] bg-card border border-border/50 hover:border-primary/20 transition-all group">
                                <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-background transition-colors">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div className="text-[9px] font-black text-accent uppercase tracking-[0.2em] mb-4 italic">// {item.tag}</div>
                                <h4 className="text-2xl font-black text-primary mb-4 uppercase italic tracking-tight">{item.title}</h4>
                                <p className="text-secondary/60 text-sm font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

"use client";

import { Cpu, Globe, Zap, ArrowRight } from "lucide-react";

const SERVICES = [
    {
        title: "Fusion_Backend",
        desc: "Infrastructures distribuées ultra-rapides sur Next.js 15 & Edge Computing. Latence minimale, sécurité maximale.",
        icon: Globe,
        id: "01",
        tag: "INFRA_SCALABLE"
    },
    {
        title: "Matrix_Interface",
        desc: "Design system atomique et interfaces fluides. Expérience utilisateur chirurgicale axée sur la conversion.",
        icon: Cpu,
        id: "02",
        tag: "UI_PERFORMANCE"
    },
    {
        title: "Logic_Automata",
        desc: "Intégration d'IA générative et agents autonomes pour l'automatisation totale de vos flux métiers.",
        icon: Zap,
        id: "03",
        tag: "AI_SOLUTIONS"
    }
];

export default function Services() {
    return (
        <section id="services" className="py-40 relative overflow-hidden">
            {/* Background element */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/[0.02] -skew-x-12 transform origin-top translate-x-1/2" />

            <div className="container mx-auto px-6">
                <div className="max-w-3xl mb-32">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="w-10 h-[1px] bg-accent" />
                        <h2 className="text-accent font-black tracking-[0.4em] uppercase text-[10px] italic">Protocoles_Opérationnels</h2>
                    </div>
                    <p className="text-5xl md:text-7xl font-black text-primary leading-[0.85] tracking-tighter uppercase italic">
                        L'Ingénierie <br />
                        <span className="text-secondary/20">Sans Compromis.</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {SERVICES.map((s, i) => (
                        <div
                            key={i}
                            className="group p-12 rounded-3xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-500 relative flex flex-col h-full shadow-sm hover:shadow-2xl hover:shadow-primary/5"
                        >
                            <div className="flex justify-between items-start mb-12">
                                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-background transition-colors">
                                    <s.icon className="w-6 h-6" />
                                </div>
                                <span className="text-3xl font-black text-primary/5 italic group-hover:text-primary/10 transition-colors uppercase leading-none">{s.id}</span>
                            </div>

                            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-accent mb-4">
                // {s.tag}
                            </div>
                            <h3 className="text-2xl font-black text-primary mb-5 uppercase italic tracking-tight">{s.title}</h3>
                            <p className="text-secondary/70 text-sm leading-relaxed mb-10 flex-grow font-medium">
                                {s.desc}
                            </p>

                            <div className="flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.25em] pt-6 border-t border-border/50 opacity-40 group-hover:opacity-100 transition-opacity italic">
                                Exécuter le protocole <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

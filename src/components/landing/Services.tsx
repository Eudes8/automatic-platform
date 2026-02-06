"use client";

import { Feather, Zap, Smile, ArrowRight } from "lucide-react";

const SERVICES = [
    {
        title: "Ultra Rapide",
        desc: "Nous utilisons les technologies les plus modernes pour que votre projet charge instantanément.",
        icon: Zap,
        id: "01",
    },
    {
        title: "Design Élégant",
        desc: "Un design simple, beau et facile à utiliser pour vos utilisateurs sur tous les appareils.",
        icon: Feather,
        id: "02",
    },
    {
        title: "Support Dédié",
        desc: "Nous restons avec vous après le lancement pour s'assurer que tout fonctionne parfaitement.",
        icon: Smile,
        id: "03",
    }
];

export default function Services() {
    return (
        <section id="services" className="py-20 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="max-w-3xl mb-16 mx-auto text-center">
                    <span className="text-primary/60 font-medium tracking-wider uppercase text-sm">Nos Engagements</span>
                    <h2 className="text-3xl sm:text-5xl font-black text-primary mt-2 mb-6">
                        Tout ce dont vous avez besoin.
                    </h2>
                    <p className="text-lg text-secondary/80 max-w-2xl mx-auto">
                        Nous simplifions la complexité pour vous offrir le meilleur de la technologie, sans les maux de tête.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {SERVICES.map((s, i) => (
                        <div
                            key={i}
                            className="group p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 relative flex flex-col items-center text-center shadow-sm hover:shadow-xl hover:shadow-primary/5 h-full"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                                <s.icon className="w-8 h-8" />
                            </div>

                            <h3 className="text-xl font-bold text-primary mb-3">{s.title}</h3>
                            <p className="text-secondary/70 leading-relaxed mb-6">
                                {s.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

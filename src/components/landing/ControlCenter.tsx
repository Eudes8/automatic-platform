"use client";

import { CheckCircle, MessageSquare, Clock } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ControlCenter() {
    return (
        <section className="py-20 bg-card/30">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row items-center gap-12 sm:gap-16">
                    <div className="w-full md:w-1/2">
                        <div className="bg-background border border-border/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                            {/* Simple Mockup */}
                            <div className="w-full bg-card rounded-2xl border border-border/50 aspect-video flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                                    <Clock className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Projet en cours</h3>
                                <p className="text-sm text-secondary/60">Lancement prévu dans 12 jours</p>
                                <div className="w-full max-w-[200px] h-2 bg-secondary/10 rounded-full mt-6 overflow-hidden">
                                    <div className="w-[70%] h-full bg-primary rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-1/2">
                        <span className="text-primary/60 font-medium tracking-wider uppercase text-sm">Contrôle Total</span>
                        <h2 className="text-3xl sm:text-5xl font-black text-primary mt-2 mb-6">
                            Suivez votre projet en temps réel.
                        </h2>
                        <p className="text-lg text-secondary/80 mb-8 leading-relaxed">
                            Plus besoin de deviner où en est votre projet. Accédez à votre espace client pour suivre l'avancement, discuter avec l'équipe et valider les étapes.
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="min-w-12 w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold mb-1">Validation Simple</h4>
                                    <p className="text-secondary/70 text-sm">Validez chaque étape du projet en un clic.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="min-w-12 w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold mb-1">Discussion Directe</h4>
                                    <p className="text-secondary/70 text-sm">Discutez directement avec vos développeurs.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10">
                            <Link href="/dashboard" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
                                Accéder à mon espace <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

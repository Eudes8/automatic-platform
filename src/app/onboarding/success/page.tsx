"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Mail, ArrowRight, Zap, Target, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function OnboardingSuccess() {
    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans">
            {/* Background elements */}
            <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-3xl glass-premium border border-primary/20 rounded-[4rem] p-16 md:p-24 relative z-10 shadow-2xl shadow-primary/10 overflow-hidden"
            >
                {/* Internal decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600" />

                <div className="w-24 h-24 bg-primary/10 border border-primary/20 rounded-[2rem] flex items-center justify-center mx-auto mb-12 rotate-6 hover:rotate-0 transition-transform duration-500">
                    <CheckCircle2 className="w-12 h-12 text-primary" />
                </div>

                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40 mb-4 italic">Confirmation_Système</h2>
                <h1 className="text-6xl md:text-7xl font-heading font-black text-primary uppercase tracking-tighter leading-tight mb-8 italic">
                    Projet <span className="text-blue-500 leading-none">Amorcé.</span>
                </h1>

                <p className="text-xl text-secondary font-medium mb-16 max-w-xl mx-auto leading-relaxed">
                    Votre vision est désormais encodée dans notre système. La phase d'analyse critique a été lancée.
                </p>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="p-8 bg-card border border-border rounded-3xl text-left hover:border-primary/30 transition-colors group">
                        <Mail className="w-6 h-6 text-primary mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="font-heading font-bold text-primary mb-2 uppercase text-xs tracking-widest">Estimation</h3>
                        <p className="text-secondary/60 text-[11px] leading-relaxed font-medium">Votre devis technique personnalisé a été envoyé.</p>
                    </div>
                    <div className="p-8 bg-card border border-border rounded-3xl text-left hover:border-primary/30 transition-colors group">
                        <Zap className="w-6 h-6 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="font-heading font-bold text-primary mb-2 uppercase text-xs tracking-widest">Activation</h3>
                        <p className="text-secondary/60 text-[11px] leading-relaxed font-medium">Lien magique prêt pour votre authentification unique.</p>
                    </div>
                    <div className="p-8 bg-card border border-border rounded-3xl text-left hover:border-primary/30 transition-colors group">
                        <ShieldCheck className="w-6 h-6 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="font-heading font-bold text-primary mb-2 uppercase text-xs tracking-widest">Sécruité</h3>
                        <p className="text-secondary/60 text-[11px] leading-relaxed font-medium">Siège virtuel protégé par protocole TLS 1.3.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                    <Link
                        href="/login"
                        className="w-full md:w-auto px-12 py-5 bg-primary text-background rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-primary/20"
                    >
                        Accéder à la console
                    </Link>
                    <Link
                        href="/"
                        className="group inline-flex items-center gap-3 text-secondary/40 font-black hover:text-primary transition-all uppercase tracking-[0.2em] text-[10px]"
                    >
                        Retour_Accueil <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}

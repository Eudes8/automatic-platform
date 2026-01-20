"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
    return (
        <section className="py-60 px-6 relative overflow-hidden">
            <div className="container mx-auto max-w-6xl">
                <div className="relative rounded-[4rem] bg-primary p-16 md:p-32 overflow-hidden text-center shadow-2xl shadow-primary/20">
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
                    <div className="absolute top-10 left-10 text-[10px] font-mono text-background/20 select-none uppercase tracking-[0.5em]">Auth_Protocol: Active</div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative z-10"
                    >
                        <h2 className="text-6xl md:text-[10rem] font-black text-background mb-12 leading-[0.8] tracking-tighter uppercase italic">
                            Prêt pour <br />
                            <span className="opacity-40">l'Impact ?</span>
                        </h2>
                        <p className="text-background/70 text-lg md:text-2xl max-w-2xl mx-auto mb-20 font-black uppercase italic tracking-tighter">
                            Initialisez votre connexion avec AUTOMATIC et transformez votre vision en un actif technologique S-TIER.
                        </p>

                        <Link
                            href="/onboarding"
                            className="group relative inline-flex items-center gap-6 px-20 py-8 bg-background text-primary font-black text-xs uppercase tracking-[0.4em] rounded-full hover:scale-105 transition-all active:scale-95 shadow-2xl overflow-hidden"
                        >
                            <div className="absolute inset-0 w-1/4 h-full bg-primary/5 -skew-x-[45deg] animate-glint" />
                            Initialiser_le_Voyage <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

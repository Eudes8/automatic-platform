"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
    return (
        <section className="py-20 px-4 sm:px-6 relative overflow-hidden">
            <div className="container mx-auto max-w-5xl">
                <div className="relative rounded-3xl bg-primary p-12 sm:p-20 overflow-hidden text-center shadow-2xl shadow-primary/20">
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative z-10"
                    >
                        <h2 className="text-3xl sm:text-5xl font-black text-background mb-8 leading-tight">
                            Prêt à lancer votre projet ?
                        </h2>
                        <p className="text-background/80 text-lg max-w-xl mx-auto mb-12 font-medium">
                            Rejoignez les entrepreneurs qui ont choisi la simplicité et la qualité.
                        </p>

                        <Link
                            href="/onboarding"
                            className="group relative inline-flex items-center gap-4 px-8 py-4 bg-background text-primary font-bold text-sm uppercase tracking-wider rounded-full hover:scale-105 transition-all active:scale-95 shadow-xl"
                        >
                            Commencer maintenant <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

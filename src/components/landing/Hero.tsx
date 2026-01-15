"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-mesh">
      {/* Enhanced Decorative Elements */}
      <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.015] pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-100/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10 pt-20">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-premium bg-gradient-card shadow-card backdrop-blur-sm mb-12"
          >
            <div className="flex h-2 w-2 rounded-full bg-success animate-pulse shadow-sm" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
              Votre Vision, Notre Code — Disponible en 2026
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-9xl font-heading font-black mb-10 tracking-[-0.04em] leading-[0.9] text-primary"
          >
            Créez votre futur <br />
            <span className="text-gradient-premium">applicatif aujourd'hui.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-secondary max-w-3xl mx-auto mb-16 leading-relaxed font-medium"
          >
            Nous concevons des SaaS et applications Web d'exception pour les entrepreneurs ambitieux.
            <span className="text-accent font-semibold"> Design sobre, architecture robuste, scalabilité infinie.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link
              href="/onboarding"
              className="group relative px-10 py-4 bg-primary text-background rounded-full font-bold text-base transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
            >
              Démarrer mon projet
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="#portfolio"
              className="px-10 py-4 rounded-full font-bold text-base text-primary border border-border hover:bg-secondary/10 transition-colors flex items-center gap-2"
            >
              Voir nos réalisations
            </Link>
          </motion.div>
        </div>

        {/* Stats / Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-24 pt-10 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto opacity-60"
        >
          {[
            { label: "Projets livrés", val: "120+" },
            { label: "Satisfaction", val: "100%" },
            { label: "Délai moyen", val: "4 sem." },
            { label: "Stack", val: "Top Tier" },
          ].map((stat, i) => (
            <div key={i} className="text-center md:text-left">
              <p className="text-2xl font-heading font-bold text-primary mb-1">{stat.val}</p>
              <p className="text-[11px] uppercase tracking-widest text-secondary">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Background Decorative elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}

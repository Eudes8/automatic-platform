"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Smartphone, Globe, Laptop, ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-background pt-20 pb-10">

      {/* Soft Background Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 z-10 relative">
        <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            <span>La technologie rendue simple</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight text-primary leading-tight"
          >
            Que voulez-vous <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x">
              créer aujourd'hui ?
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg sm:text-xl text-secondary/80 max-w-2xl mx-auto"
          >
            Pas besoin de compétences techniques. Sélectionnez simplement votre projet et laissez la magie opérer.
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {/* Card 1: Application Mobile */}
          <motion.div variants={item}>
            <Link href="/onboarding?type=app" className="group block relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl transform group-hover:scale-[1.02] transition-transform duration-300" />
              <div className="relative p-8 h-full bg-card border border-border/50 rounded-3xl hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all text-center flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                  <Smartphone className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-primary">Application Mobile</h3>
                <p className="text-secondary/70 mb-8">
                  Créez votre propre application pour iPhone et Android.
                </p>
                <div className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider group-hover:gap-3 transition-all">
                  Commencer <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Card 2: Site Web */}
          <motion.div variants={item}>
            <Link href="/onboarding?type=website" className="group block relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-3xl transform group-hover:scale-[1.02] transition-transform duration-300" />
              <div className="relative p-8 h-full bg-card border border-border/50 rounded-3xl hover:border-accent/50 hover:shadow-xl hover:shadow-accent/5 transition-all text-center flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 text-accent group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-primary">Site Internet</h3>
                <p className="text-secondary/70 mb-8">
                  Présentez votre activité au monde entier avec un site moderne.
                </p>
                <div className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-accent uppercase tracking-wider group-hover:gap-3 transition-all">
                  Commencer <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Card 3: Logiciel */}
          <motion.div variants={item}>
            <Link href="/onboarding?type=software" className="group block relative h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-3xl transform group-hover:scale-[1.02] transition-transform duration-300" />
              <div className="relative p-8 h-full bg-card border border-border/50 rounded-3xl hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/5 transition-all text-center flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-500 group-hover:scale-110 transition-transform duration-300">
                  <Laptop className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-primary">Logiciel Sur Mesure</h3>
                <p className="text-secondary/70 mb-8">
                  Des outils puissants pour gérer et automatiser votre entreprise.
                </p>
                <div className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-purple-500 uppercase tracking-wider group-hover:gap-3 transition-all">
                  Commencer <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}

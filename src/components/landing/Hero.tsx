"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ChevronRight, Terminal, AtSign, Cpu } from "lucide-react";
import { useEffect, useState } from "react";

function Counter({ value, suffix = "" }: { value: number, suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 2000;
    let timer = setInterval(() => {
      start += Math.ceil(end / 100);
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, duration / 100);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}{suffix}</span>;
}

export default function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Serious Tech Background */}
      <div className="absolute inset-0 z-0">
        {/* Millimetric Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        {/* Floating Tech Coordinates */}
        <div className="absolute top-1/4 left-10 text-[10px] font-mono text-primary/20 writing-vertical select-none">
          LAT_4.3948 / LON_-3.9840 / ABIDJAN_HUB
        </div>
        <div className="absolute bottom-1/4 right-10 text-[10px] font-mono text-primary/20 writing-vertical select-none">
          ENGINE_V2.0 / STABLE_BUILD / 256-BIT_ENC
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10 pt-20">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full border border-primary/10 bg-primary/5 backdrop-blur-md mb-12"
          >
            <div className="flex h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">
              Protocol_Digital : Initialisation_2026
            </span>
          </motion.div>

          <motion.div
            style={{ y: y1, opacity }}
            className="relative"
          >
            <h1 className="text-6xl md:text-[9rem] font-black mb-8 tracking-[-0.08em] leading-[0.85] text-primary italic uppercase">
              Forgez votre <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x">Empire Digital.</span>
            </h1>

            <p className="text-lg md:text-2xl text-secondary max-w-3xl mx-auto mb-16 leading-tight font-black uppercase tracking-tighter italic">
              AUTOMATIC déploie des infrastructures logicielles indestructibles pour les bâtisseurs du <span className="text-accent">nouveau monde.</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/onboarding"
              className="group relative px-10 py-5 bg-primary text-background rounded-full font-black text-[11px] uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-[1.05] active:scale-95 flex items-center gap-4"
            >
              {/* Glint effect */}
              <div className="absolute inset-0 w-1/4 h-full bg-white/20 -skew-x-[45deg] animate-glint" />

              Initialiser le Projet
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="#portfolio"
              className="px-10 py-5 rounded-full font-black text-[11px] uppercase tracking-[0.3em] text-primary border border-primary/20 hover:border-primary/50 transition-all flex items-center gap-4 hover:bg-primary/5"
            >
              Consulter le Registre
            </Link>
          </motion.div>
        </div>

        {/* Counter Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-32 pt-12 border-t border-primary/5 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto"
        >
          {[
            { label: "Actifs_Déployés", val: 124, suffix: "+" },
            { label: "Uptime_Système", val: 99.9, suffix: "%" },
            { label: "Indice_Vitesse", val: 450, suffix: "Mbps" },
            { label: "Grade_Tech", val: 1, suffix: "/S-TIER" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-accent opacity-40 italic">ITEM_{i + 1}</span>
              </div>
              <p className="text-3xl font-black text-primary italic leading-none">
                <Counter value={stat.val} suffix={stat.suffix} />
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-60 italic">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Background Scanner Line Overlay */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <div className="w-full h-[1px] bg-primary/10 absolute top-0 animate-scan-line" />
      </div>
    </div>
  );
}

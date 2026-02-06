"use client";

import Navbar from "@/components/shared/Navbar";
import Hero from "@/components/landing/Hero";
import Services from "@/components/landing/Services";
import Portfolio from "@/components/landing/Portfolio";
import ControlCenter from "@/components/landing/ControlCenter";
import CTA from "@/components/landing/CTA";
import { Logo } from "@/components/shared/Logo";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <main>
        <Hero />
        <Services />
        <Portfolio />
        <ControlCenter />
        <CTA />
      </main>

      <footer className="py-16 sm:py-20 md:py-24 border-t border-border/50 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 sm:gap-12 mb-12 sm:mb-16 md:mb-20">
            <div className="flex flex-col gap-4 sm:gap-6">
              <Logo />
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] text-secondary/40 max-w-xs leading-relaxed">
                Bureau d'ingénierie digitale premium. <br />
                Spécialisé en SaaS haute performance <br /> et architectures Matrix.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12 md:gap-16 w-full md:w-auto">
              <div className="flex flex-col gap-3 sm:gap-4">
                <span className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-widest opacity-20">Réseau</span>
                {["Twitter", "GitHub", "LinkedIn"].map(item => (
                  <a key={item} href="#" className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-secondary hover:text-accent transition-colors">{item}</a>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:gap-4">
                <span className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-widest opacity-20">Juridique</span>
                {["Privacy", "Terms", "Security"].map(item => (
                  <a key={item} href="#" className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-secondary hover:text-accent transition-colors">{item}</a>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:gap-4">
                <span className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-widest opacity-20">Status</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-success">All_Systems_Nominal</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 sm:pt-12 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <p className="text-secondary/30 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em] sm:tracking-[0.5em]">© 2026 AUTOMATIC_SYSTEMS. V0.5.2-ALPHA</p>
            <div className="flex gap-4 sm:gap-6 md:gap-8 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-secondary/20 italic flex-wrap justify-center">
              <span>Latency: 24ms</span>
              <span>Uptime: 99.99%</span>
              <span>Region: AF_WEST_1</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
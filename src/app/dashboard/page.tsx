"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/actions/users";
import { getDashboardStats } from "@/lib/actions/projects";
import { motion } from "framer-motion";
import {
    Zap,
    Target,
    FileText,
    CreditCard,
    ChevronRight,
    ArrowUpRight,
    Activity,
    Terminal
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/currency";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getCurrentUser(),
            getDashboardStats()
        ]).then(([userData, statsData]) => {
            setUser(userData);
            setStats(statsData);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-secondary/40 font-bold uppercase tracking-widest text-xs">Chargement en cours...</p>
            </div>
        );
    }

    const statCards = [
        { label: "Projets totaux", value: stats.totalProjects, icon: Target, color: "text-blue-500", bg: "bg-blue-500/5" },
        { label: "Projets actifs", value: stats.activeProjects, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/5" },
        { label: "Investissement total", value: formatCurrency(stats.totalBudget), icon: CreditCard, color: "text-primary", bg: "bg-primary/5" },
        { label: "Contrats en attente", value: stats.pendingContracts, icon: FileText, color: "text-accent", bg: "bg-accent/5" },
    ];

    return (
        <div className="space-y-8 sm:space-y-12 md:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-16 sm:pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
                <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <span className="w-8 sm:w-10 h-[1px] bg-accent" />
                        <span className="text-accent font-bold tracking-widest uppercase text-[9px] sm:text-[10px]">Espace Client</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary tracking-tight uppercase leading-none">
                        Bonjour, <br />
                        <span className="text-secondary/20 text-3xl sm:text-4xl md:text-6xl">{user?.name?.split(' ')[0] || "Bienvenue"}.</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 px-6 sm:px-8 py-4 sm:py-6 rounded-[1.5rem] sm:rounded-[2rem] bg-card/30 border border-border/50 backdrop-blur-xl shadow-2xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Zap className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                    </div>
                    <div>
                        <p className="text-[9px] sm:text-[10px] font-bold text-secondary/40 uppercase tracking-widest">État du service</p>
                        <p className="text-xs sm:text-sm font-bold text-primary uppercase tracking-tight">Services opérationnels</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {statCards.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-5 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] bg-card/30 border border-border/50 shadow-xl relative group overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 ${stat.bg} rounded-full blur-3xl -mr-8 -mt-8 sm:-mr-10 sm:-mt-10 md:-mr-12 md:-mt-12 transition-all group-hover:scale-150`} />
                        <stat.icon className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${stat.color} mb-4 sm:mb-6 relative z-10`} />
                        <p className="text-[9px] sm:text-[10px] font-bold text-secondary/40 uppercase tracking-widest mb-1.5 sm:mb-2 relative z-10">{stat.label}</p>
                        <p className="text-2xl sm:text-3xl font-bold text-primary tracking-tight relative z-10">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 md:gap-10">
                <div className="lg:col-span-8 space-y-6 sm:space-y-8">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-[10px] sm:text-xs font-bold text-secondary/40 uppercase tracking-widest pl-2">Raccourcis utiles</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <Link href="/dashboard/projects" className="group p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] bg-primary text-background shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-10 group-hover:scale-125 transition-transform">
                                <Target className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight mb-3 sm:mb-4">Mes <br />Projets</h3>
                            <p className="text-background/60 text-[10px] sm:text-xs font-bold leading-relaxed mb-6 sm:mb-8 uppercase tracking-widest">Consultez l'avancée de vos projets immobiliers.</p>
                            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border-t border-background/20 pt-4 sm:pt-6">
                                Voir mes projets <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                        </Link>

                        <Link href="/dashboard/chat" className="group p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] bg-white border border-border/50 shadow-2xl hover:scale-[1.02] transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 sm:p-8 text-primary opacity-5 group-hover:scale-125 transition-transform">
                                <Zap className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-primary uppercase tracking-tight mb-3 sm:mb-4">Support <br />Technique</h3>
                            <p className="text-secondary/40 text-[10px] sm:text-xs font-bold leading-relaxed mb-6 sm:mb-8 uppercase tracking-widest">Une question ? Chattez avec notre équipe.</p>
                            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold text-primary uppercase tracking-widest border-t border-border/20 pt-4 sm:pt-6">
                                Ouvrir la messagerie <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="lg:col-span-4 bg-card/20 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] border border-border/50 p-6 sm:p-8 md:p-10 shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                    <h3 className="text-[9px] sm:text-[10px] font-bold text-secondary/40 uppercase tracking-widest mb-8 sm:mb-12">Fil d'actualité</h3>
                    <div className="space-y-4 sm:space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-background/50 border border-border/50 group hover:border-primary/20 transition-all">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 mt-1" />
                                <div>
                                    <p className="text-[9px] sm:text-[10px] font-bold text-primary uppercase leading-none mb-1">Mise à jour du projet</p>
                                    <p className="text-[7px] sm:text-[8px] font-bold text-secondary/40 uppercase tracking-widest">Il y a quelques minutes</p>
                                </div>
                                <ArrowUpRight className="ml-auto w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary/20 group-hover:text-primary transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

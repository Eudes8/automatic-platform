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
                <p className="text-secondary/40 font-black uppercase tracking-[0.4em] text-xs italic">// Synchronisation_Nexus...</p>
            </div>
        );
    }

    const statCards = [
        { label: "Actifs_Totaux", value: stats.totalProjects, icon: Target, color: "text-blue-500", bg: "bg-blue-500/5" },
        { label: "Builds_Actifs", value: stats.activeProjects, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/5" },
        { label: "Engagements_Fiscaux", value: formatCurrency(stats.totalBudget), icon: CreditCard, color: "text-primary", bg: "bg-primary/5" },
        { label: "Signatures_Requises", value: stats.pendingContracts, icon: FileText, color: "text-accent", bg: "bg-accent/5" },
    ];

    return (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="w-10 h-[1px] bg-accent" />
                        <span className="text-accent font-black tracking-[0.4em] uppercase text-[10px] italic">SYSTÈME_INITIÉ</span>
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black text-primary tracking-tighter uppercase italic leading-none">
                        Bonjour, <br />
                        <span className="text-secondary/20 font-black text-4xl md:text-6xl">{user?.name?.split(' ')[0] || "Invité"}.</span>
                    </h1>
                </div>

                <div className="flex items-center gap-6 px-8 py-6 rounded-[2rem] bg-card/30 border border-border/50 backdrop-blur-xl shadow-2xl">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Zap className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest italic">// Status_Opérationnel</p>
                        <p className="text-sm font-black text-primary uppercase italic tracking-tighter">Tous les systèmes sont NOMINAL</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-8 rounded-[2.5rem] bg-card/30 border border-border/50 shadow-xl relative group overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full blur-3xl -mr-12 -mt-12 transition-all group-hover:scale-150`} />
                        <stat.icon className={`w-8 h-8 ${stat.color} mb-6 relative z-10`} />
                        <p className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.3em] mb-2 relative z-10 italic">{stat.label}</p>
                        <p className="text-3xl font-black text-primary tracking-tighter italic relative z-10">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xs font-black text-secondary/40 uppercase tracking-[0.4em] italic pl-2">// Actions_Recommandées</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/dashboard/projects" className="group p-10 rounded-[3rem] bg-primary text-background shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                                <Terminal className="w-24 h-24" />
                            </div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Gérer mes <br />Projets</h3>
                            <p className="text-background/60 text-xs font-bold leading-relaxed mb-8 uppercase tracking-widest italic">Accéder au mainframe de vos actifs numériques.</p>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] border-t border-background/20 pt-6">
                                OUVRIR_CONSOL <ChevronRight className="w-4 h-4" />
                            </div>
                        </Link>

                        <Link href="/dashboard/chat" className="group p-10 rounded-[3rem] bg-white border border-border/50 shadow-2xl hover:scale-[1.02] transition-all relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 text-primary opacity-5 group-hover:scale-125 transition-transform">
                                <Zap className="w-24 h-24" />
                            </div>
                            <h3 className="text-2xl font-black text-primary uppercase italic tracking-tighter mb-4 text-blue-500">Support <br />Technique</h3>
                            <p className="text-secondary/40 text-xs font-bold leading-relaxed mb-8 uppercase tracking-widest italic">Communication directe avec nos ingénieurs.</p>
                            <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.3em] border-t border-border/20 pt-6">
                                OPEN_CHANNEL <ChevronRight className="w-4 h-4" />
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="lg:col-span-4 bg-card/20 rounded-[3rem] border border-border/50 p-10 shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                    <h3 className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em] mb-12 italic">// SYSTÈME_LOGS</h3>
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-background/50 border border-border/50 group hover:border-primary/20 transition-all">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <div>
                                    <p className="text-[10px] font-black text-primary uppercase italic leading-none mb-1">Backup_Alpha_Success</p>
                                    <p className="text-[8px] font-black text-secondary/40 uppercase tracking-widest">Séquence_ID: AX-90${i}</p>
                                </div>
                                <ArrowUpRight className="ml-auto w-4 h-4 text-secondary/20 group-hover:text-primary transition-colors" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-border/10">
                        <div className="flex items-center justify-between font-mono text-[8px] text-secondary/20 uppercase tracking-[0.3em]">
                            <span>CPU_USAGE</span>
                            <span className="text-primary italic">12.4%</span>
                        </div>
                        <div className="h-1 bg-secondary/5 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-primary/20 w-1/3" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

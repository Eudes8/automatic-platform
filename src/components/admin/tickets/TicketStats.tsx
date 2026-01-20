"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TicketStatus } from "@prisma/client";

interface TicketStatsData {
    total: number;
    open: number;
    inProgress: number;
    closed: number;
    urgent: number;
}

export function TicketStats() {
    const [stats, setStats] = useState<TicketStatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch("/api/admin/tickets/stats");
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch ticket stats:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-40 bg-card/10 border border-border/50 rounded-[2.5rem] animate-pulse" />
                ))}
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="p-8 bg-card/10 border border-border/50 rounded-[2.5rem] shadow-xl group hover:bg-white transition-all duration-500 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                    <span className="text-[9px] text-secondary/40 font-black uppercase tracking-[0.3em] italic group-hover:text-primary transition-colors">TOTAL_TICKETS_LOG</span>
                </div>
                <p className="text-4xl font-black text-primary tracking-tighter italic uppercase">{stats.total}</p>
                <div className="mt-4 flex items-center gap-2 text-secondary/20">
                    <span className="text-[8px] font-black uppercase tracking-widest italic">BASE_RECORDS_SYNC</span>
                </div>
            </div>

            <div className="p-8 bg-card/10 border border-border/50 rounded-[2.5rem] shadow-xl group hover:bg-white transition-all duration-500 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                    <span className="text-[9px] text-secondary/40 font-black uppercase tracking-[0.3em] italic group-hover:text-primary transition-colors">UNITES_OUVERTES</span>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                </div>
                <p className="text-4xl font-black text-blue-600 tracking-tighter italic uppercase">{stats.open}</p>
                <div className="mt-4 flex items-center gap-2 text-secondary/20">
                    <span className="text-[8px] font-black uppercase tracking-widest italic">AWAITING_RESPONSE</span>
                </div>
            </div>

            <div className="p-8 bg-card/10 border border-border/50 rounded-[2.5rem] shadow-xl group hover:bg-white transition-all duration-500 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                    <span className="text-[9px] text-secondary/40 font-black uppercase tracking-[0.3em] italic group-hover:text-primary transition-colors">FLUX_EN_COURS</span>
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                </div>
                <p className="text-4xl font-black text-amber-600 tracking-tighter italic uppercase">{stats.inProgress}</p>
                <div className="mt-4 flex items-center gap-2 text-secondary/20">
                    <span className="text-[8px] font-black uppercase tracking-widest italic">ACTIVE_PROCESSING</span>
                </div>
            </div>

            <div className="p-8 bg-card/10 border border-border/50 rounded-[2.5rem] shadow-xl group hover:bg-white transition-all duration-500 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6 border-b border-red-500/10 pb-2">
                    <span className="text-[9px] text-red-500 font-black uppercase tracking-[0.3em] italic group-hover:text-red-600 transition-colors">CRITIQUE_PRIORITY.X</span>
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                </div>
                <p className="text-4xl font-black text-red-600 tracking-tighter italic uppercase">{stats.urgent}</p>
                <div className="mt-4 flex items-center gap-2 text-secondary/20">
                    <span className="text-[8px] font-black text-red-500/40 uppercase tracking-widest italic">IMMEDIATE_ACTION_REQ</span>
                </div>
            </div>
        </div>
    );
}

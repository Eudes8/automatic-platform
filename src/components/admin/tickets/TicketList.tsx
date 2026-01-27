"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, MessageSquare, User, Clock, Shield } from "lucide-react";
import { Ticket, TicketStatus, TicketPriority } from "@prisma/client";
import { cn } from "@/lib/utils";

interface TicketListProps {
    tickets: (Ticket & {
        client: { name: string | null; email: string };
        assignedTo?: { name: string | null } | null;
        project?: { title: string } | null;
        responses: { id: string }[];
    })[];
    currentPage: number;
    totalPages: number;
    total: number;
}

function getStatusBadge(status: TicketStatus) {
    const labels = {
        OPEN: "NODES_OUVERTS",
        IN_PROGRESS: "XFER_EN_COURS",
        CLOSED: "SESSION_CLOSE",
        RESOLVED: "FINALISÉ_OK"
    };

    const variants = {
        OPEN: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        IN_PROGRESS: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        CLOSED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        RESOLVED: "bg-purple-500/10 text-purple-600 border-purple-500/20"
    };

    return (
        <span className={cn("px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border italic shadow-sm", variants[status])}>
            {labels[status]}
        </span>
    );
}

function getPriorityBadge(priority: TicketPriority) {
    const labels = {
        LOW: "LVL_SOBRE",
        MEDIUM: "LVL_STANDARD",
        HIGH: "LVL_ÉLEVÉ",
        URGENT: "CRITIQUE_X"
    };

    const variants = {
        LOW: "bg-slate-500/5 text-slate-500 border-slate-500/10",
        MEDIUM: "bg-blue-500/5 text-blue-500 border-blue-500/10",
        HIGH: "bg-amber-500/5 text-amber-500 border-amber-500/10",
        URGENT: "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse"
    };

    return (
        <span className={cn("px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border italic shadow-sm", variants[priority])}>
            {labels[priority]}
        </span>
    );
}

export function TicketList({ tickets, currentPage, totalPages, total }: TicketListProps) {
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    const filteredTickets = statusFilter === "ALL"
        ? tickets
        : tickets.filter(ticket => ticket.status === statusFilter);

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-white/40 backdrop-blur-3xl border border-border/50 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/2 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-inner">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-primary uppercase italic tracking-tighter">FLUX_MESSAGES.</h2>
                        <p className="text-[10px] font-black text-secondary/20 uppercase tracking-[0.3em] mt-1 italic">DÉTECTION: {total} ÉLÉMENTS_SYNC</p>
                    </div>
                </div>

                <div className="relative z-10 w-full md:w-80 group">
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-background border border-border/50 rounded-2xl px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] italic focus:ring-8 focus:ring-primary/5 transition-all duration-500 shadow-inner appearance-none"
                    >
                        <SelectItem value="ALL">TOUS_LES_FLUX</SelectItem>
                        <SelectItem value="OPEN">NODES_OUVERTS</SelectItem>
                        <SelectItem value="IN_PROGRESS">XFER_EN_COURS</SelectItem>
                        <SelectItem value="CLOSED">SESSION_CLOSE</SelectItem>
                        <SelectItem value="RESOLVED">FINALISÉ_OK</SelectItem>
                    </Select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                        <ChevronRight size={14} className="rotate-90" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 relative z-10">
                {filteredTickets.map((ticket) => (
                    <Link key={ticket.id} href={`/admin/tickets/${ticket.id}`} className="group relative">
                        <div className="bg-white/40 backdrop-blur-3xl border border-border/50 hover:border-primary/50 rounded-[2.5rem] p-10 transition-all duration-500 shadow-xl group-hover:shadow-2xl group-hover:scale-[1.01] overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/2 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                            <div className="flex flex-col lg:flex-row gap-10 items-start relative z-10">
                                <div className="flex-1 space-y-6 min-w-0">
                                    <div className="flex flex-wrap items-center gap-6">
                                        <h3 className="text-2xl font-black text-primary uppercase italic tracking-tighter truncate group-hover:text-accent transition-colors duration-500">
                                            {ticket.title}
                                        </h3>
                                        <div className="flex gap-4">
                                            {getStatusBadge(ticket.status)}
                                            {getPriorityBadge(ticket.priority)}
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-secondary/40 font-bold leading-relaxed uppercase italic tracking-tight line-clamp-2 max-w-4xl border-l border-border/50 pl-6">
                                        {ticket.description}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-10 pt-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center shadow-inner group-hover:bg-primary/5 transition-colors">
                                                <User className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-secondary/20 uppercase tracking-[0.3em] italic">XFER_IDENTITY</span>
                                                <span className="text-[10px] font-black text-primary uppercase italic tracking-widest">{ticket.client.name}</span>
                                            </div>
                                        </div>

                                        {ticket.assignedTo && (
                                            <div className="flex items-center gap-4">
                                                <div className="w-1- h-10 rounded-xl bg-orange-500/5 border border-orange-500/20 flex items-center justify-center shadow-inner">
                                                    <Shield className="h-4 w-4 text-orange-500/40" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-secondary/20 uppercase tracking-[0.3em] italic">UNIT_ASSIGNED</span>
                                                    <span className="text-[10px] font-black text-orange-600 uppercase italic tracking-widest">{ticket.assignedTo.name}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                                                <MessageSquare className="h-4 w-4 text-emerald-500/40" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-secondary/20 uppercase tracking-[0.3em] italic">TOTAL_REPLY_LOG</span>
                                                <span className="text-[10px] font-black text-emerald-600 uppercase italic tracking-widest">{ticket.responses.length}_XFER</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-accent/5 border border-accent/20 flex items-center justify-center shadow-inner">
                                                <Clock className="h-4 w-4 text-accent/40" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-secondary/20 uppercase tracking-[0.3em] italic">TIMESTAMP_LOG</span>
                                                <span className="text-[10px] font-black text-accent uppercase italic tracking-widest">
                                                    {format(new Date(ticket.createdAt), "dd.MM.yyyy", { locale: fr })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scanline on Card */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500">
                                <div className="w-full h-[1px] bg-primary animate-scan-line" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 p-12 bg-white/40 backdrop-blur-3xl border border-border/50 rounded-[3rem] shadow-2xl relative z-10 mt-12 overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/2 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none" />

                    <div className="text-[11px] font-black text-secondary/20 uppercase tracking-[0.5em] italic relative z-10">
                        XFER_STATS: {currentPage} / {totalPages} // {total} NODES
                    </div>

                    <div className="flex gap-6 relative z-10">
                        {currentPage > 1 ? (
                            <Link href={`/admin/tickets?page=${currentPage - 1}`}>
                                <Button className="px-10 py-7 bg-background border border-border/50 hover:border-primary/50 text-primary rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] italic transition-all duration-500 shadow-inner group">
                                    <ChevronLeft className="h-4 w-4 mr-3 group-hover:-translate-x-1 transition-transform" />
                                    PRECEDENT
                                </Button>
                            </Link>
                        ) : (
                            <Button className="px-10 py-7 bg-background/50 border border-border/20 text-secondary/20 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] italic cursor-not-allowed opacity-50" disabled>
                                <ChevronLeft className="h-4 w-4 mr-3" />
                                PRECEDENT
                            </Button>
                        )}

                        {currentPage < totalPages ? (
                            <Link href={`/admin/tickets?page=${currentPage + 1}`}>
                                <Button className="px-10 py-7 bg-primary text-background rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] italic transition-all duration-500 shadow-2xl hover:scale-[1.05] group">
                                    SUIVANT
                                    <ChevronRight className="h-4 w-4 ml-3 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        ) : (
                            <Button className="px-10 py-7 bg-primary/50 text-background/50 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] italic cursor-not-allowed opacity-50" disabled>
                                SUIVANT
                                <ChevronRight className="h-4 w-4 ml-3" />
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

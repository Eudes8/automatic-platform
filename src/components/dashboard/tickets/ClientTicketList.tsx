"use client";

import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSquare, Clock, ArrowRight, Shield, AlertCircle, Terminal, Eye } from "lucide-react";
import { Ticket, TicketStatus, TicketPriority } from "@prisma/client";
import { cn } from "@/lib/utils";

interface ClientTicketListProps {
    tickets: (Ticket & {
        assignedTo?: { name: string | null } | null;
        project?: { title: string } | null;
        responses: { id: string }[];
    })[];
}

function getStatusBadge(status: TicketStatus) {
    const styles = {
        OPEN: "text-blue-600 bg-blue-500/5 border-blue-500/10",
        IN_PROGRESS: "text-amber-600 bg-amber-500/5 border-amber-500/10",
        CLOSED: "text-secondary/40 bg-secondary/5 border-border/50",
        RESOLVED: "text-emerald-600 bg-emerald-500/5 border-emerald-500/10"
    };

    const labels = {
        OPEN: "Ouvert",
        IN_PROGRESS: "En cours",
        CLOSED: "Terminé",
        RESOLVED: "Résolu"
    };

    return (
        <span className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            styles[status]
        )}>
            {labels[status]}
        </span>
    );
}

function getPriorityBadge(priority: TicketPriority) {
    const styles = {
        LOW: "text-emerald-600/60 bg-emerald-500/5 border-emerald-500/10",
        MEDIUM: "text-primary/60 bg-primary/5 border-primary/10",
        HIGH: "text-amber-600/60 bg-amber-500/5 border-amber-500/10",
        URGENT: "text-accent bg-accent/5 border-accent/10 shadow-[0_0_10px_rgba(79,70,229,0.2)]"
    };

    const codes = {
        LOW: "Faible",
        MEDIUM: "Normal",
        HIGH: "Prioritaire",
        URGENT: "Urgent"
    };

    return (
        <span className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            styles[priority]
        )}>
            {codes[priority]}
        </span>
    );
}

export function ClientTicketList({ tickets }: ClientTicketListProps) {
    if (tickets.length === 0) {
        return (
            <div className="p-16 bg-card/10 border border-dashed border-border/50 rounded-[3rem] text-center space-y-6">
                <div className="w-20 h-20 rounded-[1.5rem] bg-primary/5 border border-primary/10 flex items-center justify-center text-secondary/20 mx-auto">
                    <MessageSquare size={32} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-primary tracking-tight mb-2">
                        Aucune demande pour le moment
                    </h3>
                    <p className="text-sm text-secondary/40 font-medium max-w-xs mx-auto">
                        Vous n'avez pas encore envoyé de ticket de support. Cliquez sur le bouton ci-dessus pour commencer.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            <div className="flex items-center gap-4 px-4">
                <h2 className="text-2xl font-bold text-primary tracking-tight">Mes demandes</h2>
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-[10px] font-bold text-secondary/30 uppercase tracking-widest">Total: {tickets.length}</span>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {tickets.map((ticket) => (
                    <div
                        key={ticket.id}
                        className="group p-8 bg-card/30 border border-border/50 rounded-[2.5rem] hover:bg-white hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/2 rounded-full blur-[40px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative z-10">
                            <div className="flex-1 space-y-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <Link
                                        href={`/dashboard/tickets/${ticket.id}`}
                                        className="text-xl font-black text-primary hover:text-accent transition-colors uppercase italic tracking-tighter"
                                    >
                                        {ticket.title}
                                    </Link>
                                    <div className="flex gap-2">
                                        {getStatusBadge(ticket.status)}
                                        {getPriorityBadge(ticket.priority)}
                                    </div>
                                </div>

                                <p className="text-secondary/60 text-sm font-medium line-clamp-2 leading-relaxed">
                                    {ticket.description}
                                </p>

                                <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-4 border-t border-border/30">
                                    {ticket.assignedTo && (
                                        <div className="flex items-center gap-2">
                                            <Shield size={14} className="text-primary/30" />
                                            <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-wider">Assigné à : {ticket.assignedTo.name}</span>
                                        </div>
                                    )}

                                    {ticket.project && (
                                        <div className="flex items-center gap-2">
                                            <Terminal size={14} className="text-primary/30" />
                                            <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-wider">Projet : {ticket.project.title}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <MessageSquare size={14} className="text-primary/30" />
                                        <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-wider">{ticket.responses.length} réponse{ticket.responses.length > 1 ? 's' : ''}</span>
                                    </div>

                                    <div className="flex items-center gap-2 ml-auto">
                                        <Clock size={14} className="text-primary/30" />
                                        <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-wider">
                                            Envoyé le {format(new Date(ticket.createdAt), "dd MMMM yyyy", { locale: fr })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={`/dashboard/tickets/${ticket.id}`}
                                className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/5 text-primary border border-primary/10 hover:bg-primary hover:text-white hover:scale-110 transition-all duration-500 shadow-inner shrink-0 self-center"
                            >
                                <ArrowRight className="h-6 w-6" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

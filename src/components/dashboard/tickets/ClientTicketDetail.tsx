"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Clock, MessageSquare, Send, Shield, Terminal, Zap, AlertOctagon, User, Calendar } from "lucide-react";
import Link from "next/link";
import { Ticket, TicketResponse, TicketStatus, TicketPriority } from "@prisma/client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ClientTicketDetailProps {
    ticket: Ticket & {
        assignedTo?: { name: string | null } | null;
        project?: { title: string } | null;
        responses: (TicketResponse & { author: { name: string | null; role: string } })[];
    };
    onAddResponse: (ticketId: string, message: string, isInternal: boolean) => Promise<{ success: boolean; response?: TicketResponse }>;
}

function getStatusBadge(status: TicketStatus) {
    const styles = {
        OPEN: "text-blue-600 bg-blue-500/5 border-blue-500/10",
        IN_PROGRESS: "text-amber-600 bg-amber-500/5 border-amber-500/10",
        CLOSED: "text-secondary/40 bg-secondary/5 border-border/50",
        RESOLVED: "text-emerald-600 bg-emerald-500/5 border-emerald-500/10"
    };

    const labels = {
        OPEN: "THREAD_OPEN",
        IN_PROGRESS: "SCANNING_ISSUE",
        CLOSED: "ARCHIVED_LOG",
        RESOLVED: "NODE_FIXED"
    };

    return (
        <span className={cn(
            "px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border italic shadow-sm",
            styles[status]
        )}>
            {labels[status]}
        </span>
    );
}

function getPriorityBadge(priority: TicketPriority) {
    const styles = {
        LOW: "text-emerald-600 bg-emerald-500/5 border-emerald-500/10",
        MEDIUM: "text-primary bg-primary/5 border-primary/10",
        HIGH: "text-amber-600 bg-amber-500/5 border-amber-500/10",
        URGENT: "text-accent bg-accent/5 border-accent/10 shadow-[0_0_15px_rgba(79,70,229,0.2)]"
    };

    const codes = {
        LOW: "L_01: LOW_PRIORITY",
        MEDIUM: "L_02: MEDIUM_PROCESS",
        HIGH: "L_03: HIGH_CRITICAL",
        URGENT: "L_04: URGENT_STRIKE"
    };

    return (
        <span className={cn(
            "px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border italic shadow-sm",
            styles[priority]
        )}>
            {codes[priority]}
        </span>
    );
}

export function ClientTicketDetail({ ticket, onAddResponse }: ClientTicketDetailProps) {
    const [responseMessage, setResponseMessage] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleAddResponse = async () => {
        if (!responseMessage.trim()) return;

        startTransition(async () => {
            const result = await onAddResponse(ticket.id, responseMessage, false);
            if (result.success) {
                setResponseMessage("");
                window.location.reload();
            }
        });
    };

    const canRespond = ticket.status !== "CLOSED";

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header / Protocol Back */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-border/50">
                <div className="space-y-6">
                    <Link
                        href="/dashboard/tickets"
                        className="group flex items-center gap-3 text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em] hover:text-primary transition-colors italic"
                    >
                        <div className="w-8 h-8 rounded-xl bg-secondary/5 border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:text-background transition-all duration-500 group-hover:scale-110">
                            <ArrowLeft size={14} />
                        </div>
                        // PROTOCOL_RETURN
                    </Link>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 text-primary rounded-xl">
                                <Terminal size={24} />
                            </div>
                            <span className="text-[10px] font-black text-secondary/20 uppercase tracking-[0.5em] italic">INSTANCE: TKT_{ticket.id.slice(-8).toUpperCase()}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-heading font-black text-primary uppercase italic tracking-tighter leading-[0.9]">
                            {ticket.title}
                        </h1>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                <div className="lg:col-span-2 space-y-10">
                    {/* Main Ticket Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-10 bg-card/30 border border-border/50 rounded-[3rem] shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/2 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none group-hover:bg-primary/5 transition-colors duration-1000" />

                        <div className="space-y-8 relative z-10">
                            <div className="flex items-center gap-4">
                                <AlertOctagon className="text-primary/40" size={20} />
                                <h3 className="text-xl font-heading font-black text-primary italic uppercase tracking-tighter">DÉTAILS_UNITÉ_MÉTIER.</h3>
                            </div>

                            <div className="p-8 bg-background/50 border border-border/50 rounded-[2rem] shadow-inner group-hover:bg-white transition-all duration-500">
                                <p className="text-primary font-bold text-base leading-relaxed tracking-tight whitespace-pre-wrap">
                                    {ticket.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/30">
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.3em] italic ml-1">HORODATAGE_INITIAL</p>
                                    <div className="flex items-center gap-3 p-4 bg-secondary/5 rounded-[1.5rem] border border-transparent">
                                        <Calendar size={14} className="text-primary/30" />
                                        <span className="text-xs font-black text-primary italic">{format(new Date(ticket.createdAt), "dd_MM_yyyy 'A' HH:mm", { locale: fr }).toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.3em] italic ml-1">DERNIÈRE_SYNCHRO</p>
                                    <div className="flex items-center gap-3 p-4 bg-secondary/5 rounded-[1.5rem] border border-transparent">
                                        <Clock size={14} className="text-primary/30" />
                                        <span className="text-xs font-black text-primary italic">{format(new Date(ticket.updatedAt), "dd_MM_yyyy 'A' HH:mm", { locale: fr }).toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Conversation List */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 px-6">
                            <MessageSquare className="text-primary/30" size={20} />
                            <h3 className="text-xl font-heading font-black text-primary italic uppercase tracking-tighter">FIL_DE_TRANSMISSION ({ticket.responses.length.toString().padStart(2, '0')})</h3>
                            <div className="flex-1 h-px bg-border/50" />
                        </div>

                        <div className="space-y-6">
                            {ticket.responses.length === 0 ? (
                                <div className="p-16 border border-dashed border-border/50 rounded-[3rem] text-center bg-card/10">
                                    <p className="text-[10px] text-secondary/40 font-black uppercase tracking-[0.5em] italic">// ATTENTE_RÉPONSE_SUPPORT...</p>
                                </div>
                            ) : (
                                ticket.responses.map((response, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        key={response.id}
                                        className={cn(
                                            "p-8 rounded-[2.5rem] border transition-all duration-500 shadow-lg",
                                            response.author.role === "ADMIN"
                                                ? "bg-primary text-background border-primary/20 mr-12 ml-4 shadow-primary/10"
                                                : "bg-card/40 text-primary border-border/50 ml-12 mr-4"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner",
                                                    response.author.role === "ADMIN" ? "bg-background/20" : "bg-primary/5"
                                                )}>
                                                    <User size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest italic">{response.author.name?.toUpperCase()}</p>
                                                    <p className={cn(
                                                        "text-[8px] font-black uppercase tracking-[0.3em] italic",
                                                        response.author.role === "ADMIN" ? "opacity-60" : "text-primary/40"
                                                    )}>{response.author.role === "ADMIN" ? "SUPPORT_UNIT" : "NODE_OWNER"}</p>
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "text-[8px] font-black uppercase tracking-widest italic opacity-40 group-hover:opacity-100",
                                                response.author.role === "ADMIN" ? "text-background" : "text-primary"
                                            )}>
                                                {format(new Date(response.createdAt), "HH:mm_dd.MM.yy")}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold leading-relaxed tracking-tight whitespace-pre-wrap italic">
                                            {response.message}
                                        </p>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Add Response Input */}
                    {canRespond && (
                        <div className="p-8 bg-background/80 backdrop-blur-3xl border border-primary/20 rounded-[3rem] shadow-2xl space-y-6">
                            <div className="flex items-center gap-4 mb-4">
                                <Zap className="text-primary" size={18} />
                                <h3 className="text-lg font-heading font-black text-primary italic uppercase tracking-tighter">INJECTER_MÉDIATION.</h3>
                            </div>
                            <textarea
                                placeholder="XFER_QUERY: Saisissez votre communication..."
                                value={responseMessage}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResponseMessage(e.target.value)}
                                rows={4}
                                className="w-full bg-secondary/5 border border-border/50 rounded-[2rem] px-8 py-6 text-xs font-bold leading-relaxed text-primary placeholder:text-secondary/20 focus:outline-none focus:border-primary/30 transition-all shadow-inner"
                            />

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={handleAddResponse}
                                    disabled={!responseMessage.trim() || isPending}
                                    className={cn(
                                        "flex items-center gap-3 px-12 py-5 bg-primary text-background font-black uppercase text-[10px] tracking-[0.3em] rounded-[1.5rem] shadow-2xl shadow-primary/30 transition-all duration-500 italic hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale",
                                        isPending && "animate-pulse"
                                    )}
                                >
                                    <Send size={16} />
                                    {isPending ? "XFER_SYNC..." : "DIFFUSER_MESSAGE_OK"}
                                </button>
                            </div>
                        </div>
                    )}

                    {!canRespond && (
                        <div className="p-10 bg-accent/5 border border-accent/20 rounded-[3rem] text-center">
                            <p className="text-xs font-black text-accent uppercase tracking-[0.4em] italic leading-relaxed">
                                // PROTOCOLE_TERMINÉ : Ce ticket est archivé. <br />
                                Toute communication ultérieure nécessite l'ouverture d'un nouveau NODE.
                            </p>
                        </div>
                    )}
                </div>

                {/* Sidebar Info Panels */}
                <aside className="space-y-8">
                    <div className="p-8 bg-card/30 border border-border/50 rounded-[2.5rem] shadow-xl group">
                        <div className="flex items-center gap-4 mb-8">
                            <Shield className="text-primary/40" size={18} />
                            <h3 className="text-lg font-heading font-black text-primary italic uppercase tracking-tighter">NODE_METRICS.</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <p className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.3em] italic ml-1">PROJET_CI_CIBLE</p>
                                <div className="p-5 bg-background border border-border/50 rounded-[1.5rem] shadow-inner group-hover:border-primary/20 transition-colors">
                                    <p className="text-[11px] font-black text-primary uppercase italic tracking-tight">{ticket.project?.title || "GLOBAL_RESOURCES"}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.3em] italic ml-1">RESPONSABLE_RÉSEAU</p>
                                <div className="p-5 bg-background border border-border/50 rounded-[1.5rem] shadow-inner group-hover:border-primary/20 transition-colors">
                                    <p className="text-[11px] font-black text-primary uppercase italic tracking-tight">{ticket.assignedTo?.name || "EN_COURS_D'ATTRIBUTION"}</p>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-primary/5 rounded-[1.5rem] border border-primary/10">
                                <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] leading-relaxed italic text-center">
                                    // SYNCHRONISATION_TEMPS_RÉEL <br />
                                    ORIGINE: AUTOMATIC_CORE
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-background border border-border/50 rounded-[2.5rem] shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-2 h-full bg-accent animate-pulse" />
                        <h3 className="text-sm font-black text-primary italic uppercase tracking-widest mb-4 ml-4">Garanties Support</h3>
                        <ul className="space-y-3 ml-4">
                            {[
                                "Réponse sous 24h ouvrées",
                                "Expert dédié affecté",
                                "Suivi de résolution temps réel",
                                "Archivage sécurisé à vie"
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-3 text-[10px] font-bold text-secondary/60 italic">
                                    <div className="w-1 h-1 rounded-full bg-primary/30" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}

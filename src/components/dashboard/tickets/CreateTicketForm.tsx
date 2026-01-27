"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Send, X, AlertOctagon, Terminal } from "lucide-react";
import { Project, Ticket } from "@prisma/client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
interface CreateTicketFormProps {
    projects: Project[];
    onCreateTicket: (formData: FormData) => Promise<{ success: boolean; ticket?: Ticket }>;
}

export function CreateTicketForm({ projects, onCreateTicket }: CreateTicketFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const result = await onCreateTicket(formData);
            if (result.success) {
                setIsOpen(false);
                router.refresh();
            }
        });
    };

    if (!isOpen) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-card/30 border border-border/50 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all duration-500 group cursor-pointer"
                onClick={() => setIsOpen(true)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all duration-500">
                            <Plus className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-heading font-black text-primary italic uppercase tracking-tighter mb-1">INITIALISER_REQUÊTE_SUPPORT.</h3>
                            <p className="text-[10px] text-secondary/40 font-black uppercase tracking-[0.3em] italic">// Ouvrir un nouveau canal d'assistance technique.</p>
                        </div>
                    </div>
                    <Terminal size={24} className="text-secondary/10 group-hover:text-primary transition-colors" />
                </div>
            </motion.div>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-12 bg-background/80 backdrop-blur-3xl border border-primary/20 rounded-[3rem] shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="flex justify-between items-start mb-12 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-xl">
                            <AlertOctagon size={24} />
                        </div>
                        <h2 className="text-2xl font-heading font-black text-primary italic uppercase tracking-tighter">OUVERTURE_DE_TICKET.</h2>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-3 text-secondary/40 hover:text-accent transition-colors hover:bg-accent/5 rounded-xl border border-transparent hover:border-accent/10"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form action={handleSubmit} className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label htmlFor="title" className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-2 italic leading-relaxed">
                                TITRE_DU_FLUX_D'INCIDENT *
                            </label>
                            <input
                                id="title"
                                name="title"
                                placeholder="TYPE_ERROR: DESCRIPTION_RAPIDE..."
                                required
                                className="w-full bg-secondary/5 border border-border/50 rounded-[1.5rem] px-6 py-4 text-xs font-black uppercase tracking-widest text-primary placeholder:text-secondary/20 focus:outline-none focus:border-primary/30 transition-all italic shadow-inner"
                            />
                        </div>

                        <div className="space-y-3">
                            <label htmlFor="projectId" className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-2 italic leading-relaxed">
                                NODE_PROJET_CIBLÉ (OPTIONNEL)
                            </label>
                            <select
                                name="projectId"
                                className="w-full bg-secondary/5 border border-border/50 rounded-[1.5rem] px-6 py-4 text-xs font-black uppercase tracking-widest text-primary focus:outline-none focus:border-primary/30 transition-all italic shadow-inner appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-background text-primary">SELECT_NODE_NONE</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id} className="bg-background text-primary">
                                        NODE_{project.title.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label htmlFor="description" className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-2 italic leading-relaxed">
                            LOGS_DÉTAILLÉS_PROTOCOLE *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="INITIALISATION_LOGS: Expliquez le comportement attendu vs actuel..."
                            rows={6}
                            required
                            className="w-full bg-secondary/5 border border-border/50 rounded-[2rem] px-8 py-6 text-xs font-bold leading-relaxed text-primary placeholder:text-secondary/20 focus:outline-none focus:border-primary/30 transition-all shadow-inner"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label htmlFor="priority" className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-2 italic leading-relaxed">
                                    NIVEAU_DE_PRIORITÉ_SYSTÈME
                                </label>
                                <select
                                    name="priority"
                                    defaultValue="MEDIUM"
                                    className="w-full bg-secondary/5 border border-border/50 rounded-[1.5rem] px-6 py-4 text-xs font-black uppercase tracking-widest text-primary focus:outline-none focus:border-primary/30 transition-all italic shadow-inner appearance-none cursor-pointer"
                                >
                                    <option value="LOW" className="bg-background text-emerald-600">L_01: LOW_INTENSITY</option>
                                    <option value="MEDIUM" className="bg-background text-primary">L_02: MEDIUM_PROCESS</option>
                                    <option value="HIGH" className="bg-background text-amber-600">L_03: HIGH_CRITICAL</option>
                                    <option value="URGENT" className="bg-background text-accent">L_04: URGENT_INTERVENTION</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-2 italic leading-relaxed">XFER_LOGS_ATTACH (PDF/ZIP)</label>
                                <div className="group relative">
                                    <input
                                        type="file"
                                        name="attachment"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="w-full bg-secondary/5 border border-border/50 border-dashed rounded-[1.5rem] px-6 py-4 text-[9px] font-black uppercase italic tracking-widest text-secondary/20 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500 flex items-center gap-4">
                                        <Plus size={14} />
                                        <span>APPEND_FILE_BUFFER</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isPending}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-3 px-10 py-5 bg-primary text-background font-black uppercase text-[10px] tracking-[0.3em] rounded-[1.5rem] shadow-2xl shadow-primary/30 transition-all duration-500 italic hover:scale-105 active:scale-95",
                                    isPending && "animate-pulse"
                                )}
                            >
                                <Send className="h-4 w-4" />
                                {isPending ? "XFER_SYNC..." : "DIFFUSER_REQUÊTE_OK"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                disabled={isPending}
                                className="px-10 py-5 bg-accent/5 hover:bg-accent text-accent hover:text-background font-black uppercase text-[10px] tracking-[0.3em] rounded-[1.5rem] border border-accent/20 transition-all duration-500 italic"
                            >
                                ABORT
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </AnimatePresence>
    );
}

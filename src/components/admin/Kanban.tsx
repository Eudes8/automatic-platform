"use client";

import { motion } from "framer-motion";
import { MoreHorizontal, Plus, Users, Clock, AlertCircle, FileCheck } from "lucide-react";
import { updateProjectStatus } from "@/lib/actions/admin";
import { useState } from "react";
import { ProjectStatus } from "@prisma/client";

const COLUMNS = [
    { id: "ONBOARDING", title: "Nouveaux Leads", color: "blue" },
    { id: "ANALYSIS", title: "En Analyse", color: "purple" },
    { id: "DEV", title: "En Développement", color: "orange" },
    { id: "DONE", title: "Livré / Terminé", color: "green" },
];

export default function Kanban({ initialProjects }: { initialProjects: any[] }) {
    const [projects, setProjects] = useState(initialProjects);

    const moveProject = async (projectId: string, newStatus: ProjectStatus) => {
        // Optimistic update
        const updatedProjects = projects.map(p =>
            p.id === projectId ? { ...p, status: newStatus } : p
        );
        setProjects(updatedProjects);

        try {
            await updateProjectStatus(projectId, newStatus);
        } catch (error) {
            console.error("Failed to update status", error);
            setProjects(projects); // rollback
        }
    };

    return (
        <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar min-h-[700px]">
            {COLUMNS.map((col) => (
                <div key={col.id} className="min-w-[320px] bg-slate-900/40 rounded-[2.5rem] border border-white/5 p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${col.color === "blue" ? "bg-blue-500" :
                                col.color === "purple" ? "bg-purple-500" :
                                    col.color === "orange" ? "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]" : "bg-green-500"
                                }`} />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">{col.title}</h3>
                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-slate-500 font-bold">
                                {projects.filter(t => t.status === col.id).length}
                            </span>
                        </div>
                        <button className="p-2 hover:bg-white/5 rounded-lg text-slate-600 transition-colors">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 space-y-4">
                        {projects.filter(t => t.status === col.id).map((ticket) => (
                            <motion.div
                                key={ticket.id}
                                layoutId={ticket.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -5, borderColor: "rgba(255,255,255,0.2)" }}
                                className="group p-6 bg-slate-950/50 border border-white/5 rounded-3xl cursor-pointer transition-all hover:bg-slate-900 shadow-xl"
                                onClick={() => {
                                    // Clicking card body moves it (for demo) but let's change behavior or add a specific button
                                    // Let's make the whole card a link to details, and rely on drag (future) or specific action for status
                                    // Actually, let's keep click-to-move for quick demo but add a "Details" button
                                    window.location.href = `/admin/projects/${ticket.id}`;
                                }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-2">
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-md bg-blue-500/10 text-blue-500">
                                            {ticket.status}
                                        </span>
                                        {ticket.contractSigned && (
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-md bg-green-500/10 text-green-500 flex items-center gap-1">
                                                <FileCheck className="w-2 h-2" /> Signé
                                            </span>
                                        )}
                                    </div>
                                    <button className="text-slate-700 group-hover:text-white transition-colors">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>

                                <h4 className="text-white font-bold text-lg leading-tight mb-2">{ticket.title}</h4>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[8px] text-blue-400 font-bold">
                                        {ticket.client?.name?.split(" ").map((n: string) => n[0]).join("") || "U"}
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{ticket.client?.name || "Client Inconnu"}</span>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white font-black text-sm">
                                        {ticket.budget || 0}€
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {col.id === "ONBOARDING" && projects.filter(t => t.status === col.id).length > 0 && (
                        <div className="mt-4 p-4 rounded-2xl bg-blue-500/5 border border-dashed border-blue-500/20 text-center">
                            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest italic flex items-center justify-center gap-2">
                                <AlertCircle className="w-3 h-3" /> Nouveaux leads détectés
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

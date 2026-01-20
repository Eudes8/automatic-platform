"use client";

import { useState } from "react";
import { ProjectStatus } from "@prisma/client";
import { KanbanColumn } from "./kanban/KanbanColumn";
import { updateProjectStatus } from "@/lib/actions/kanban";
import { toast } from "sonner";
import { LayoutGrid, ListFilter, Search, Zap, Plus, Filter } from "lucide-react";

/**
 * MODULE KANBAN INDUSTRIEL - COMMAND CENTER AUTOMATIC
 */

const COLUMNS: { status: ProjectStatus; label: string }[] = [
    { status: "ONBOARDING", label: "Cadrage / Lead" },
    { status: "ANALYSIS", label: "Analyse Tech" },
    { status: "DESIGN", label: "Architecture / UI" },
    { status: "DEV", label: "Execution Code" },
    { status: "QA", label: "QA / SecOps" },
    { status: "DEPLOYMENT", label: "Mainframe Live" },
    { status: "DONE", label: "Completed" },
];

export default function Kanban({ initialProjects }: { initialProjects: any[] }) {
    const [projects, setProjects] = useState(initialProjects);
    const [searchTerm, setSearchTerm] = useState("");

    const onDragStart = (e: React.DragEvent, projectId: string) => {
        e.dataTransfer.setData("projectId", projectId);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const onDrop = async (e: React.DragEvent, newStatus: ProjectStatus) => {
        const projectId = e.dataTransfer.getData("projectId");
        const projectToUpdate = projects.find(p => p.id === projectId);

        if (projectToUpdate && projectToUpdate.status !== newStatus) {
            // Optimistic Update
            setProjects(prev => prev.map(p =>
                p.id === projectId ? { ...p, status: newStatus } : p
            ));

            const res = await updateProjectStatus(projectId, newStatus);
            if (res.success) {
                toast.success(`PROJET_SYNC: Status mis à jour (${newStatus})`);
            } else {
                toast.error("Échec de la synchronisation");
                // Rollback simple pour la démo
                setProjects(initialProjects);
            }
        }
    };

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col space-y-12">
            {/* Command Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                <div className="relative w-full md:w-[500px] group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/20 group-focus-within:text-primary transition-colors duration-500" />
                    <input
                        type="text"
                        placeholder="SCAN_ALL_UNITS: Nom_Projet ou Client_ID..."
                        className="w-full pl-16 pr-6 py-5 bg-white/50 border border-border/50 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary/40 focus:ring-8 focus:ring-primary/5 transition-all duration-500 placeholder:text-secondary/10 shadow-inner italic"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex bg-white/50 border border-border/50 rounded-2xl p-2 shadow-inner">
                        <button className="p-3 bg-primary text-background rounded-[1rem] shadow-xl shadow-primary/20 transition-all duration-500 hover:scale-110">
                            <LayoutGrid size={18} />
                        </button>
                        <button className="p-3 text-secondary/20 hover:text-primary transition-colors duration-500">
                            <ListFilter size={18} />
                        </button>
                    </div>

                    <button className="flex items-center gap-4 px-8 py-5 bg-primary text-background rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.05] active:scale-95 transition-all duration-500 shadow-2xl shadow-primary/20 italic group">
                        <div className="w-6 h-6 rounded-lg bg-background/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                            <Plus size={16} />
                        </div>
                        INITIALISER_UNITE
                    </button>
                </div>
            </div>

            {/* Board Surface */}
            <div className="flex-1 overflow-x-auto custom-scrollbar flex gap-12 pb-12 min-h-[700px] scroll-smooth relative z-10">
                {COLUMNS.map((col) => (
                    <KanbanColumn
                        key={col.status}
                        status={col.status}
                        label={col.label}
                        projects={filteredProjects.filter(p => p.status === col.status)}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        onDragStart={onDragStart}
                    />
                ))}
            </div>

            {/* Grid stats (Industrial Footer) */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 relative z-10 pt-8 border-t border-border/20">
                {COLUMNS.map(col => {
                    const count = filteredProjects.filter(p => p.status === col.status).length;
                    return (
                        <div key={col.status} className="p-6 bg-white/30 border border-border/50 rounded-[1.5rem] flex flex-col gap-2 items-center justify-center group hover:bg-white hover:border-primary/20 transition-all duration-500 shadow-xl">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-secondary/20 group-hover:text-primary/40 transition-colors italic truncate w-full text-center">{col.label.split(' ')[0]}</span>
                            <span className="text-xl font-black text-primary italic uppercase tracking-tighter">{count}_UNIT</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

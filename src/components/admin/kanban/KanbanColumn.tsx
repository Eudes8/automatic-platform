"use client";

import { motion } from "framer-motion";
import { ProjectStatus } from "@prisma/client";
import { KanbanCard } from "./KanbanCard";
import { Circle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectWithClient } from "../Kanban";

interface KanbanColumnProps {
    status: ProjectStatus;
    label: string;
    projects: ProjectWithClient[];
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, status: ProjectStatus) => void;
    onDragStart: (e: React.DragEvent, projectId: string) => void;
}

export function KanbanColumn({ status, label, projects, onDragOver, onDrop, onDragStart }: KanbanColumnProps) {
    return (
        <div
            className="flex flex-col w-[22rem] shrink-0 h-full group/col"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, status)}
        >
            <div className="flex items-center justify-between mb-8 px-4 py-3 bg-secondary/5 rounded-[1.2rem] border border-border/30 group-hover/col:bg-primary/5 group-hover/col:border-primary/20 transition-all duration-500">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-2.5 h-2.5 rounded-full animate-pulse",
                        status === 'DONE' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                            status === 'ONBOARDING' ? 'bg-primary shadow-[0_0_10px_rgba(37,99,235,0.5)]' :
                                status === 'DEV' ? 'bg-accent shadow-[0_0_10px_rgba(79,70,229,0.5)]' :
                                    'bg-secondary/40 shadow-none'
                    )} />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary italic">
                        {label}
                    </h3>
                </div>
                <div className="bg-white text-primary text-[10px] font-black px-3 py-1 rounded-lg shadow-sm border border-border/50">
                    {projects.length}
                </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pb-10 min-h-[550px] px-2">
                {projects.map((project) => (
                    <KanbanCard
                        key={project.id}
                        project={project}
                        onDragStart={onDragStart}
                    />
                ))}
            </div>
        </div>
    );
}

"use client";

import { motion } from "framer-motion";
import { ProjectStatus } from "@prisma/client";
import { MoreHorizontal, Calendar, MessageSquare, Paperclip, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import Link from "next/link";
import { ProjectWithClient } from "../Kanban";

interface KanbanCardProps {
    project: ProjectWithClient;
    onDragStart: (e: React.DragEvent, projectId: string) => void;
}

export function KanbanCard({ project, onDragStart }: KanbanCardProps) {
    return (
        <motion.div
            layout
            draggable
            onDragStart={(e) => onDragStart(e as any, project.id)}
            className="group bg-white border border-border/50 hover:border-primary/50 rounded-[1.8rem] p-6 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-grab active:cursor-grabbing relative overflow-hidden"
            whileHover={{ y: -4, scale: 1.02 }}
        >
            <Link href={`/admin/projects/${project.id}`} className="absolute inset-0 z-0" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/2 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/20 mb-2 leading-none italic">
                        NODE_REF_/{project.id.slice(-4).toUpperCase()}
                    </span>
                    <h4 className="text-[13px] font-black text-primary uppercase tracking-tight italic leading-tight group-hover:text-accent transition-colors duration-500">
                        {project.title}
                    </h4>
                </div>
                <button className="p-2 hover:bg-secondary/5 rounded-xl text-secondary/20 group-hover:text-primary transition-all duration-500">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            <p className="text-[10px] text-secondary/60 line-clamp-2 mb-6 font-bold leading-relaxed italic uppercase tracking-tight">
                {project.description || "// AUCUNE_SPEC_TECHNIQUE_DEFINIE."}
            </p>

            <div className="space-y-4 relative z-10">
                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.3em] italic">
                        <span className="text-secondary/30 group-hover:text-primary transition-colors">EXECUTION_SYNC</span>
                        <span className="text-primary">{project.progress}%_OK</span>
                    </div>
                    <div className="h-1.5 bg-secondary/5 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-background border border-border/50 flex items-center justify-center text-[10px] font-black text-primary uppercase italic shadow-inner">
                            {project.client?.name?.charAt(0) || "U"}
                        </div>
                        <span className="text-[8px] font-black text-secondary/20 uppercase tracking-[0.2em] italic truncate max-w-[80px]">
                            {project.client?.name || "ANONYMOUS"}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-secondary/20">
                        <div className="flex items-center gap-1.5 group/icon">
                            <MessageSquare className="w-3.5 h-3.5 group-hover/icon:text-primary transition-colors" />
                            <span className="text-[9px] font-black">{project.messages?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 group/icon">
                            <Paperclip className="w-3.5 h-3.5 group-hover/icon:text-primary transition-colors" />
                            <span className="text-[9px] font-black">{project.assets?.length || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em] italic pt-2">
                    <div className="flex items-center gap-2 text-accent">
                        <Zap className="w-3.5 h-3.5" />
                        <span>{formatCurrency(project.budget || 0, 'EUR')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-secondary/20">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(project.updatedAt).toLocaleDateString().replace(/\//g, '.')}</span>
                    </div>
                </div>
            </div>

            {/* Scanline effect on card hover */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-[0.03] transition-opacity">
                <div className="w-full h-[1px] bg-primary animate-scan-line" />
            </div>
        </motion.div>
    );
}

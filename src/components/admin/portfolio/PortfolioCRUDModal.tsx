"use client";

import { useState } from "react";
import { Plus, X, Loader2, Image as ImageIcon, Link as LinkIcon, Github, Star, Trash2 } from "lucide-react";
import { createPortfolioProject, updatePortfolioProject, deletePortfolioProject } from "@/lib/actions/portfolio";
import { toast } from "sonner";

import { PortfolioProject } from "@prisma/client";

interface PortfolioCRUDModalProps {
    project?: PortfolioProject;
    mode: "CREATE" | "EDIT";
}

export default function PortfolioCRUDModal({ project, mode }: PortfolioCRUDModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const res = mode === "CREATE"
                ? await createPortfolioProject(formData)
                : project?.id ? await updatePortfolioProject(project.id, formData) : { success: false, error: "Missing project ID" };

            if (res.success) {
                toast.success(mode === "CREATE" ? "PROJET_ARCHIVÉ: Succès" : "PROJET_MIS_À_JOUR: Succès");
                setIsOpen(false);
            } else {
                toast.error("ERREUR_SYSTÈME: " + res.error);
            }
        } catch (error) {
            toast.error("CRITICAL_FAILURE");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("CONFIRMER_SUPPRESSION: Êtes-vous sûr de vouloir purger ce projet des archives ?")) return;
        if (!project?.id) return;
        setLoading(true);
        try {
            const res = await deletePortfolioProject(project.id);
            if (res.success) {
                toast.success("PROJET_PURGÉ: Succès");
                setIsOpen(false);
            }
        } catch (error) {
            toast.error("PURGE_FAILED");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {mode === "CREATE" ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="px-6 py-4 bg-primary text-background rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-3"
                >
                    <Plus className="w-4 h-4" /> ARCHIVER_NOUVEAU_PROJET
                </button>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 hover:bg-primary/10 rounded-lg text-primary/40 hover:text-primary transition-colors"
                    title="Modifier le projet"
                >
                    <Plus className="w-4 h-4" />
                </button>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="w-full max-w-2xl bg-card border border-border/60 rounded-[2.5rem] p-10 relative shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-8 right-8 text-secondary/40 hover:text-primary transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-8 h-[1px] bg-accent" />
                            <h3 className="text-xl font-black text-primary uppercase italic tracking-tighter">
                                {mode === "CREATE" ? "Initialisation_Archive" : "Modification_Protocole"}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary/40 uppercase tracking-widest italic">// Titre_Projet</label>
                                    <input name="title" defaultValue={project?.title} required className="w-full bg-background border border-border/50 rounded-xl p-4 text-primary text-sm font-bold focus:border-accent outline-none transition-all" placeholder="Ex: EcoSphere Core" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary/40 uppercase tracking-widest italic">// Catégorie</label>
                                    <input name="category" defaultValue={project?.category} required className="w-full bg-background border border-border/50 rounded-xl p-4 text-primary text-sm font-bold focus:border-accent outline-none" placeholder="Ex: SaaS Platform" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary/40 uppercase tracking-widest italic">// Stack_Technique (virgules)</label>
                                    <input name="tech" defaultValue={project?.tech?.join(", ")} required className="w-full bg-background border border-border/50 rounded-xl p-4 text-primary text-[11px] font-mono focus:border-accent outline-none" placeholder="Next.js, Tailwind, Prisma" />
                                </div>

                                <div className="flex items-center gap-4 py-4">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" name="featured" defaultChecked={project?.featured} value="true" className="w-5 h-5 rounded border-border text-accent focus:ring-accent" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary group-hover:text-primary transition-colors italic">Mettre en avant (Front_Hero)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary/40 uppercase tracking-widest italic">// URL_Image_Nexus</label>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/20" />
                                        <input name="image" defaultValue={project?.image} required className="w-full bg-background border border-border/50 rounded-xl p-4 pl-12 text-primary text-xs font-medium focus:border-accent outline-none" placeholder="https://unsplash.com/..." />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary/40 uppercase tracking-widest italic">// Live_Link</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/20" />
                                        <input name="url" defaultValue={project?.url || ""} className="w-full bg-background border border-border/50 rounded-xl p-4 pl-12 text-primary text-xs font-medium focus:border-accent outline-none" placeholder="https://app.client.com" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-secondary/40 uppercase tracking-widest italic">// Code_Repository</label>
                                    <div className="relative">
                                        <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/20" />
                                        <input name="github" defaultValue={project?.github || ""} className="w-full bg-background border border-border/50 rounded-xl p-4 pl-12 text-primary text-xs font-medium focus:border-accent outline-none" placeholder="github.com/automatic/..." />
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-secondary/40 uppercase tracking-widest italic">// Mission_Details (Markdown Support)</label>
                                <textarea name="description" defaultValue={project?.description} required rows={4} className="w-full bg-background border border-border/50 rounded-xl p-4 text-primary text-sm font-medium focus:border-accent outline-none resize-none" placeholder="Décrivez les enjeux techniques et la solution apportée..." />
                            </div>

                            <div className="md:col-span-2 flex items-center justify-between pt-6 border-t border-border/50">
                                {mode === "EDIT" && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={loading}
                                        className="p-4 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5 group"
                                    >
                                        <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </button>
                                )}

                                <div className="flex gap-4 ml-auto">
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="px-8 py-4 text-[10px] font-black text-secondary/60 uppercase tracking-widest hover:text-primary transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        disabled={loading}
                                        className="px-10 py-4 bg-primary text-background rounded-xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                                    >
                                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {mode === "CREATE" ? "Exécuter_Archivage" : "Modifier_Archive"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </>
    );
}

import { motion } from "framer-motion";

"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, ExternalLink, Github, Image as ImageIcon } from "lucide-react";
import { getPortfolioProjects, createPortfolioProject, deletePortfolioProject, updatePortfolioProject } from "@/lib/actions/portfolio";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPortfolioPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<any>(null);

    const [formData, setFormData] = useState({
        title: "",
        category: "",
        image: "",
        description: "",
        tech: "",
        githubUrl: "",
        liveUrl: ""
    });

    const loadProjects = async () => {
        setLoading(true);
        const data = await getPortfolioProjects();
        setProjects(data);
        setLoading(false);
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const resetForm = () => {
        setFormData({
            title: "",
            category: "",
            image: "",
            description: "",
            tech: "",
            githubUrl: "",
            liveUrl: ""
        });
        setEditingProject(null);
    };

    const handleEdit = (project: any) => {
        setEditingProject(project);
        setFormData({
            title: project.title,
            category: project.category,
            image: project.image,
            description: project.description,
            tech: project.tech.join(", "),
            githubUrl: project.githubUrl || "",
            liveUrl: project.liveUrl || ""
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            ...formData,
            tech: formData.tech.split(",").map(t => t.trim()).filter(t => t !== "")
        };

        if (editingProject) {
            await updatePortfolioProject(editingProject.id, data);
        } else {
            await createPortfolioProject(data);
        }

        setIsModalOpen(false);
        resetForm();
        loadProjects();
    };

    const handleDelete = async (id: string) => {
        if (confirm("Supprimer ce projet du portfolio ?")) {
            await deletePortfolioProject(id);
            loadProjects();
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-5xl font-heading font-bold text-primary tracking-tight">Gestion <span className="text-blue-500">Portfolio.</span></h1>
                    <p className="text-secondary font-bold text-xs uppercase tracking-widest mt-2 ml-1">Vitrine des actifs numériques</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="px-8 py-4 bg-primary text-background rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/10 hover:scale-105 transition-all flex items-center gap-3"
                >
                    <Plus className="w-4 h-4" /> Nouveau Projet
                </button>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-80 bg-card/50 animate-pulse rounded-[2.5rem]" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project) => (
                        <motion.div
                            key={project.id}
                            layout
                            className="glass-premium rounded-[2.5rem] overflow-hidden group border border-border"
                        >
                            <div className="aspect-video relative overflow-hidden">
                                <img src={project.image} alt={project.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <button onClick={() => handleEdit(project)} className="p-3 bg-white text-black rounded-full hover:scale-110 transition-all"><Edit2 className="w-5 h-5" /></button>
                                    <button onClick={() => handleDelete(project.id)} className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-all"><Trash2 className="w-5 h-5" /></button>
                                </div>
                            </div>
                            <div className="p-8">
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2 block">{project.category}</span>
                                <h3 className="text-xl font-heading font-bold text-primary mb-3">{project.title}</h3>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {project.tech.map((t: string) => (
                                        <span key={t} className="text-[9px] font-bold text-secondary/60 bg-secondary/5 px-2 py-1 rounded">#{t}</span>
                                    ))}
                                </div>
                                <div className="flex gap-4">
                                    {project.githubUrl && <a href={project.githubUrl} target="_blank" className="text-secondary hover:text-primary transition-colors"><Github className="w-5 h-5" /></a>}
                                    {project.liveUrl && <a href={project.liveUrl} target="_blank" className="text-secondary hover:text-primary transition-colors"><ExternalLink className="w-5 h-5" /></a>}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-card border border-border p-10 rounded-[3rem] shadow-2xl"
                        >
                            <h2 className="text-3xl font-heading font-bold text-primary mb-8">{editingProject ? 'Modifier' : 'Ajouter'} un Projet</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Titre</label>
                                        <input
                                            required
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Catégorie</label>
                                        <input
                                            required
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Image URL (Unsplash ou autre)</label>
                                    <input
                                        required
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Description</label>
                                    <textarea
                                        required
                                        rows={3}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Technologies (séparées par des virgules)</label>
                                    <input
                                        required
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                                        placeholder="Next.js, Tailwind, Prisma..."
                                        value={formData.tech}
                                        onChange={(e) => setFormData({ ...formData, tech: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">GitHub URL</label>
                                        <input
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                                            value={formData.githubUrl}
                                            onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">Live URL</label>
                                        <input
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all"
                                            value={formData.liveUrl}
                                            onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 border border-border text-secondary font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-secondary/5 transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-primary text-background font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/10 hover:scale-105 transition-all"
                                    >
                                        {editingProject ? 'Mettre à jour' : 'Créer le projet'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

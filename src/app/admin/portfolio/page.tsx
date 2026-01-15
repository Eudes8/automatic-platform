// TODO: Implement PortfolioProject model in Prisma schema
/*
"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, ExternalLink, Github } from "lucide-react";
import { getPortfolioProjects, createPortfolioProject, deletePortfolioProject, updatePortfolioProject } from "@/lib/actions/portfolio";
import { motion, AnimatePresence } from "framer-motion";
import { PortfolioProject } from "@prisma/client";

export default function AdminPortfolioPage() {
    const [projects, setProjects] = useState<PortfolioProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        category: "",
        image: "",
        description: "",
        tech: "",
        githubUrl: "",
        liveUrl: ""
    });

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await getPortfolioProjects();
            setProjects(data);
        } catch (error) {
            console.error("Failed to load projects:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const techArray = formData.tech.split(",").map(t => t.trim()).filter(Boolean);
            const data = { ...formData, tech: techArray };

            if (editingProject) {
                await updatePortfolioProject(editingProject.id, data);
            } else {
                await createPortfolioProject(data);
            }

            setIsModalOpen(false);
            setEditingProject(null);
            setFormData({
                title: "",
                category: "",
                image: "",
                description: "",
                tech: "",
                githubUrl: "",
                liveUrl: ""
            });
            loadProjects();
        } catch (error) {
            console.error("Failed to save project:", error);
        }
    };

    const handleEdit = (project: PortfolioProject) => {
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

    const handleDelete = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) return;
        try {
            await deletePortfolioProject(id);
            loadProjects();
        } catch (error) {
            console.error("Failed to delete project:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Gestion du Portfolio</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Ajouter un projet
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-card border border-subtle rounded-xl p-6 shadow-card"
                    >
                        <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
                            <img
                                src={project.image}
                                alt={project.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="space-y-3">
                            <div>
                                <h3 className="font-semibold text-lg">{project.title}</h3>
                                <p className="text-sm text-secondary">{project.category}</p>
                            </div>

                            <p className="text-sm text-secondary line-clamp-3">
                                {project.description}
                            </p>

                            <div className="flex flex-wrap gap-1">
                                {project.tech.map((tech, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex gap-2">
                                    {project.githubUrl && (
                                        <a
                                            href={project.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-secondary hover:text-primary transition-colors"
                                        >
                                            <Github className="h-4 w-4" />
                                        </a>
                                    )}
                                    {project.liveUrl && (
                                        <a
                                            href={project.liveUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-secondary hover:text-primary transition-colors"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(project)}
                                        className="p-2 text-secondary hover:text-primary transition-colors"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(project.id)}
                                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gradient-card border border-subtle rounded-xl p-6 shadow-card max-w-md w-full mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold mb-4">
                                {editingProject ? "Modifier le projet" : "Ajouter un projet"}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Titre</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-subtle rounded-lg bg-gradient-card"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Catégorie</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-subtle rounded-lg bg-gradient-card"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Image URL</label>
                                    <input
                                        type="url"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full px-3 py-2 border border-subtle rounded-lg bg-gradient-card"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-subtle rounded-lg bg-gradient-card"
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Technologies (séparées par des virgules)</label>
                                    <input
                                        type="text"
                                        value={formData.tech}
                                        onChange={(e) => setFormData({ ...formData, tech: e.target.value })}
                                        className="w-full px-3 py-2 border border-subtle rounded-lg bg-gradient-card"
                                        placeholder="React, Next.js, TypeScript"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">GitHub URL (optionnel)</label>
                                    <input
                                        type="url"
                                        value={formData.githubUrl}
                                        onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                                        className="w-full px-3 py-2 border border-subtle rounded-lg bg-gradient-card"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Live URL (optionnel)</label>
                                    <input
                                        type="url"
                                        value={formData.liveUrl}
                                        onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                                        className="w-full px-3 py-2 border border-subtle rounded-lg bg-gradient-card"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        {editingProject ? "Modifier" : "Ajouter"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setEditingProject(null);
                                            setFormData({
                                                title: "",
                                                category: "",
                                                image: "",
                                                description: "",
                                                tech: "",
                                                githubUrl: "",
                                                liveUrl: ""
                                            });
                                        }}
                                        className="px-4 py-2 border border-subtle rounded-lg hover:bg-subtle/50 transition-colors"
                                    >
                                        Annuler
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
*/

export default function AdminPortfolioPage() {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Portfolio Management</h2>
                <p className="text-gray-500">This feature is not yet implemented.</p>
            </div>
        </div>
    );
}

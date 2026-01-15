"use client";

import { useState, useEffect } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { createInvoice } from "@/lib/actions/invoices";
import { getProjectsByStatus } from "@/lib/actions/admin";

export default function InvoiceCRUDModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            getProjectsByStatus().then(setProjects);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        await createInvoice(formData);
        setLoading(false);
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-colors flex items-center gap-2"
            >
                <Plus className="w-4 h-4" /> Nouvelle Facture
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-8 relative">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-6 right-6 text-slate-500 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>

                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8">Créer une Facture</h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Projet</label>
                        <select name="projectId" required className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none">
                            <option value="">Sélectionner un projet</option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.title} - {project.client?.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Montant (€)</label>
                        <input
                            name="amount"
                            type="number"
                            step="0.01"
                            required
                            className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none"
                            placeholder="Ex: 2500.00"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date d'échéance</label>
                        <input
                            name="dueDate"
                            type="date"
                            required
                            className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none"
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-black uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Créer la Facture
                    </button>
                </form>
            </div>
        </div>
    );
}
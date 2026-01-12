"use client";

import { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { createProject } from "@/lib/actions/adminProjectCRUD";

export default function ProjectCRUDModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        await createProject(formData);
        setLoading(false);
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
                <Plus className="w-4 h-4" /> Nouveau Projet
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

                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8">Nouveau Projet</h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Titre du Projet</label>
                        <input name="title" required className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none" placeholder="Ex: Refonte Site Web" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Client (existant)</label>
                        <input name="clientEmail" type="email" required className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none" placeholder="client@email.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Budget (€)</label>
                        <input name="budget" type="number" required className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none" placeholder="10000" />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-black uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Lancer le Projet
                    </button>
                </form>
            </div>
        </div>
    );
}

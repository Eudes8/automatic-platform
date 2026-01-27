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
                className="group relative px-10 py-5 bg-primary text-background rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[11px] italic shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-500 overflow-hidden"
            >
                <div className="relative z-10 flex items-center gap-3">
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
                    GÉNÉRER_UNIT_FACTURE
                </div>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-md p-6 animate-in fade-in duration-500">
            <div className="w-full max-w-xl bg-white border border-border/50 rounded-[3.5rem] p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-10 right-10 text-secondary/20 hover:text-primary transition-all duration-500 hover:rotate-90"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                        <p className="text-[10px] text-primary/40 font-black uppercase tracking-[0.5em] italic">FINANCE_TERMINAL // V2.4</p>
                    </div>
                    <h3 className="text-4xl font-black text-primary italic uppercase tracking-tighter leading-none">
                        INITIALISER <span className="text-secondary/20">Facture.</span>
                    </h3>
                    <p className="text-secondary/40 font-black text-[10px] uppercase tracking-[0.3em] mt-3 italic">
                        // GÉNÉRATION_D_IMAGE_DISK_FINANCIÈRE.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.3em] italic ml-2">CIBLE_UNIT_PROJET</label>
                        <select
                            name="projectId"
                            required
                            className="w-full bg-background border border-border/50 rounded-[1.5rem] p-6 text-[11px] font-black uppercase italic tracking-widest text-primary focus:border-primary/50 focus:ring-8 focus:ring-primary/5 outline-none transition-all duration-500 shadow-inner appearance-none"
                        >
                            <option value="">SÉLECTIONNER_IDENTITÉ</option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    /{project.title} — {project.client?.name?.toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.3em] italic ml-2">FLUX_VALEUR (CFA)</label>
                            <input
                                name="amount"
                                type="number"
                                step="1"
                                required
                                className="w-full bg-background border border-border/50 rounded-[1.5rem] p-6 text-[11px] font-black uppercase italic tracking-widest text-primary focus:border-primary/50 focus:ring-8 focus:ring-primary/5 outline-none transition-all duration-500 shadow-inner placeholder:text-secondary/10"
                                placeholder="VALUE_LOG..."
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.3em] italic ml-2">SYNC_EXPIRATION</label>
                            <input
                                name="dueDate"
                                type="date"
                                required
                                className="w-full bg-background border border-border/50 rounded-[1.5rem] p-6 text-[11px] font-black uppercase italic tracking-widest text-primary focus:border-primary/50 focus:ring-8 focus:ring-primary/5 outline-none transition-all duration-500 shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.3em] italic ml-2">OBJET_DE_LA_FACTURE</label>
                        <textarea
                            name="description"
                            rows={3}
                            className="w-full bg-background border border-border/50 rounded-[1.5rem] p-6 text-[11px] font-black uppercase italic tracking-widest text-primary focus:border-primary/50 focus:ring-8 focus:ring-primary/5 outline-none transition-all duration-500 shadow-inner placeholder:text-secondary/10 resize-none"
                            placeholder="DÉTAILS DES SERVICES RENDUS..."
                        />
                    </div>

                    <div className="pt-6">
                        <button
                            disabled={loading}
                            className="w-full py-8 bg-primary text-background rounded-[2rem] text-[12px] font-black uppercase tracking-[0.4em] italic flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 shadow-2xl shadow-primary/20 disabled:grayscale disabled:opacity-50 group/submit overflow-hidden relative"
                        >
                            <div className="relative z-10 flex items-center gap-4">
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-700" />
                                )}
                                {loading ? "SYNC_EN_COURS..." : "DÉPLOYER_PROTOCOLE_FACTURE"}
                            </div>
                            {/* Scanline effect inside button */}
                            {loading && (
                                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                                    <div className="w-full h-1 bg-white animate-scan-line" />
                                </div>
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer decorations */}
                <div className="mt-12 flex items-center justify-between text-[8px] font-black text-secondary/10 uppercase tracking-[0.5em] italic">
                    <span>UNIT_ADMIN_TERMINAL</span>
                    <span>SECURE_ENCRYPTION_V2_ACTIVE</span>
                </div>
            </div>
        </div>
    );
}

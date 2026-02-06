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
                className="px-8 py-5 bg-primary text-background rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.05] active:scale-95 transition-all duration-500 shadow-2xl shadow-primary/20 italic group"
            >
                <div className="w-6 h-6 rounded-lg bg-background/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                    <Plus size={16} />
                </div>
                INITIALISER_PROJET
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-500">
            <div className="absolute inset-0 bg-background/60 backdrop-blur-xl" onClick={() => setIsOpen(false)} />

            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-border/50 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 md:p-12 relative shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/2 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 sm:top-10 sm:right-10 p-2 sm:p-3 hover:bg-secondary/5 rounded-xl text-secondary/20 hover:text-primary transition-all duration-500 border border-transparent hover:border-border/50 group/close"
                >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 group-hover/close:rotate-90 transition-transform duration-500" />
                </button>

                <div className="mb-6 sm:mb-10 relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="w-8 sm:w-12 h-px bg-primary/20" />
                        <span className="text-[8px] sm:text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] sm:tracking-[0.4em] italic">DEPLOY_CONFIG_NODE_V4</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary italic uppercase tracking-tighter leading-tight">Nouveau Project.</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                            <label className="text-[8px] sm:text-[9px] font-black text-secondary/40 uppercase tracking-[0.3em] sm:tracking-[0.4em] ml-2 italic">DÉSIGNATION_PROJET</label>
                            <input
                                name="title"
                                required
                                className="w-full bg-background border border-border/50 rounded-[1rem] sm:rounded-[1.2rem] p-3 sm:p-4 text-[10px] sm:text-[11px] text-primary focus:outline-none focus:border-primary/50 transition-all font-black uppercase italic tracking-widest shadow-inner placeholder:text-secondary/10"
                                placeholder="EX: INTERFACE_SaaS_2026"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[8px] sm:text-[9px] font-black text-secondary/40 uppercase tracking-[0.3em] sm:tracking-[0.4em] ml-2 italic">IDENTIFIANT_CLIENT (EMAIL)</label>
                            <input
                                name="clientEmail"
                                type="email"
                                required
                                className="w-full bg-background border border-border/50 rounded-[1rem] sm:rounded-[1.2rem] p-3 sm:p-4 text-[10px] sm:text-[11px] text-primary focus:outline-none focus:border-primary/50 transition-all font-black uppercase italic tracking-widest shadow-inner placeholder:text-secondary/10"
                                placeholder="CLIENT@COMPANY.COM"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                            <label className="text-[8px] sm:text-[9px] font-black text-secondary/40 uppercase tracking-[0.3em] sm:tracking-[0.4em] ml-2 italic">CATÉGORIE_UNIT</label>
                            <select name="category" className="w-full bg-background border border-border/50 rounded-[1rem] sm:rounded-[1.2rem] p-3 sm:p-4 text-[10px] sm:text-[11px] text-primary focus:outline-none transition-all font-black uppercase italic tracking-widest shadow-inner appearance-none">
                                <option value="WEB">WEB_APPLICATION</option>
                                <option value="MOBILE">MOBILE_APP</option>
                                <option value="AI">AI_INTEGRATION</option>
                                <option value="SAAS">SAAS_PLATFORM</option>
                                <option value="UIUX">UI_UX_REDESIGN</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[8px] sm:text-[9px] font-black text-secondary/40 uppercase tracking-[0.3em] sm:tracking-[0.4em] ml-2 italic">PRIORITÉ_DÉPLOIEMENT</label>
                            <select name="timeline" className="w-full bg-background border border-border/50 rounded-[1rem] sm:rounded-[1.2rem] p-3 sm:p-4 text-[10px] sm:text-[11px] text-primary focus:outline-none transition-all font-black uppercase italic tracking-widest shadow-inner appearance-none">
                                <option value="STANDARD">PROTOCOLE_STANDARD</option>
                                <option value="FAST">ACCÉLÉRATION_X2</option>
                                <option value="URGENT">MODE_URGENCE_CRITIQUE</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[8px] sm:text-[9px] font-black text-secondary/40 uppercase tracking-[0.3em] sm:tracking-[0.4em] ml-2 italic">STACK_TECHNIQUE (SÉPARÉ PAR VIRGULE)</label>
                        <input
                            name="techStack"
                            className="w-full bg-background border border-border/50 rounded-[1rem] sm:rounded-[1.2rem] p-3 sm:p-4 text-[10px] sm:text-[11px] text-primary focus:outline-none focus:border-primary/50 transition-all font-black uppercase italic tracking-widest shadow-inner"
                            placeholder="NEXT.JS, TAILWIND, SUPABASE..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[8px] sm:text-[9px] font-black text-secondary/40 uppercase tracking-[0.3em] sm:tracking-[0.4em] ml-2 italic">ALLOCATION_BUDGÉTAIRE (CFA)</label>
                        <input
                            name="budget"
                            type="number"
                            required
                            className="w-full bg-background border border-border/50 rounded-[1rem] sm:rounded-[1.2rem] p-3 sm:p-4 text-[10px] sm:text-[11px] text-primary focus:outline-none focus:border-primary/50 transition-all font-black uppercase italic tracking-widest shadow-inner"
                            placeholder="5000000"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[8px] sm:text-[9px] font-black text-secondary/40 uppercase tracking-[0.3em] sm:tracking-[0.4em] ml-2 italic">SPÉCIFICATIONS_TECHNIQUES</label>
                        <textarea
                            name="description"
                            rows={3}
                            className="w-full bg-background border border-border/50 rounded-[1.2rem] sm:rounded-[1.5rem] p-4 sm:p-5 text-[10px] sm:text-[11px] text-primary focus:outline-none focus:border-primary/50 transition-all font-black uppercase italic tracking-widest shadow-inner resize-none"
                            placeholder="DÉTAILS DU PROJET..."
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            disabled={loading}
                            className="w-full py-4 sm:py-6 bg-primary text-background rounded-[1.5rem] sm:rounded-[2rem] text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] shadow-2xl shadow-primary/20 hover:scale-[1.03] active:scale-95 transition-all duration-500 flex items-center justify-center gap-4 italic group"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                            ) : (
                                <>
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-background/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 border border-white/10">
                                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </div>
                                    LANCER_L_OPÉRATION
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Scanline effect */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
                    <div className="w-full h-[1px] bg-primary animate-scan-line" />
                </div>
            </div>
        </div>
    );
}

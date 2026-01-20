"use client";

import { useState } from "react";
import { Plus, X, Loader2, Edit } from "lucide-react";
import { createClientUser, updateUser } from "@/lib/actions/adminUserCRUD";

interface User {
    id: string;
    name: string | null;
    email: string;
    role: string;
}

interface UserCRUDModalProps {
    editingUser?: User;
    onClose?: () => void;
}

export default function UserCRUDModal({ editingUser, onClose }: UserCRUDModalProps) {
    const [isOpen, setIsOpen] = useState(!editingUser);
    const [loading, setLoading] = useState(false);
    const isEditing = !!editingUser;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        if (isEditing && editingUser) {
            await updateUser(editingUser.id, formData);
        } else {
            await createClientUser(formData);
        }
        setLoading(false);
        if (onClose) onClose();
        setIsOpen(false);
    };

    const handleClose = () => {
        setIsOpen(false);
        if (onClose) onClose();
    };

    if (!isOpen && !isEditing) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="px-10 py-5 bg-primary text-background rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all duration-500 flex items-center gap-4 italic group"
            >
                <div className="p-2 bg-background/20 rounded-lg group-hover:rotate-90 transition-transform duration-500">
                    <Plus className="w-4 h-4" />
                </div>
                INITIALISER_NOUVEAU_CLIENT
            </button>
        );
    }

    if (isEditing && !isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-3 text-[10px] font-black text-secondary/40 uppercase tracking-[0.3em] hover:text-primary transition-all italic group"
            >
                <div className="w-8 h-8 rounded-lg bg-background border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:text-background transition-all duration-500 shadow-inner group-hover:scale-110">
                    <Edit className="w-3.5 h-3.5" />
                </div>
                // MODIFIER_NODE
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10 animate-in fade-in duration-500">
            <div className="absolute inset-0 bg-background/60 backdrop-blur-xl" onClick={handleClose} />

            <div className="w-full max-w-xl bg-white border border-border/50 rounded-[3rem] p-12 relative shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 overflow-hidden group">
                {/* Visual accents */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/2 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/2 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none" />

                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-10 right-10 p-3 hover:bg-secondary/5 rounded-xl text-secondary/20 hover:text-primary transition-all duration-500 border border-transparent hover:border-border/50 group/close"
                >
                    <X className="w-5 h-5 group-hover/close:rotate-90 transition-transform duration-500" />
                </button>

                <div className="mb-12 relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="w-12 h-px bg-primary/20" />
                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em] italic">CONFIGURATION_PROFIL_CLI</span>
                    </div>
                    <h3 className="text-4xl font-black text-primary italic uppercase tracking-tighter leading-tight">
                        {isEditing ? "EDITION_NODE." : "REJOINDRE_MAINFRAME."}
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-2 italic">IDENTITÉ_DESIGNATION</label>
                        <div className="relative group/input">
                            <input
                                name="name"
                                required
                                defaultValue={editingUser?.name || ""}
                                className="w-full bg-background border border-border/50 rounded-[2rem] p-6 text-sm text-primary focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all duration-500 font-black uppercase italic tracking-widest shadow-inner placeholder:text-secondary/10"
                                placeholder="ENTIFIER_NOM..."
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-2 italic">FLUX_XFER_IDENTITY (EMAIL)</label>
                        <div className="relative group/input">
                            <input
                                name="email"
                                type="email"
                                required
                                defaultValue={editingUser?.email || ""}
                                className="w-full bg-background border border-border/50 rounded-[2rem] p-6 text-sm text-primary focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all duration-500 font-black uppercase italic tracking-widest shadow-inner placeholder:text-secondary/10"
                                placeholder="NODE@XFER.COM"
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-2 italic">NIVEAU_D_ACCES</label>
                            <div className="relative">
                                <select
                                    name="role"
                                    defaultValue={editingUser?.role || "CLIENT"}
                                    className="w-full bg-background border border-border/50 rounded-[2rem] p-6 text-sm text-primary focus:outline-none focus:border-primary/50 transition-all duration-500 font-black uppercase italic tracking-widest appearance-none shadow-inner"
                                >
                                    <option value="CLIENT">NODES_CLIENT</option>
                                    <option value="STAFF">UNITE_OPÉRATIONNELLE</option>
                                    <option value="ADMIN">MAINFRAME_ROOT</option>
                                </select>
                                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                                    <Plus className="w-4 h-4 rotate-45" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-6">
                        <button
                            disabled={loading}
                            className="w-full py-6 bg-primary text-background rounded-[2rem] text-xs font-black uppercase tracking-[0.4em] shadow-2xl shadow-primary/20 hover:scale-[1.03] active:scale-95 transition-all duration-500 flex items-center justify-center gap-4 italic group"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <div className="w-6 h-6 rounded-lg bg-background/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 border border-white/10">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                    {isEditing ? "METTRE_A_JOUR_LOGS" : "DÉPLOYER_COMPTE_CLI"}
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer Scanline */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
                    <div className="w-full h-[1px] bg-primary animate-scan-line" />
                </div>
            </div>
        </div>
    );
}

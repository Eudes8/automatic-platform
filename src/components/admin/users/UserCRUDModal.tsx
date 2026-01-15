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
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
                <Plus className="w-4 h-4" /> Nouveau Client
            </button>
        );
    }

    if (isEditing && !isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase underline decoration-slate-700 hover:decoration-white underline-offset-4 flex items-center gap-1"
            >
                <Edit className="w-3 h-3" /> Modifier
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

                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8">
                    {isEditing ? "Modifier l'Utilisateur" : "Ajouter un Client"}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nom Complet</label>
                        <input
                            name="name"
                            required
                            defaultValue={editingUser?.name || ""}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none"
                            placeholder="Ex: Jean Dupont"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            defaultValue={editingUser?.email || ""}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none"
                            placeholder="jean@entreprise.com"
                        />
                    </div>
                    {isEditing && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rôle</label>
                            <select
                                name="role"
                                defaultValue={editingUser?.role || "CLIENT"}
                                className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 outline-none"
                            >
                                <option value="CLIENT">Client</option>
                                <option value="STAFF">Staff</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                    )}

                    <button
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-black uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isEditing ? "Mettre à Jour" : "Créer le Client"}
                    </button>
                </form>
            </div>
        </div>
    );
}

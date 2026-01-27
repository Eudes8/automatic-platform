"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/actions/profile";
import { User, Building, Phone, Globe, Save, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

interface ProfileFormProps {
    user: {
        name: string | null;
        email: string;
        phone: string | null;
        companyName: string | null;
        industry: string | null;
    };
}

export default function ProfileForm({ user }: ProfileFormProps) {
    const [isPending, setIsPending] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        try {
            const result = await updateProfile(formData);
            if (result.success) {
                toast.success("Profil mis à jour avec succès", {
                    style: {
                        background: '#0a0a0a',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        letterSpacing: '0.1em',
                    }
                });
            } else {
                toast.error(result.error || "Une erreur est survenue");
            }
        } catch (error) {
            toast.error("Erreur de connexion");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-12 relative z-10">
            {/* Section Header */}
            <div className="flex items-center gap-5 mb-10">
                <div className="w-12 h-12 rounded-[1.2rem] bg-primary/5 border border-primary/20 flex items-center justify-center text-primary">
                    <User size={24} />
                </div>
                <div>
                    <h3 className="text-3xl font-black text-primary italic uppercase tracking-tighter leading-none">
                        IDENTITÉ.
                    </h3>
                    <p className="text-[9px] font-black text-secondary/30 uppercase tracking-[0.3em] mt-2 italic">Paramètres de base du compte</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Nom */}
                <div className="space-y-4 group/input">
                    <label className="flex items-center gap-3 text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-4 italic group-focus-within/input:text-primary transition-colors">
                        <User size={12} /> Nom Complet
                    </label>
                    <input
                        type="text"
                        name="name"
                        defaultValue={user.name || ""}
                        autoComplete="name"
                        className="w-full p-8 rounded-[2.5rem] bg-background/50 border border-border/50 text-primary font-black uppercase text-[13px] italic tracking-widest shadow-inner focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all duration-700 placeholder:text-secondary/10"
                        placeholder="Jean Dupont"
                    />
                </div>

                {/* E-mail (Read-only) */}
                <div className="space-y-4 opacity-60">
                    <label className="flex items-center gap-3 text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-4 italic">
                        <Globe size={12} /> Adresse E-mail (Fixe)
                    </label>
                    <div className="w-full p-8 rounded-[2.5rem] bg-slate-100/50 border border-border/30 text-secondary/50 font-black uppercase text-[13px] italic tracking-widest cursor-not-allowed">
                        {user.email}
                    </div>
                </div>

                {/* Téléphone */}
                <div className="space-y-4 group/input">
                    <label className="flex items-center gap-3 text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-4 italic group-focus-within/input:text-primary transition-colors">
                        <Phone size={12} /> Téléphone
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        defaultValue={user.phone || ""}
                        autoComplete="tel"
                        className="w-full p-8 rounded-[2.5rem] bg-background/50 border border-border/50 text-primary font-black uppercase text-[13px] italic tracking-widest shadow-inner focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all duration-700 placeholder:text-secondary/10"
                        placeholder="+225 XX XX XX XX XX"
                    />
                </div>

                {/* Entreprise */}
                <div className="space-y-4 group/input">
                    <label className="flex items-center gap-3 text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-4 italic group-focus-within/input:text-primary transition-colors">
                        <Building size={12} /> Entreprise
                    </label>
                    <input
                        type="text"
                        name="companyName"
                        defaultValue={user.companyName || ""}
                        className="w-full p-8 rounded-[2.5rem] bg-background/50 border border-border/50 text-primary font-black uppercase text-[13px] italic tracking-widest shadow-inner focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all duration-700 placeholder:text-secondary/10"
                        placeholder="Société SARL"
                    />
                </div>

                {/* Secteur d'activité */}
                <div className="space-y-4 group/input md:col-span-2">
                    <label className="flex items-center gap-3 text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-4 italic group-focus-within/input:text-primary transition-colors">
                        <Globe size={12} /> Secteur d'Activité
                    </label>
                    <input
                        type="text"
                        name="industry"
                        defaultValue={user.industry || ""}
                        className="w-full p-8 rounded-[2.5rem] bg-background/50 border border-border/50 text-primary font-black uppercase text-[13px] italic tracking-widest shadow-inner focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all duration-700 placeholder:text-secondary/10"
                        placeholder="Digital / BTP / Finance..."
                    />
                </div>
            </div>

            {/* Actions Area */}
            <div className="mt-20 pt-16 border-t border-border/30 flex flex-col sm:flex-row justify-between items-center gap-8 relative z-10">
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full sm:w-auto px-16 py-7 bg-primary text-background font-black uppercase text-[11px] tracking-[0.4em] rounded-[2rem] shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-500 italic flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            SYNCHRONISATION...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            ENREGISTRER_LES_MODIFICATIONS
                        </>
                    )}
                </button>
                <div className="flex items-center gap-4 text-secondary/20 font-black text-[9px] uppercase tracking-widest italic group">
                    <Shield size={14} className="group-hover:text-emerald-500 transition-colors" />
                    DONNÉES_SÉCURISÉES_SSL_256
                </div>
            </div>
        </form>
    );
}

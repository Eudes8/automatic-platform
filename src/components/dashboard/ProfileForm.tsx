"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/actions/profile";
import { User, Building, Phone, Globe, Save, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

import { User as UserType } from "@prisma/client";

interface ProfileFormProps {
    user: Partial<UserType> & { email: string };
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
        <form action={handleSubmit} className="space-y-8 sm:space-y-12 relative z-10">
            {/* Section Header */}
            <div className="flex items-center gap-3 sm:gap-5 mb-6 sm:mb-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[1rem] sm:rounded-[1.2rem] bg-primary/5 border border-primary/20 flex items-center justify-center text-primary">
                    <User className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-primary uppercase tracking-tight leading-none">
                        Profil
                    </h3>
                    <p className="text-[8px] sm:text-[9px] font-bold text-secondary/30 uppercase tracking-widest mt-1 sm:mt-2">Informations de base de votre compte</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                {/* Nom */}
                <div className="space-y-3 sm:space-y-4 group/input">
                    <label className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-bold text-secondary/40 uppercase tracking-widest ml-3 sm:ml-4 group-focus-within/input:text-primary transition-colors">
                        <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Nom Complet
                    </label>
                    <input
                        type="text"
                        name="name"
                        defaultValue={user.name || ""}
                        autoComplete="name"
                        className="w-full p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-background/50 border border-border/50 text-primary font-bold uppercase text-[11px] sm:text-[13px] tracking-widest shadow-inner focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all duration-700 placeholder:text-secondary/10"
                        placeholder="Jean Dupont"
                    />
                </div>

                {/* E-mail (Read-only) */}
                <div className="space-y-3 sm:space-y-4 opacity-60">
                    <label className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-bold text-secondary/40 uppercase tracking-widest ml-3 sm:ml-4">
                        <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Adresse E-mail
                    </label>
                    <div className="w-full p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-slate-100/50 border border-border/30 text-secondary/50 font-bold uppercase text-[11px] sm:text-[13px] tracking-widest cursor-not-allowed">
                        {user.email}
                    </div>
                </div>

                {/* Téléphone */}
                <div className="space-y-3 sm:space-y-4 group/input">
                    <label className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-bold text-secondary/40 uppercase tracking-widest ml-3 sm:ml-4 group-focus-within/input:text-primary transition-colors">
                        <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Téléphone
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        defaultValue={user.phone || ""}
                        autoComplete="tel"
                        className="w-full p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-background/50 border border-border/50 text-primary font-bold uppercase text-[11px] sm:text-[13px] tracking-widest shadow-inner focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all duration-700 placeholder:text-secondary/10"
                        placeholder="+225 XX XX XX XX XX"
                    />
                </div>

                {/* Entreprise */}
                <div className="space-y-3 sm:space-y-4 group/input">
                    <label className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-bold text-secondary/40 uppercase tracking-widest ml-3 sm:ml-4 group-focus-within/input:text-primary transition-colors">
                        <Building className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Entreprise
                    </label>
                    <input
                        type="text"
                        name="companyName"
                        defaultValue={user.companyName || ""}
                        className="w-full p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-background/50 border border-border/50 text-primary font-bold uppercase text-[11px] sm:text-[13px] tracking-widest shadow-inner focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all duration-700 placeholder:text-secondary/10"
                        placeholder="Société SARL"
                    />
                </div>

                {/* Secteur d'activité */}
                <div className="space-y-3 sm:space-y-4 group/input md:col-span-2">
                    <label className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-bold text-secondary/40 uppercase tracking-widest ml-3 sm:ml-4 group-focus-within/input:text-primary transition-colors">
                        <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Secteur d'Activité
                    </label>
                    <input
                        type="text"
                        name="industry"
                        defaultValue={user.industry || ""}
                        className="w-full p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-background/50 border border-border/50 text-primary font-bold uppercase text-[11px] sm:text-[13px] tracking-widest shadow-inner focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all duration-700 placeholder:text-secondary/10"
                        placeholder="Digital / BTP / Finance..."
                    />
                </div>
            </div>

            {/* Actions Area */}
            <div className="mt-12 sm:mt-20 pt-10 sm:pt-16 border-t border-border/30 flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8 relative z-10">
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full sm:w-auto px-10 sm:px-16 py-5 sm:py-7 bg-primary text-background font-bold uppercase text-[10px] sm:text-[11px] tracking-widest rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-500 flex items-center justify-center gap-3 sm:gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                            Synchronisation...
                        </>
                    ) : (
                        <>
                            <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Enregistrer les modifications
                        </>
                    )}
                </button>
                <div className="flex items-center gap-3 sm:gap-4 text-secondary/20 font-bold text-[8px] sm:text-[9px] uppercase tracking-widest group">
                    <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:text-emerald-500 transition-colors" />
                    Données sécurisées
                </div>
            </div>
        </form>
    );
}

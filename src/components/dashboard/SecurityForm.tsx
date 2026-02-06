"use client";

import { useState } from "react";
import { Shield, Lock, Smartphone, Fingerprint, Mail, Key, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SecurityForm({ email }: { email: string }) {
    const [isPending, setIsPending] = useState(false);
    const [lastResetSent, setLastResetSent] = useState<Date | null>(null);

    async function handlePasswordReset() {
        setIsPending(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
            });

            if (error) throw error;

            setLastResetSent(new Date());
            toast.success("E-mail de réinitialisation envoyé", {
                description: "Vérifiez votre boîte de réception pour changer votre mot de passe.",
                className: "glass-premium rounded-2xl border-premium p-4 font-bold text-xs uppercase tracking-widest",
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Une erreur est survenue.";
            toast.error("Erreur", {
                description: message,
            });
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="space-y-8 sm:space-y-12 relative z-10">
            {/* Section Header */}
            <div className="flex items-center gap-3 sm:gap-5 mb-6 sm:mb-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[1rem] sm:rounded-[1.2rem] bg-amber-500/5 border border-amber-500/20 flex items-center justify-center text-amber-500">
                    <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-primary uppercase tracking-tight leading-none">
                        Sécurité
                    </h3>
                    <p className="text-[8px] sm:text-[9px] font-bold text-secondary/30 uppercase tracking-widest mt-1 sm:mt-2">Protection de vos accès et données</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Password Reset */}
                <div className="bg-white/50 backdrop-blur-xl border border-border/50 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 space-y-4 sm:space-y-6 hover:border-primary/30 transition-all duration-500 group">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                            <Key className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <h4 className="text-[10px] sm:text-[11px] font-bold text-primary uppercase tracking-widest">Mot de passe</h4>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-secondary/40 font-bold leading-relaxed">
                        Pour des raisons de sécurité, la modification du mot de passe se fait via un lien sécurisé envoyé à votre adresse e-mail.
                    </p>
                    <button
                        onClick={handlePasswordReset}
                        disabled={isPending}
                        className="w-full py-4 sm:py-5 bg-primary text-background font-bold uppercase text-[9px] sm:text-[10px] tracking-widest rounded-2xl shadow-xl shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50"
                    >
                        {isPending ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                        Réinitialiser mon accès
                    </button>
                    {lastResetSent && (
                        <div className="flex items-center gap-2 text-[7px] sm:text-[8px] font-black text-emerald-500 uppercase tracking-widest italic justify-center">
                            <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Dernier envoi : {lastResetSent.toLocaleTimeString()}
                        </div>
                    )}
                </div>

                {/* 2FA (Mockup) */}
                <div className="bg-slate-50/50 backdrop-blur-xl border border-border/30 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 space-y-4 sm:space-y-6 opacity-60">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary/40">
                            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <h4 className="text-[10px] sm:text-[11px] font-bold text-secondary/40 uppercase tracking-widest">Double Authentification</h4>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-secondary/40 font-bold leading-relaxed">
                        Ajoutez une couche de sécurité supplémentaire via application mobile ou SMS. (Prochainement)
                    </p>
                    <div className="w-full py-4 sm:py-5 bg-secondary/5 border border-dashed border-secondary/20 text-secondary/20 font-bold uppercase text-[9px] sm:text-[10px] tracking-widest rounded-2xl flex items-center justify-center gap-2 sm:gap-3 cursor-not-allowed">
                        <Fingerprint className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Indisponible
                    </div>
                </div>
            </div>

            {/* Session Info */}
            <div className="pt-8 sm:pt-12 border-t border-border/30">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary/30" />
                    <span className="text-[8px] sm:text-[9px] font-bold text-secondary/30 uppercase tracking-widest">Sessions actives</span>
                </div>
                <div className="p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 sm:gap-5">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <div>
                            <p className="text-[9px] sm:text-[10px] font-bold text-primary uppercase tracking-widest">Session Actuelle</p>
                            <p className="text-[8px] sm:text-[9px] font-bold text-secondary/40 uppercase tracking-widest mt-1">IP: {email === 'automaticbmje@gmail.com' ? '41.202.219.124' : 'Protégé'} // Côte d'Ivoire</p>
                        </div>
                    </div>
                    <span className="text-[7px] sm:text-[8px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-500/10 px-3 sm:px-4 py-1.5 rounded-full border border-emerald-500/20">Sécurisé</span>
                </div>
            </div>
        </div>
    );
}

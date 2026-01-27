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
        } catch (error: any) {
            toast.error("Erreur", {
                description: error.message || "Une erreur est survenue.",
            });
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="space-y-12 relative z-10">
            {/* Section Header */}
            <div className="flex items-center gap-5 mb-10">
                <div className="w-12 h-12 rounded-[1.2rem] bg-amber-500/5 border border-amber-500/20 flex items-center justify-center text-amber-500">
                    <Lock size={24} />
                </div>
                <div>
                    <h3 className="text-3xl font-black text-primary italic uppercase tracking-tighter leading-none">
                        SÉCURITÉ.
                    </h3>
                    <p className="text-[9px] font-black text-secondary/30 uppercase tracking-[0.3em] mt-2 italic">Protection de vos accès et protocoles</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Password Reset */}
                <div className="bg-white/50 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-10 space-y-6 hover:border-primary/30 transition-all duration-500 group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                            <Key size={18} />
                        </div>
                        <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] italic">Mot de passe</h4>
                    </div>
                    <p className="text-[10px] text-secondary/40 font-bold leading-relaxed italic">
                        Pour des raisons de sécurité, la modification du mot de passe se fait via un lien crypté envoyé à votre adresse e-mail.
                    </p>
                    <button
                        onClick={handlePasswordReset}
                        disabled={isPending}
                        className="w-full py-5 bg-primary text-background font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                        RÉINITIALISER_ACCÈS
                    </button>
                    {lastResetSent && (
                        <div className="flex items-center gap-2 text-[8px] font-black text-emerald-500 uppercase tracking-widest italic justify-center">
                            <CheckCircle2 size={12} /> Dernier envoi : {lastResetSent.toLocaleTimeString()}
                        </div>
                    )}
                </div>

                {/* 2FA (Mockup) */}
                <div className="bg-slate-50/50 backdrop-blur-xl border border-border/30 rounded-[2.5rem] p-10 space-y-6 opacity-60">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary/40">
                            <Smartphone size={18} />
                        </div>
                        <h4 className="text-[11px] font-black text-secondary/40 uppercase tracking-[0.2em] italic">Auth. Double Facteur</h4>
                    </div>
                    <p className="text-[10px] text-secondary/40 font-bold leading-relaxed italic">
                        Ajoutez une couche de sécurité supplémentaire via application mobile ou SMS. (Prochainement)
                    </p>
                    <div className="w-full py-5 bg-secondary/5 border border-dashed border-secondary/20 text-secondary/20 font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 cursor-not-allowed">
                        <Fingerprint size={16} />
                        INDISPONIBLE
                    </div>
                </div>
            </div>

            {/* Session Info */}
            <div className="pt-12 border-t border-border/30">
                <div className="flex items-center gap-4 mb-6">
                    <Shield size={16} className="text-primary/30" />
                    <span className="text-[9px] font-black text-secondary/30 uppercase tracking-[0.4em] italic">SESSIONS_ACTIVES // LOGS</span>
                </div>
                <div className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">Session Actuelle</p>
                            <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-[0.2em] italic mt-1">IP: {email === 'automaticbmje@gmail.com' ? '41.202.219.124' : 'Protégé'} // Côte d'Ivoire</p>
                        </div>
                    </div>
                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.3em] italic bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">SÉCURISÉ</span>
                </div>
            </div>
        </div>
    );
}

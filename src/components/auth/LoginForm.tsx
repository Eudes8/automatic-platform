"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, Zap } from "lucide-react";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [magicLinkSent, setMagicLinkSent] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setMessage(error.message);
        } else {
            window.location.href = "/dashboard";
        }
        setLoading(false);
    };

    const handleMagicLink = async () => {
        if (!email) {
            setMessage("Veuillez saisir votre email.");
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/dashboard`,
            }
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMagicLinkSent(true);
        }
        setLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md p-10 glass-premium rounded-[3rem]"
        >
            <div className="flex flex-col items-center mb-10">
                <div className="relative w-12 h-12 flex items-center justify-center mb-6">
                    <div className="absolute inset-0 bg-primary rounded-xl rotate-45" />
                    <div className="absolute inset-0 bg-primary/20 rounded-xl -rotate-12" />
                    <span className="relative text-background font-black text-lg">A</span>
                </div>
                <h2 className="text-3xl font-heading font-bold text-primary tracking-tight">Bienvenue</h2>
                <p className="text-secondary font-medium tracking-wide text-xs mt-2 uppercase">Console Client Automatic</p>
            </div>

            {magicLinkSent ? (
                <div className="text-center py-8">
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-primary mb-2">Vérifiez vos emails</h3>
                    <p className="text-secondary text-sm leading-relaxed font-medium">
                        Un lien de connexion magique a été envoyé à <br />
                        <span className="text-primary font-bold">{email}</span>.
                    </p>
                    <button
                        onClick={() => setMagicLinkSent(false)}
                        className="mt-10 text-[11px] font-bold text-secondary uppercase tracking-[0.2em] hover:text-primary transition-colors"
                    >
                        Retour à la connexion
                    </button>
                </div>
            ) : (
                <>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-secondary uppercase tracking-[0.2em] ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    placeholder="votre@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-background/50 border border-border rounded-2xl focus:border-primary outline-none text-primary transition-all font-medium text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[11px] font-bold text-secondary uppercase tracking-[0.2em]">Mot de passe</label>
                                <button
                                    type="button"
                                    onClick={handleMagicLink}
                                    className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400"
                                >
                                    Mode sans mot de passe ?
                                </button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-background/50 border border-border rounded-2xl focus:border-primary outline-none text-primary transition-all font-medium text-sm"
                                />
                            </div>
                        </div>

                        {message && (
                            <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center bg-red-500/10 py-2 rounded-lg">{message}</p>
                        )}

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-5 bg-primary text-background font-bold rounded-2xl transition-all active:scale-[0.98] shadow-xl shadow-primary/5 flex items-center justify-center gap-2 uppercase text-xs tracking-[0.2em]"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Se Connecter"}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-border text-center">
                        <p className="text-secondary text-xs font-medium">
                            Nouveau ici ? {" "}
                            <a href="/onboarding" className="text-primary font-bold hover:underline">Initialiser mon projet</a>
                        </p>
                    </div>
                </>
            )}
        </motion.div>
    );
}

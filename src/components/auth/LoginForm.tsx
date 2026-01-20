"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, Zap } from "lucide-react";
import Image from "next/image";

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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="w-full max-w-lg p-12 bg-white/40 backdrop-blur-3xl border border-border/50 rounded-[3rem] shadow-2xl relative overflow-hidden group"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/2 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

            <div className="flex flex-col items-center mb-16 relative z-10">
                <div className="w-20 h-20 rounded-[1.8rem] bg-primary text-background flex items-center justify-center shadow-2xl shadow-primary/30 mb-8 border border-white/20 hover:scale-110 transition-transform duration-500">
                    <Zap size={32} className="animate-pulse" />
                </div>
                <h2 className="text-4xl md:text-5xl font-heading font-black text-primary tracking-tighter uppercase italic leading-none mb-4 text-center">
                    AUTH_LOGIN<br /><span className="text-secondary/20 tracking-normal">SESSION_ACCESS.</span>
                </h2>
                <div className="flex items-center gap-3">
                    <span className="w-12 h-px bg-border/50" />
                    <p className="text-secondary/20 font-black uppercase text-[9px] tracking-[0.5em] italic">CONSOLE_MAIN_UNIT</p>
                    <span className="w-12 h-px bg-border/50" />
                </div>
            </div>

            {magicLinkSent ? (
                <div className="text-center py-10 relative z-10">
                    <div className="w-24 h-24 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-center justify-center mx-auto mb-10 shadow-inner">
                        <Mail className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-heading font-black text-primary mb-4 uppercase italic tracking-tighter">DATA_XFER_SENT.</h3>
                    <p className="text-secondary/60 text-sm leading-relaxed font-bold italic uppercase tracking-tight mb-12">
                        Un lien de connexion magique a été injecté dans le flux de :<br />
                        <span className="text-primary font-black underline underline-offset-4 decoration-primary/30">{email}</span>
                    </p>
                    <button
                        onClick={() => setMagicLinkSent(false)}
                        className="px-10 py-5 bg-secondary/5 border border-border/50 rounded-[1.5rem] text-[10px] font-black text-secondary/40 uppercase tracking-[0.3em] hover:text-primary hover:border-primary/20 transition-all italic hover:shadow-xl"
                    >
                        // RÉINITIALISER_SÉQUENCE
                    </button>
                </div>
            ) : (
                <>
                    <form onSubmit={handleLogin} className="space-y-8 relative z-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-2 italic">IDENTIFIANT_XFER</label>
                            <div className="relative group/input">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/20 group-focus-within/input:text-primary transition-colors duration-500" />
                                <input
                                    type="email"
                                    placeholder="NODE_IDENTITY@V9.COM"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-16 pr-6 py-6 bg-background border border-border/50 rounded-[2rem] focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none text-primary transition-all duration-500 font-black text-xs uppercase italic placeholder:text-secondary/10 placeholder:font-black tracking-widest shadow-inner"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-2">
                                <label className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em] italic">PASS_PHRASE</label>
                                <button
                                    type="button"
                                    onClick={handleMagicLink}
                                    className="text-[9px] font-black text-blue-500/40 uppercase tracking-widest hover:text-blue-500 transition-colors italic hover:underline decoration-blue-500/20 underline-offset-4"
                                >
                                    // BYPASS_CODE?
                                </button>
                            </div>
                            <div className="relative group/input">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/20 group-focus-within/input:text-primary transition-colors duration-500" />
                                <input
                                    type="password"
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-16 pr-6 py-6 bg-background border border-border/50 rounded-[2rem] focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none text-primary transition-all duration-500 font-black text-xs placeholder:text-secondary/10 shadow-inner"
                                />
                            </div>
                        </div>

                        {message && (
                            <div className="p-4 bg-accent/5 border border-accent/20 rounded-[1.5rem] flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                <p className="text-accent text-[9px] font-black uppercase tracking-[0.2em] italic leading-tight">{message}</p>
                            </div>
                        )}

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-6 bg-primary text-background font-black rounded-[2rem] transition-all duration-500 hover:scale-[1.03] active:scale-95 shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 uppercase text-[11px] tracking-[0.4em] italic hover:shadow-primary/40"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "ACCÉDER_CONTRÔLE_MAIN"}
                        </button>
                    </form>

                    <div className="mt-16 pt-10 border-t border-border/50 text-center relative z-10">
                        <p className="text-secondary/40 text-[10px] font-bold uppercase tracking-[0.2em] italic">
                            NODE_ORPHELIN ? {" "}
                            <a href="/onboarding" className="text-primary font-black hover:underline underline-offset-4 decoration-primary/30 ml-2 transition-all">INITIALISER_PROJET</a>
                        </p>
                    </div>
                </>
            )}

            {/* Background scanner line effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
                <div className="w-full h-[1px] bg-primary animate-scan-line" />
            </div>
        </motion.div>
    );
}

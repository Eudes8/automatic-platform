"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Plus, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const formSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Format d'identifiant XFER invalide"),
    password: z.string().min(6, "Le protocole de sécurité requiert 6 caractères min."),
});

type FormValues = z.infer<typeof formSchema>;

export default function RegisterForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    async function onSubmit(data: FormValues) {
        setIsLoading(true);
        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast.success("ACCÈS_CRÉÉ: Protocole de bienvenue initialisé");
                router.push("/login");
            } else {
                const errorData = await response.json();
                toast.error(`ERREUR_SYNC: ${errorData.message || "Échec de l'enregistrement"}`);
            }
        } catch (error) {
            toast.error("ERREUR_SYSTÈME: Connexion au Mainframe interrompue");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-lg"
        >
            <div className="bg-white/40 backdrop-blur-3xl border border-border/50 rounded-[3.5rem] p-12 lg:p-16 shadow-2xl relative overflow-hidden group">
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

                <div className="mb-14 relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <Plus size={24} />
                        </div>
                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.5em] italic">AUTH_REGISTER_V1 // UNIT_NEW</span>
                    </div>

                    <h2 className="text-5xl font-black text-primary italic uppercase tracking-tighter leading-[0.85] mb-6">
                        INITIALISER <br />
                        <span className="text-accent">ACCÈS.</span>
                    </h2>
                    <p className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em] italic max-w-[280px] leading-relaxed">
                        // CRÉATION_DE_NODE_DANS_L_ÉCOSYSTÈME_AUTOMATIC.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 relative z-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-4 italic flex items-center gap-2">
                            IDENTITÉ_NOM <span className="text-primary/20">// NOM_COMPLET</span>
                        </label>
                        <div className="relative group/input">
                            <input
                                {...register("name")}
                                className="w-full bg-background border border-border/50 rounded-[2rem] p-8 text-sm text-primary focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all duration-500 font-black uppercase italic tracking-widest shadow-inner placeholder:text-secondary/10"
                                placeholder="STATION_NAME_IDENTIFIER"
                            />
                            {errors.name && (
                                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-3 ml-4 animate-pulse">
                                    // {errors.name.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-4 italic flex items-center gap-2">
                            FLUX_XFER_IDENTITY <span className="text-primary/20">// EMAIL</span>
                        </label>
                        <div className="relative group/input">
                            <input
                                {...register("email")}
                                type="email"
                                className="w-full bg-background border border-border/50 rounded-[2rem] p-8 text-sm text-primary focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all duration-500 font-black uppercase italic tracking-widest shadow-inner placeholder:text-secondary/10"
                                placeholder="NODE@SYSTEMX.COM"
                            />
                            {errors.email && (
                                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-3 ml-4 animate-pulse">
                                    // {errors.email.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-secondary/40 uppercase tracking-[0.4em] ml-4 italic flex items-center gap-2">
                            PROTOCOLE_SÉCURITÉ <span className="text-primary/20">// PASSWORD</span>
                        </label>
                        <div className="relative group/input">
                            <input
                                {...register("password")}
                                type="password"
                                className="w-full bg-background border border-border/50 rounded-[2rem] p-8 text-sm text-primary focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all duration-500 font-black uppercase italic tracking-widest shadow-inner placeholder:text-secondary/10"
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-3 ml-4 animate-pulse">
                                    // {errors.password.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="pt-8 space-y-8">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-8 bg-primary text-background rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-500 flex items-center justify-center gap-5 italic group/btn overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    SYNC_MAIN_DATABASE
                                    <div className="p-2 bg-background/20 rounded-lg group-hover/btn:translate-x-2 transition-transform duration-500">
                                        <ArrowRight size={16} />
                                    </div>
                                </>
                            )}
                        </button>

                        <div className="flex items-center justify-center gap-4">
                            <div className="h-px flex-1 bg-border/30" />
                            <span className="text-[9px] font-black text-secondary/20 uppercase tracking-[0.3em] italic">AUTRES_ACTIONS</span>
                            <div className="h-px flex-1 bg-border/30" />
                        </div>

                        <div className="space-y-4">
                            <button
                                type="button"
                                onClick={() => router.push("/login")}
                                className="w-full py-6 border border-border/50 hover:border-primary/30 rounded-[1.8rem] text-[9px] font-black text-secondary/40 hover:text-primary uppercase tracking-[0.3em] transition-all duration-500 italic bg-white/50"
                            >
                                // DÉJÀ_MEMBRE?_SE_CONNECTER
                            </button>
                        </div>
                    </div>
                </form>

                {/* Footer Scanline */}
                <div className="absolute inset-x-0 bottom-0 overflow-hidden h-[2px] opacity-[0.05] pointer-events-none">
                    <div className="w-full h-full bg-primary animate-scan-line" />
                </div>
            </div>

            {/* Technical disclaimer */}
            <div className="mt-12 flex items-center gap-4 px-10">
                <ShieldCheck className="text-emerald-500 w-5 h-5" />
                <p className="text-[8px] font-black text-secondary/20 uppercase tracking-[0.2em] italic max-w-sm leading-relaxed">
                    VOTRE_NODE_EST_SÉCURISÉ_VIA_UN_CHIFFREMENT_INDUSTRIEL_V2_SYSTÈME_D_IDENTITÉ_DÉPLOYÉ_SUR_NODES_ALPHA.
                </p>
            </div>
        </motion.div>
    );
}

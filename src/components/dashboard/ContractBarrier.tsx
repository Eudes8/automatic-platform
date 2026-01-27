"use client";

import { motion } from "framer-motion";
import { ShieldAlert, FileCheck, ArrowRight, Terminal } from "lucide-react";
import { useState } from "react";
import ContractSigner from "./ContractSigner";
import { signContract } from "@/lib/actions/projects";

interface ContractBarrierProps {
    projectName: string;
    projectId: string;
    clientName?: string;
    budget?: string;
    description?: string;
}

export default function ContractBarrier({ projectName, projectId, clientName, budget, description }: ContractBarrierProps) {
    const [isSignerOpen, setIsSignerOpen] = useState(false);

    return (
        <div className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-3xl flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="max-w-2xl w-full bg-background border border-border/50 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl"
            >
                {/* Decorative elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />

                <div className="relative z-10">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <Terminal className="w-5 h-5 text-accent animate-pulse" />
                        <span className="text-accent font-black tracking-[0.4em] uppercase text-[10px] italic">ACCÈS SÉCURISÉ // DOCUMENTS LÉGAUX</span>
                    </div>

                    <div className="w-24 h-24 bg-primary/5 border border-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                        <ShieldAlert className="w-12 h-12 text-primary" />
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black text-primary italic uppercase tracking-tighter mb-6 leading-tight">
                        Signature <br /><span className="text-secondary/20">Requise.</span>
                    </h2>

                    <p className="text-secondary/60 text-lg mb-12 leading-relaxed font-medium italic">
                        Afin d'accéder à votre espace de travail et lancer le projet <span className="text-primary font-black not-italic">"{projectName}"</span>,
                        la signature du contrat de prestation est nécessaire.
                    </p>

                    <div className="bg-secondary/5 border border-secondary/5 rounded-3xl p-8 mb-12 text-left flex items-start gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-background border border-border/50 flex items-center justify-center shrink-0">
                            <FileCheck className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h4 className="text-primary font-black text-[11px] uppercase tracking-widest mb-1 italic">Sécurisation du Partenariat</h4>
                            <p className="text-secondary/40 text-[11px] leading-relaxed font-bold uppercase tracking-wider">
                                Ce document définit les jalons de production, votre budget {budget ? `(${budget})` : ""} et garantit la protection de vos actifs intellectuels.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <button
                            onClick={() => setIsSignerOpen(true)}
                            className="w-full py-6 bg-primary text-background font-black rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-4 uppercase tracking-[0.3em] group text-xs italic"
                        >
                            Consulter et signer le contrat <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <p className="text-[9px] text-secondary/20 font-black uppercase tracking-[0.4em] italic">
                            // CONNEXION SÉCURISÉE // CERTIFICATION SSL ACTIVE
                        </p>
                    </div>
                </div>
            </motion.div>

            <ContractSigner
                isOpen={isSignerOpen}
                onClose={() => setIsSignerOpen(false)}
                projectName={projectName}
                projectId={projectId}
                clientName={clientName}
                budget={budget}
                description={description}
                onSign={async (signatureData) => {
                    try {
                        console.log("ContractBarrier: Signing contract...", { projectId });
                        const result = await signContract(projectId, signatureData);
                        console.log("ContractBarrier: Sign result:", result);
                        if (result.success) {
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        } else {
                            const errorMsg = typeof result.error === 'string'
                                ? result.error
                                : JSON.stringify(result.error);
                            console.error("ContractBarrier: Sign failed:", errorMsg);
                            alert(`❌ Erreur lors de la signature: ${errorMsg}`);
                            setIsSignerOpen(false);
                        }
                    } catch (error) {
                        const errorMsg = error instanceof Error ? error.message : String(error);
                        console.error("ContractBarrier: Error signing contract:", error);
                        alert(`❌ Erreur lors de la signature du contrat: ${errorMsg}`);
                        setIsSignerOpen(false);
                    }
                }}
            />
        </div>
    );
}

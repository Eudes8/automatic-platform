"use client";

import { motion } from "framer-motion";
import { ShieldAlert, FileCheck, ArrowRight } from "lucide-react";
import { useState } from "react";
import ContractSigner from "./ContractSigner";
import { signContract } from "@/lib/actions/projects";

interface ContractBarrierProps {
    projectName: string;
    projectId: string;
    clientName?: string;
    budget?: string;
}

export default function ContractBarrier({ projectName, projectId, clientName, budget }: ContractBarrierProps) {
    const [isSignerOpen, setIsSignerOpen] = useState(false);

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="max-w-2xl w-full bg-slate-900 border border-blue-500/20 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl shadow-blue-500/10"
            >
                {/* Decorative elements */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]" />

                <div className="relative z-10">
                    <div className="w-20 h-20 bg-blue-600/10 border border-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <ShieldAlert className="w-10 h-10 text-blue-500" />
                    </div>

                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
                        Validation <span className="text-blue-500">Obligatoire.</span>
                    </h2>

                    <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">
                        Pour activer votre siège virtuel et lancer le projet <span className="text-white font-bold">"{projectName}"</span>,
                        vous devez signer électroniquement le contrat d'engagement.
                    </p>

                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-10 text-left flex items-start gap-4">
                        <FileCheck className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
                        <div>
                            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-1">Protection Bilatérale</h4>
                            <p className="text-slate-500 text-xs leading-relaxed">
                                Ce contrat garantit vos délais, votre budget {budget ? `(${budget})` : ""} et la propriété intellectuelle de votre application dès la première ligne de code.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => setIsSignerOpen(true)}
                            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 uppercase tracking-widest group"
                        >
                            Signer le contrat maintenant <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
                            Processus sécurisé via signature électronique certifiée
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
                onSign={async (signatureData) => {
                    await signContract(projectId, signatureData);
                    window.location.reload();
                }}
            />
        </div>
    );
}

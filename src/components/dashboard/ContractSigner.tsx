"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X, Check, Trash2, Download } from "lucide-react";
import { generateProjectContract, downloadBlob } from "@/lib/utils/pdf";

interface ContractSignerProps {
    onSign: (signature: string) => void;
    isOpen: boolean;
    onClose: () => void;
    projectName?: string;
    clientName?: string;
    budget?: string;
    projectId?: string;
}

export default function ContractSigner({
    onSign,
    isOpen,
    onClose,
    projectName = "Projet en cours",
    clientName = "Client",
    budget = "Non spécifié",
    projectId = "UNKNOWN"
}: ContractSignerProps) {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [signed, setSigned] = useState(false);
    const currentYear = new Date().getFullYear();
    const displayId = projectId !== "UNKNOWN" ? projectId.slice(-6).toUpperCase() : Math.floor(Math.random() * 9000) + 1000;

    const clear = () => {
        sigCanvas.current?.clear();
        setSigned(false);
    };

    const save = async () => {
        if (sigCanvas.current?.isEmpty()) return;
        const signatureData = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");
        if (signatureData) {
            // 1. Generate PDF
            const pdfBytes = await generateProjectContract(projectName, clientName, budget, signatureData, projectId);

            // 2. Download local copy for the user
            const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
            downloadBlob(blob, `Contrat_AUTOMATIC_${projectName.replace(/\s+/g, "_")}.pdf`);

            onSign(signatureData);
            setSigned(true);
            setTimeout(onClose, 1500);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter">Signature du Contrat</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Document ID: #AUT-{currentYear}-{displayId}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="mb-6 h-48 bg-slate-950 rounded-2xl border-2 border-dashed border-slate-800 relative group transition-colors hover:border-blue-500/50">
                                {!signed ? (
                                    <SignatureCanvas
                                        ref={sigCanvas}
                                        canvasProps={{
                                            className: "w-full h-full cursor-crosshair",
                                        }}
                                        onBegin={() => setSigned(false)}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-600/10 text-blue-400">
                                        <Check className="w-16 h-16 mb-2 animate-bounce" />
                                        <p className="font-bold uppercase tracking-widest text-sm">Contrat Signé avec Succès</p>
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest pointer-events-none">
                                    Zone de signature manuscrite
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex gap-2">
                                    <button
                                        onClick={clear}
                                        disabled={signed}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all text-sm font-bold disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" /> EFFACER
                                    </button>
                                </div>

                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-6 py-3 rounded-xl border border-white/5 text-slate-400 hover:text-white transition-all text-sm font-bold"
                                    >
                                        ANNULER
                                    </button>
                                    <button
                                        onClick={save}
                                        disabled={signed}
                                        className="flex-1 flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm transition-all disabled:bg-green-600 shadow-lg shadow-blue-500/20"
                                    >
                                        {signed ? <><Check className="w-4 h-4" /> VALIDÉ</> : <><Download className="w-4 h-4" /> SIGNER & ENVOYER</>}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-950/50 border-t border-white/5 text-center">
                            <p className="text-[10px] text-slate-600 font-medium leading-tight">
                                En signant ce document, vous acceptez les Conditions Générales de Vente d'AUTOMATIC.<br />
                                Signature à valeur légale conformément à la directive 1999/93/CE.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

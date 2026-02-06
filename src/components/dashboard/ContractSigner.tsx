"use client";

import { useRef, useState, useMemo } from "react";
import SignatureCanvas from "react-signature-canvas";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X, Check, Trash2, Download, PenTool, ChevronDown } from "lucide-react";
import Image from "next/image";
import { generateProjectContract, downloadBlob } from "@/lib/utils/pdf";
import { getContractArticles, getContractHeader } from "@/lib/constants/contractTemplate";

interface ContractSignerProps {
    onSign: (signature: string) => void;
    isOpen: boolean;
    onClose: () => void;
    projectName?: string;
    clientName?: string;
    budget?: string;
    projectId?: string;
    description?: string;
}

export default function ContractSigner({
    onSign,
    isOpen,
    onClose,
    projectName = "Project en cours",
    clientName = "Client",
    budget = "Non spécifié",
    projectId = "UNKNOWN",
    description = ""
}: ContractSignerProps) {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [signed, setSigned] = useState(false);
    const [step, setStep] = useState<'reading' | 'signing'>('reading');
    const displayId = useMemo(() => projectId !== "UNKNOWN" ? projectId.slice(-6).toUpperCase() : "0000", [projectId]);

    // Derived Content
    const header = getContractHeader(clientName);
    const articles = getContractArticles(projectName, description, budget, clientName);
    const currentDate = new Date().toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric' });

    const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const clear = () => {
        sigCanvas.current?.clear();
        setSigned(false);
        setIsCanvasEmpty(true);
    };

    const save = async () => {
        if (sigCanvas.current?.isEmpty()) return;
        const signatureData = sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");
        if (signatureData) {
            try {
                setIsProcessing(true);
                const pdfBytes = await generateProjectContract(projectName, clientName, budget, signatureData, projectId, description);
                const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
                downloadBlob(blob, `Contrat_AUTOMATIC_${projectName.replace(/\s+/g, "_")}.pdf`);

                await onSign(signatureData);
                setSigned(true);
                setTimeout(onClose, 2000);
            } catch (error) {
                console.error("Erreur lors de la signature:", error);
                alert("Une erreur est survenue lors de la génération du contrat.");
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 sm:p-6 md:p-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-5xl h-[85vh] bg-white rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden relative ring-1 ring-black/5"
                    >
                        {/* LEFT: Document Preview (Scrollable) */}
                        <div className="flex-1 flex flex-col bg-slate-50 text-slate-900 border-b md:border-b-0 md:border-r border-slate-200 overflow-hidden relative">
                            {/* Paper Header */}
                            <div className="p-8 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
                                <div>
                                    <h2 className="font-serif font-bold text-2xl text-slate-900 tracking-tight">Convention de Service</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: AUT-{new Date().getFullYear()}-{displayId}</p>
                                </div>
                                <div className="hidden sm:block">
                                    <div className="w-12 h-12 relative flex items-center justify-center">
                                        <Image
                                            src="/logo.svg"
                                            alt="Automatic"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Paper Content */}
                            <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar bg-slate-50 shadow-inner">
                                <div className="max-w-2xl mx-auto space-y-8 font-serif leading-relaxed text-sm md:text-base text-slate-700 bg-white p-8 md:p-12 shadow-sm border border-slate-100 min-h-full">
                                    <div className="text-center pb-8 border-b border-slate-100">
                                        <h1 className="text-xl font-bold mb-2 text-slate-900 uppercase">Contrat de Prestation</h1>
                                        <p className="italic text-slate-500">Établi le {currentDate} à Abidjan</p>
                                    </div>

                                    <div className="whitespace-pre-wrap font-medium text-slate-900 bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8 text-xs md:text-sm">
                                        {header.parties}
                                    </div>

                                    <div className="space-y-8">
                                        {articles.map((article, i) => (
                                            <div key={i}>
                                                <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">{article.title}</h3>
                                                <p className="text-justify">{article.content}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-12 pb-20 border-t border-slate-100 mt-12 flex justify-between">
                                        <div className="w-1/3">
                                            <p className="font-bold text-xs uppercase mb-4">Pour le Client</p>
                                            <div className="h-24 border-b border-slate-300 border-dashed"></div>
                                        </div>
                                        <div className="w-1/3">
                                            <p className="font-bold text-xs uppercase mb-4">Pour Automatic</p>
                                            <div className="h-24 border-b border-slate-300 border-dashed relative">
                                                <div className="absolute bottom-2 right-0 text-slate-300 font-sacramento text-2xl opacity-50 rotate-[-5deg]">Automatic CI</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile "Scroll for more" hint */}
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none md:hidden" />
                        </div>

                        {/* RIGHT: Action Panel */}
                        <div className="w-full md:w-[400px] bg-white flex flex-col relative z-20 shadow-xl shrink-0 border-l border-slate-100 p-10">
                            {/* Close Button */}
                            <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors">
                                <X size={20} />
                            </button>

                            <div className="mb-10">
                                <div className="w-20 h-20 rounded-[1.5rem] bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-inner mb-8">
                                    <PenTool size={36} />
                                </div>
                                <h3 className="text-3xl font-bold text-primary uppercase tracking-tight mb-4">Signature</h3>
                                <p className="text-secondary/60 text-xs leading-relaxed font-bold uppercase tracking-widest opacity-80">
                                    Veuillez signer ci-dessous pour valider votre contrat et lancer le projet.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div className="bg-secondary/5 rounded-[2rem] border border-border/50 relative group overflow-hidden hover:border-primary/30 transition-all shadow-inner">
                                    {!signed ? (
                                        <SignatureCanvas
                                            ref={sigCanvas}
                                            canvasProps={{
                                                className: "w-full h-56 cursor-crosshair bg-transparent",
                                            }}
                                            onBegin={() => {
                                                setSigned(false);
                                                setIsCanvasEmpty(false);
                                            }}
                                            onEnd={() => {
                                                setIsCanvasEmpty(sigCanvas.current?.isEmpty() ?? true);
                                            }}
                                        />
                                    ) : (
                                        <div className="h-56 flex flex-col items-center justify-center text-emerald-600 bg-emerald-500/5 animate-in fade-in zoom-in duration-500">
                                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                                                <Check className="w-8 h-8 animate-bounce" />
                                            </div>
                                            <p className="font-bold uppercase tracking-widest text-[10px]">Contrat signé avec succès</p>
                                        </div>
                                    )}

                                    {!signed && (
                                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-secondary/10 font-bold uppercase text-4xl -rotate-12 select-none tracking-widest">Signer ici</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-6">
                                    <button
                                        onClick={clear}
                                        disabled={signed || isProcessing}
                                        className="flex-1 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-secondary/30 hover:bg-secondary/5 hover:text-primary disabled:opacity-30 transition-all"
                                    >
                                        Effacer
                                    </button>
                                    <button
                                        onClick={save}
                                        disabled={isCanvasEmpty || isProcessing}
                                        className="flex-[2] py-5 rounded-2xl bg-primary hover:scale-[1.02] active:scale-[0.98] text-background text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-primary/20 disabled:grayscale disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                                    >
                                        {isProcessing ? (
                                            <>Traitement... <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /></>
                                        ) : signed ? (
                                            <>Télécharger ma copie <Download size={14} /></>
                                        ) : (
                                            <>Confirmer la signature <ChevronDown size={14} className="-rotate-90" /></>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 bg-secondary/5 border-t border-border/50 transition-colors group-hover:bg-secondary/10">
                                <div className="flex items-center gap-4">
                                    <Shield size={20} className="text-primary/20" />
                                    <p className="text-[9px] text-secondary/40 leading-relaxed font-bold uppercase tracking-widest">
                                        Données sécurisées par chiffrement
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// Icon component helper
function Shield({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
    )
}

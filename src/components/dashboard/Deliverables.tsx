"use client";

import { FileText, Download, Code, Globe, ShieldCheck, Loader2 } from "lucide-react";
import { generateProjectContract, downloadBlob } from "@/lib/utils/pdf";
import { useState } from "react";

interface DeliverablesProps {
    projectId: string;
    projectName?: string;
    projectAssets?: any[];
    contracts?: any[];
    clientName?: string;
    budget?: string;
    description?: string;
}

export default function Deliverables({
    projectId,
    projectName = "Projet",
    projectAssets = [],
    contracts = [],
    clientName = "Client",
    budget = "0€",
    description
}: DeliverablesProps) {
    const [downloadingContract, setDownloadingContract] = useState<string | null>(null);

    const handleContractDownload = async (contract: any) => {
        if (!contract.signatureBase64) return;
        setDownloadingContract(contract.id);

        try {
            // Regenerate the PDF client-side using the stored signature
            const pdfBytes = await generateProjectContract(
                projectName,
                clientName,
                budget,
                contract.signatureBase64,
                projectId,
                description
            );

            const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
            const filename = `Contrat_${projectName.replace(/\s+/g, "_")}_${contract.id.slice(-4)}.pdf`;
            downloadBlob(blob, filename);
        } catch (error) {
            console.error("Failed to download contract", error);
        } finally {
            setDownloadingContract(null);
        }
    };

    const allDeliverables = [
        ...contracts.filter(c => c.status === "SIGNED").map(c => ({
            id: c.id,
            name: "Contrat de Prestation (Signé)",
            icon: ShieldCheck,
            type: "contract",
            source: c
        })),
        ...projectAssets.map(a => ({
            id: a.id,
            name: a.name,
            icon: a.type === "code" ? Code : a.type === "pdf" ? FileText : Globe,
            type: "file",
            href: a.url
        }))
    ];

    return (
        <div className="p-10 bg-slate-900 border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

            <h4 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-10 italic flex items-center justify-between">
                Livrables Actifs
                {allDeliverables.length > 0 && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
            </h4>

            {allDeliverables.length === 0 ? (
                <div className="py-12 px-6 border-2 border-dashed border-white/5 rounded-3xl text-center">
                    <p className="text-slate-600 font-bold uppercase text-[10px] tracking-widest italic leading-relaxed">
                        Aucun livrable disponible pour le moment.<br />
                        Les ressources apparaîtront ici dès le début de la phase DEV.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {allDeliverables.map((item: any) => (
                        <div
                            key={item.id}
                            className="group flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/20 hover:bg-blue-500/5 transition-all cursor-pointer"
                            onClick={() => item.type === "contract" ? handleContractDownload(item.source) : window.open(item.href, '_blank')}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${item.type === "contract" ? "bg-green-500/10 text-green-500" : "bg-slate-800 text-slate-500 group-hover:text-blue-400 group-hover:bg-blue-400/10"
                                    }`}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className={`text-sm font-bold transition-colors ${item.type === "contract" ? "text-green-500" : "text-slate-300 group-hover:text-white"}`}>
                                        {item.name}
                                    </span>
                                    {item.type === "contract" && (
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mt-1">
                                            Signature certifiée
                                        </p>
                                    )}
                                </div>
                            </div>
                            {downloadingContract === item.id ? (
                                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 text-slate-700 group-hover:text-slate-400 transition-colors" />
                            )}
                        </div>
                    ))}
                </div>
            )}

            <button className="w-full mt-10 py-5 border-2 border-dashed border-slate-800 rounded-2xl text-slate-600 font-bold text-xs uppercase tracking-[0.3em] hover:border-blue-500/30 hover:text-blue-500/50 transition-all">
                + Demander un Asset
            </button>
        </div>
    );
}

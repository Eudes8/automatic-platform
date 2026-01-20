"use client";

import { FileText, Download, Code, Globe, ShieldCheck, Loader2 } from "lucide-react";
import { generateProjectContract, downloadBlob } from "@/lib/utils/pdf";
import { useState } from "react";

interface DeliverablesProps {
    projectId: string;
    projectName?: string;
    projectAssets?: any[];
    contracts?: any[];
    invoices?: any[];
    clientName?: string;
    budget?: string;
    description?: string;
}

export default function Deliverables({
    projectId,
    projectName = "Projet",
    projectAssets = [],
    contracts = [],
    invoices = [],
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
            name: "CONTRAT_SIGNÉ.pdf",
            icon: ShieldCheck,
            type: "contract",
            source: c
        })),
        ...invoices.filter(inv => inv.pdfUrl).map(inv => ({
            id: inv.id,
            name: `FACTURE_${inv.id.slice(-6).toUpperCase()}.pdf`,
            icon: FileText,
            type: "invoice",
            href: inv.pdfUrl
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
        <div className="p-10 bg-card/30 border border-border/50 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <h4 className="text-secondary/40 font-black uppercase text-[10px] tracking-[0.4em] mb-12 italic flex items-center justify-between">
                // Livrables_Actifs
                {allDeliverables.length > 0 && <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.5)]" />}
            </h4>

            {allDeliverables.length === 0 ? (
                <div className="py-16 px-6 border-2 border-dashed border-border/50 rounded-[2.5rem] text-center bg-background/20">
                    <p className="text-secondary/30 font-black uppercase text-[10px] tracking-[0.4em] italic leading-relaxed">
                        Aucun livrable disponible.<br />
                        Accès restreint en phase d'initiation.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {allDeliverables.map((item: any) => (
                        <div
                            key={item.id}
                            className="group flex items-center justify-between p-6 rounded-[2rem] bg-background/50 border border-border/50 hover:border-primary/30 transition-all cursor-pointer shadow-sm hover:shadow-xl"
                            onClick={() => item.type === "contract" ? handleContractDownload(item.source) : window.open(item.href, '_blank')}
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${item.type === "contract" ? "bg-emerald-500/5 text-emerald-600 border border-emerald-500/10" : "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-background"
                                    }`}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className={`text-sm font-black uppercase italic tracking-tight transition-colors ${item.type === "contract" ? "text-emerald-600" : "text-primary"}`}>
                                        {item.name}
                                    </span>
                                    {item.type === "contract" && (
                                        <p className="text-[9px] text-secondary/30 uppercase tracking-[0.2em] font-black mt-1 italic">
                                            Signature_Hex_Validée
                                        </p>
                                    )}
                                </div>
                            </div>
                            {downloadingContract === item.id ? (
                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-secondary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-background transition-all">
                                    <Download className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <button className="w-full mt-10 py-5 bg-secondary/5 border border-border/50 rounded-[1.5rem] text-secondary/40 font-black text-[9px] uppercase tracking-[0.4em] hover:bg-primary/5 hover:text-primary transition-all italic">
                + REQUÊTE_ASSET_ADDITIONNEL
            </button>
        </div>
    );
}

"use client";

import { FileText, Download, Code, Globe, ShieldCheck, Loader2, Files, Briefcase, ChevronRight, CheckCircle2 } from "lucide-react";
import { generateProjectContract, generateProjectBrief, downloadBlob } from "@/lib/utils/pdf";
import { useState } from "react";
import { cn } from "@/lib/utils";

import { Asset, Contract, Invoice } from "@prisma/client";

interface DeliverablesProps {
    projectId: string;
    projectName?: string;
    projectAssets?: Asset[];
    contracts?: Contract[];
    invoices?: (Invoice & { project?: { title: string } | null })[];
    clientName?: string;
    budget?: string;
    description?: string;
    techStack?: string[];
    timeline?: string;
}

export default function Deliverables({
    projectId,
    projectName = "Project",
    projectAssets = [],
    contracts = [],
    invoices = [],
    clientName = "Client",
    budget = "0€",
    description,
    techStack = [],
    timeline = "Standard"
}: DeliverablesProps) {
    const [downloading, setDownloading] = useState<string | null>(null);

    const handleContractDownload = async (contract: Contract) => {
        setDownloading(contract.id);
        try {
            const pdfBytes = await generateProjectContract(projectName, clientName, budget, contract.signatureBase64 || "", projectId, description);
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
            downloadBlob(blob, `CONTRAT_${projectName.replace(/\s+/g, "_")}.pdf`);
        } catch (error) {
            console.error("Download error", error);
        } finally {
            setDownloading(null);
        }
    };

    const handleBriefDownload = async () => {
        setDownloading("brief");
        try {
            const pdfBytes = await generateProjectBrief(projectName, clientName, techStack, timeline || "Standard", description || "", projectId);
            const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
            downloadBlob(blob, `CAHIER_DES_CHARGES_${projectName.replace(/\s+/g, "_")}.pdf`);
        } catch (error) {
            console.error("Brief error", error);
        } finally {
            setDownloading(null);
        }
    };

    const categories = [
        {
            title: "LÉGAL & ADMIN",
            icon: ShieldCheck,
            items: [
                ...contracts.filter(c => c.status === "SIGNED").map(c => ({
                    id: c.id,
                    name: "Convention Signée",
                    type: "contract" as const,
                    source: c
                })),
                ...invoices.map(inv => ({
                    id: inv.id,
                    name: `Invoice ${inv.id.slice(-6).toUpperCase()}`,
                    type: "invoice" as const,
                    href: inv.pdfUrl,
                    status: inv.status
                }))
            ]
        },
        {
            title: "TECHNIQUE",
            icon: Code,
            items: [
                { id: "brief", name: "Cahier des Charges", type: "brief" as const },
                ...projectAssets.map(a => ({
                    id: a.id,
                    name: a.name,
                    type: "asset" as const,
                    href: a.url,
                    assetType: a.type
                }))
            ]
        }
    ];

    interface DeliverableItem {
        id: string;
        name: string;
        type: "contract" | "invoice" | "brief" | "asset";
        href?: string | null;
        source?: any;
        status?: string;
        assetType?: string;
    }

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
            {/* 4x4 Quick Actions */}
            <div className="grid grid-cols-1 gap-4">
                <button
                    onClick={handleBriefDownload}
                    disabled={downloading === "brief"}
                    className="group relative flex items-center justify-between p-6 sm:p-8 bg-primary text-background rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden transition-all hover:scale-[1.01] active:scale-95 shadow-2xl shadow-primary/20"
                >
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="flex items-center gap-4 sm:gap-5 relative z-10">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center">
                            {downloading === "brief" ? <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5 text-background" /> : <Briefcase className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />}
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Cahier des Charges</p>
                            <p className="text-[8px] sm:text-[9px] font-bold text-white/50 uppercase tracking-widest mt-0.5 sm:mt-1">Télécharger le document technique</p>
                        </div>
                    </div>
                    <ChevronRight className="relative z-10 opacity-50 group-hover:opacity-100 transition-opacity w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>

            {/* Structured Deliverables */}
            <div className="space-y-4 sm:space-y-6">
                {categories.map((cat, i) => (
                    <div key={i} className="p-6 sm:p-8 bg-card/30 border border-border/50 rounded-[2rem] sm:rounded-[3rem] space-y-4 sm:space-y-6 shadow-sm">
                        <h5 className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-bold text-secondary/30 uppercase tracking-widest px-2">
                            <cat.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                            {cat.title}
                        </h5>

                        <div className="space-y-2 sm:space-y-3">
                            {cat.items.length === 0 ? (
                                <p className="text-[8px] sm:text-[9px] text-secondary/20 font-bold uppercase tracking-widest px-2">Aucun document disponible</p>
                            ) : (
                                cat.items.map((item: DeliverableItem) => (
                                    <div
                                        key={item.id}
                                        onClick={() => {
                                            if (item.type === "contract") handleContractDownload(item.source);
                                            else if (item.type === "brief") handleBriefDownload();
                                            else if (item.href) window.open(item.href, '_blank');
                                        }}
                                        className="group flex items-center justify-between p-4 sm:p-5 bg-background/50 border border-border/50 rounded-[1.5rem] sm:rounded-2xl hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-xl"
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className={cn(
                                                "w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all",
                                                item.type === "contract" ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/5 text-primary"
                                            )}>
                                                {item.type === "contract" ? <CheckCircle2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> :
                                                    item.type === "brief" ? <Files className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> :
                                                        item.assetType === "code" ? <Code className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> :
                                                            item.assetType === "web" ? <Globe className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /> : <FileText className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />}
                                            </div>
                                            <span className="text-[10px] sm:text-[11px] font-bold text-primary uppercase tracking-tight">{item.name}</span>
                                        </div>
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-secondary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-background transition-all">
                                            {downloading === item.id ? <Loader2 className="animate-spin w-3 h-3" /> : <Download className="w-3 h-3" />}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-6 sm:p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] sm:rounded-[2.5rem]">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" />
                    <p className="text-[9px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Espace Sécurisé</p>
                </div>
                <p className="text-[8px] sm:text-[9px] text-secondary/40 font-bold leading-loose">
                    Tous vos documents sont certifiés par AUTOMATIC CI et stockés de manière sécurisée.
                </p>
            </div>
        </div>
    );
}

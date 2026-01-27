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
    projectName = "Projet",
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
                    name: `Facture ${inv.id.slice(-6).toUpperCase()}`,
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
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* 4x4 Quick Actions */}
            <div className="grid grid-cols-1 gap-4">
                <button
                    onClick={handleBriefDownload}
                    disabled={downloading === "brief"}
                    className="group relative flex items-center justify-between p-8 bg-primary text-background rounded-[2.5rem] overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-primary/20"
                >
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                            {downloading === "brief" ? <Loader2 className="animate-spin w-5 h-5 text-background" /> : <Briefcase size={22} />}
                        </div>
                        <div className="text-left">
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] font-heading h-4 italic overflow-hidden">CAHIER_DES_CHARGES</p>
                            <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mt-1">Générer le document technique</p>
                        </div>
                    </div>
                    <ChevronRight className="relative z-10 opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>

            {/* Structured Deliverables */}
            <div className="space-y-6">
                {categories.map((cat, i) => (
                    <div key={i} className="p-8 bg-card/30 border border-border/50 rounded-[3rem] space-y-6">
                        <h5 className="flex items-center gap-3 text-[10px] font-black text-secondary/30 uppercase tracking-[0.4em] italic px-2">
                            <cat.icon size={14} className="text-primary" />
                            // {cat.title}
                        </h5>

                        <div className="space-y-3">
                            {cat.items.length === 0 ? (
                                <p className="text-[9px] text-secondary/20 font-bold uppercase tracking-widest italic px-2">Aucun élément synchronisé</p>
                            ) : (
                                cat.items.map((item: DeliverableItem) => (
                                    <div
                                        key={item.id}
                                        onClick={() => {
                                            if (item.type === "contract") handleContractDownload(item.source);
                                            else if (item.type === "brief") handleBriefDownload();
                                            else if (item.href) window.open(item.href, '_blank');
                                        }}
                                        className="group flex items-center justify-between p-5 bg-background/50 border border-border/50 rounded-[2rem] hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-xl"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                item.type === "contract" ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/5 text-primary"
                                            )}>
                                                {item.type === "contract" ? <CheckCircle2 size={18} /> :
                                                    item.type === "brief" ? <Files size={18} /> :
                                                        item.assetType === "code" ? <Code size={18} /> :
                                                            item.assetType === "web" ? <Globe size={18} /> : <FileText size={18} />}
                                            </div>
                                            <span className="text-[11px] font-black text-primary uppercase italic tracking-tight">{item.name}</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-lg bg-secondary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-background transition-all">
                                            {downloading === item.id ? <Loader2 className="animate-spin w-3 h-3" /> : <Download size={12} />}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem]">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">Nexus_Sync: Optima</p>
                </div>
                <p className="text-[9px] text-secondary/40 font-bold leading-loose italic">
                    Toutes les pièces sont certifiées par AUTOMATIC CI. Le stockage est crypté bout-en-bout via protocole AES-256.
                </p>
            </div>
        </div>
    );
}

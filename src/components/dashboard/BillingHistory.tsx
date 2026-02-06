"use client";

import { CreditCard, Download, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { downloadBlob } from "@/lib/utils/pdf";

import { Invoice } from "@prisma/client";

interface BillingHistoryProps {
    invoices: (Invoice & { project?: { title: string } | null })[];
}

export default function BillingHistory({ invoices }: BillingHistoryProps) {
    const handleDownload = async (url: string | null, id: string) => {
        if (!url) {
            toast.error("Invoice indisponible");
            return;
        }

        try {
            const response = await fetch(url);
            const blob = await response.blob();
            downloadBlob(blob, `Facture_${id.slice(-8)}.pdf`);
            toast.success("Téléchargement lancé");
        } catch (e) {
            toast.error("Échec du téléchargement");
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'OVERDUE': return <AlertCircle className="w-4 h-4 text-rose-500" />;
            default: return <Clock className="w-4 h-4 text-amber-500" />;
        }
    };

    return (
        <div className="space-y-8 sm:space-y-12 relative z-10">
            {/* Section Header */}
            <div className="flex items-center gap-3 sm:gap-5 mb-6 sm:mb-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[1rem] sm:rounded-[1.2rem] bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                    <h3 className="text-2xl sm:text-3xl font-black text-primary italic uppercase tracking-tighter leading-none">
                        FACTURES & TRÉSORERIE.
                    </h3>
                    <p className="text-[8px] sm:text-[9px] font-black text-secondary/30 uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-1 sm:mt-2 italic">Historique des transactions et documents fiscaux</p>
                </div>
            </div>

            {invoices.length === 0 ? (
                <div className="p-10 sm:p-20 text-center bg-white/40 border border-dashed border-border/50 rounded-[2rem] sm:rounded-[3rem]">
                    <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-secondary/10 mx-auto mb-4 sm:mb-6" />
                    <p className="text-[9px] sm:text-[10px] font-black text-secondary/30 uppercase tracking-[0.3em] sm:tracking-[0.4em] italic mb-2">Aucune pièce comptable</p>
                    <p className="text-[8px] sm:text-[9px] text-secondary/20 font-bold italic">Vos factures apparaîtront ici dès le lancement de votre projet.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:gap-6">
                    {invoices.map((invoice) => (
                        <div
                            key={invoice.id}
                            className="bg-white/50 backdrop-blur-xl border border-border/50 rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-10 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-8 group hover:border-primary/30 transition-all duration-700 hover:shadow-2xl hover:shadow-primary/5"
                        >
                            <div className="flex items-center gap-4 sm:gap-8">
                                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/5 flex items-center justify-center text-secondary/40 group-hover:scale-110 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-700">
                                    <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div className="space-y-1 sm:space-y-2">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <p className="text-[10px] sm:text-xs font-black text-primary uppercase italic tracking-widest">FACTURE_N°{invoice.id.slice(-8).toUpperCase()}</p>
                                        <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-widest italic border flex items-center gap-1.5 sm:gap-2 ${invoice.status === "PAID" ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" : "bg-amber-500/5 text-amber-600 border-amber-500/20"
                                            }`}>
                                            {getStatusIcon(invoice.status)}
                                            {invoice.status}
                                        </span>
                                    </div>
                                    <p className="text-[9px] sm:text-[10px] text-secondary/40 font-bold uppercase tracking-widest italic">{invoice.project?.title || "SERVICES NUMÉRIQUES"}</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-12 text-center md:text-right">
                                <div>
                                    <p className="text-[8px] sm:text-[9px] font-black text-secondary/20 uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-1 italic">MONTANT_NET</p>
                                    <p className="text-lg sm:text-xl font-black text-primary italic tracking-tight">{new Intl.NumberFormat('fr-FR').format(invoice.amount)} CFA</p>
                                </div>
                                <button
                                    onClick={() => handleDownload(invoice.pdfUrl, invoice.id)}
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary text-background flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 active:scale-90 transition-all duration-500 group-hover:rotate-6"
                                >
                                    <Download className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

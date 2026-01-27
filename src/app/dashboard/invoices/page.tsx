import { getClientInvoices } from "@/lib/actions/invoices";
import { Receipt, FileText, Download, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Invoice, Project } from "@prisma/client";

type InvoiceWithProject = Invoice & {
    project: Project | null;
};

export const dynamic = "force-dynamic";

export default async function ClientInvoicesPage() {
    const invoices = await getClientInvoices();

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-10 border-b border-border/50">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                        <p className="text-[10px] text-primary/40 font-black uppercase tracking-[0.5em] italic">FINANCIAL_UNIT // ALPHA_NODE</p>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-primary italic uppercase tracking-tighter leading-none">
                        MES <span className="text-secondary/20">Factures.</span>
                    </h1>
                    <p className="text-secondary/40 font-black text-[10px] uppercase tracking-[0.3em] mt-3 italic max-w-lg">
                        // ARCHIVES_DES_FLUX_FINANCIERS_ET_SYNC_UNITÉS.
                    </p>
                </div>

                <div className="flex items-center gap-4 px-6 py-4 bg-primary/5 border border-primary/20 rounded-2xl italic">
                    <Receipt size={18} className="text-primary" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{invoices.length} DOCUMENTS_DÉTECTÉS</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {invoices.map((invoice: InvoiceWithProject) => (
                    <div key={invoice.id} className="group bg-white/40 backdrop-blur-3xl border border-border/50 rounded-[3rem] p-10 hover:border-primary/50 transition-all duration-700 shadow-xl hover:shadow-2xl relative overflow-hidden flex flex-col h-full">
                        {/* Status Badge */}
                        <div className="absolute top-8 right-8">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border italic shadow-sm ${invoice.status === "PAID" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                invoice.status === "OVERDUE" ? "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse" :
                                    "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                }`}>
                                {invoice.status === "PAID" ? "SYNC_ACCOMPLIE" :
                                    invoice.status === "OVERDUE" ? "RETARD_DÉTECTÉ" : "TRAITEMENT_EN_COURS"}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-[1.5rem] bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform duration-500">
                                <FileText size={24} />
                            </div>
                            <div>
                                <p className="text-[9px] text-secondary/20 font-black uppercase tracking-widest">FACTURE_ID</p>
                                <h3 className="text-xl font-black text-primary italic uppercase tracking-tighter">#{invoice.id.slice(-6).toUpperCase()}</h3>
                            </div>
                        </div>

                        <div className="space-y-6 flex-grow">
                            <div>
                                <p className="text-[9px] text-secondary/20 font-black uppercase tracking-widest mb-2">UNIT_PROJET</p>
                                <p className="text-primary font-black uppercase italic tracking-tight truncate border-l-2 border-primary/20 pl-4">
                                    /{invoice.project?.title || "PROTOCOLE_EXTERNE"}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
                                <div>
                                    <p className="text-[9px] text-secondary/20 font-black uppercase tracking-widest mb-1">VALEUR</p>
                                    <p className="text-emerald-600 font-black text-lg italic tracking-tighter">
                                        {new Intl.NumberFormat('fr-FR').format(invoice.amount)}<span className="text-[10px] ml-1 opacity-40">CFA</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-secondary/20 font-black uppercase tracking-widest mb-1">ECHEANCE</p>
                                    <div className="flex items-center gap-2 text-secondary/60 text-[10px] font-black uppercase italic">
                                        <Calendar size={12} className="opacity-40" />
                                        {new Date(invoice.dueDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10">
                            {invoice.pdfUrl ? (
                                <Link
                                    href={invoice.pdfUrl}
                                    target="_blank"
                                    className="w-full py-5 bg-primary text-background rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] italic flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all duration-500 shadow-2xl shadow-primary/20 group/btn"
                                >
                                    <Download size={14} className="group-hover/btn:translate-y-0.5 transition-transform" />
                                    TÉLÉCHARGER_PDF
                                </Link>
                            ) : (
                                <div className="w-full py-5 bg-secondary/5 border border-border/50 rounded-[1.5rem] text-secondary/20 text-[10px] font-black uppercase tracking-[0.3em] italic flex items-center justify-center gap-3">
                                    DOCUMENT_EN_GÉNÉRATION...
                                </div>
                            )}
                        </div>

                        {/* Scanline Effect */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700">
                            <div className="w-full h-[1px] bg-primary animate-scan-line" />
                        </div>
                    </div>
                ))}

                {invoices.length === 0 && (
                    <div className="col-span-full py-40 text-center bg-white/40 backdrop-blur-3xl border border-dashed border-border/50 rounded-[3rem] shadow-inner relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/2 pointer-events-none" />
                        <Receipt className="w-20 h-20 text-primary/5 mx-auto mb-10" />
                        <p className="text-secondary/20 font-black uppercase tracking-[0.4em] italic leading-relaxed">
                            // AUCUNE_FACTURE_DÉTECTÉE_SUR_VOTRE_NODE. <br />
                            LES_FLUX_INITIAUX_SONT_EN_SYNCHRONISATION.
                        </p>
                    </div>
                )}
            </div>

            <footer className="pt-20 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30 group">
                <p className="text-[9px] font-black uppercase tracking-[0.5em] italic">// SYSTÈME_FACTURATION_AUTOMATIC_V2.1</p>
                <div className="flex items-center gap-8">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] italic">SECURE_TRANS_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] italic">AES_256_ENCRYPTED</span>
                </div>
            </footer>
        </div>
    );
}

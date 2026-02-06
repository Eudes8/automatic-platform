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
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest">Comptabilité</p>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-primary uppercase tracking-tight leading-none">
                        Mes <span className="text-secondary/20">Factures.</span>
                    </h1>
                    <p className="text-secondary/40 font-bold text-[10px] uppercase tracking-widest mt-3 max-w-lg">
                        Historique de vos paiements et documents financiers.
                    </p>
                </div>

                <div className="flex items-center gap-4 px-6 py-4 bg-primary/5 border border-primary/20 rounded-2xl">
                    <Receipt size={18} className="text-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{invoices.length} Documents</span>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {invoices.map((invoice: InvoiceWithProject) => (
                    <div key={invoice.id} className="group bg-white/40 backdrop-blur-3xl border border-border/50 rounded-[3rem] p-10 hover:border-primary/50 transition-all duration-700 shadow-xl hover:shadow-2xl relative overflow-hidden flex flex-col h-full">
                        {/* Status Badge */}
                        <div className="absolute top-8 right-8">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border shadow-sm ${invoice.status === "PAID" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                invoice.status === "OVERDUE" ? "bg-red-500/10 text-red-600 border-red-500/20" :
                                    "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                }`}>
                                {invoice.status === "PAID" ? "Payée" :
                                    invoice.status === "OVERDUE" ? "En retard" : "En attente"}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-[1.5rem] bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform duration-500">
                                <FileText size={24} />
                            </div>
                            <div>
                                <p className="text-[9px] text-secondary/20 font-bold uppercase tracking-widest">Référence</p>
                                <h3 className="text-xl font-bold text-primary uppercase tracking-tight">#{invoice.id.slice(-6).toUpperCase()}</h3>
                            </div>
                        </div>

                        <div className="space-y-6 flex-grow">
                            <div>
                                <p className="text-[9px] text-secondary/20 font-bold uppercase tracking-widest mb-2">Projet</p>
                                <p className="text-primary font-bold uppercase tracking-tight truncate border-l-2 border-primary/20 pl-4">
                                    {invoice.project?.title || "Projet externe"}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
                                <div>
                                    <p className="text-[9px] text-secondary/20 font-bold uppercase tracking-widest mb-1">Montant</p>
                                    <p className="text-emerald-600 font-bold text-lg tracking-tight">
                                        {new Intl.NumberFormat('fr-FR').format(invoice.amount)}<span className="text-[10px] ml-1 opacity-40">CFA</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-secondary/20 font-bold uppercase tracking-widest mb-1">Échéance</p>
                                    <div className="flex items-center gap-2 text-secondary/60 text-[10px] font-bold uppercase">
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
                                    className="w-full py-5 bg-primary text-background rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all duration-500 shadow-2xl shadow-primary/20 group/btn"
                                >
                                    <Download size={14} className="group-hover/btn:translate-y-0.5 transition-transform" />
                                    Télécharger
                                </Link>
                            ) : (
                                <div className="w-full py-5 bg-secondary/5 border border-border/50 rounded-[1.5rem] text-secondary/20 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3">
                                    Document en préparation...
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
                        <p className="text-secondary/20 font-bold uppercase tracking-widest">
                            Aucune facture disponible pour le moment.
                        </p>
                    </div>
                )}
            </div>

            <footer className="pt-20 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30 group">
                <p className="text-[9px] font-bold uppercase tracking-widest">Automatic CI // Facturation</p>
                <div className="flex items-center gap-8">
                    <span className="text-[8px] font-bold uppercase tracking-widest">Transactions sécurisées</span>
                </div>
            </footer>
        </div>
    );
}

import { getAllInvoices } from "@/lib/actions/invoices";
import { FileText, Download, Eye, DollarSign, Calendar, User as UserIcon, ChevronRight } from "lucide-react";
import Link from "next/link";
import InvoiceCRUDModal from "@/components/admin/invoices/InvoiceCRUDModal";
import { cn } from "@/lib/utils";
import { Invoice, User, Project } from "@prisma/client";

type InvoiceWithDetails = Invoice & {
    client: User;
    project: Project | null;
};
export const dynamic = 'force-dynamic';
export default async function AdminInvoicesPage() {
    const invoices = await getAllInvoices();

    return (
        <div className="space-y-12 p-10 lg:p-14 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-border/50 pb-10">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <p className="text-[10px] text-primary/40 font-black uppercase tracking-[0.5em] italic">FINANCE_UNIT // ALPHA_CORE</p>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-primary italic uppercase tracking-tighter leading-none">
                        GESTION <span className="text-secondary/20">Factures.</span>
                    </h1>
                    <p className="text-secondary/40 font-black text-[10px] uppercase tracking-[0.3em] mt-3 italic max-w-lg">
                        // SUIVI_FLUX_RÉSEAU_ET_REVENUS_UNITÉS.
                    </p>
                </div>
                <InvoiceCRUDModal />
            </header>

            <div className="bg-white/40 backdrop-blur-3xl border border-border/50 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/2 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

                <div className="p-10 border-b border-border/30 bg-white/10 relative z-10 flex flex-col md:flex-row gap-8">
                    <div className="flex-1 relative group/search">
                        <input
                            type="text"
                            placeholder="RECHERCHE_ID_FACTURE..."
                            className="w-full bg-background border border-border/50 rounded-[1.5rem] py-5 px-8 text-[11px] font-black uppercase italic tracking-widest text-primary focus:border-primary/50 focus:ring-8 focus:ring-primary/5 outline-none transition-all duration-500 shadow-inner placeholder:text-secondary/10"
                        />
                    </div>
                    <div className="relative w-full md:w-80 group/select">
                        <select className="w-full bg-background border border-border/50 rounded-[1.5rem] py-5 px-8 text-[11px] font-black uppercase italic tracking-[0.2em] text-primary focus:border-primary/50 focus:ring-8 focus:ring-primary/5 outline-none transition-all duration-500 shadow-inner appearance-none">
                            <option value="">TOUS_LES_STADES</option>
                            <option value="DRAFT">BROUILLON_STAGE</option>
                            <option value="SENT">NODES_ENVOYÉS</option>
                            <option value="PAID">SYNC_ACCOMPLIE</option>
                            <option value="OVERDUE">RETARD_DÉTECTÉ</option>
                            <option value="CANCELLED">FLUX_ANNULÉ</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                            <ChevronRight size={14} className="rotate-90" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-primary/5 text-secondary/40 text-[9px] font-black uppercase tracking-[0.3em] italic border-b border-border/30">
                                <th className="p-8">FACTURE_ID_LOG</th>
                                <th className="p-8">IDENTITÉ_CLIENT</th>
                                <th className="p-8">UNITÉ_PROJET</th>
                                <th className="p-8">FLUX_VALEUR</th>
                                <th className="p-8">SYNC_STATUS</th>
                                <th className="p-8">ÉCHÉANCE_TIMESTAMP</th>
                                <th className="p-8 text-right">PROTOCOL_ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {invoices.map((invoice: InvoiceWithDetails) => (
                                <tr key={invoice.id} className="hover:bg-primary/[0.02] transition-colors group/row">
                                    <td className="p-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-[1.2rem] bg-background border border-border/50 flex items-center justify-center text-primary/40 group-hover/row:text-primary group-hover/row:border-primary/30 transition-all duration-500 shadow-inner">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p className="font-black text-primary text-xs italic tracking-tighter uppercase">#{invoice.id.slice(-8)}</p>
                                                <p className="text-secondary/20 text-[9px] font-black uppercase tracking-widest mt-1">{new Date(invoice.createdAt).toLocaleDateString()}.LOG</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-orange-500/5 text-orange-500 border border-orange-500/10 flex items-center justify-center font-black text-[10px] italic shadow-inner">
                                                {invoice.client?.name?.[0]?.toUpperCase() || <UserIcon size={14} />}
                                            </div>
                                            <div>
                                                <p className="text-primary font-black text-xs uppercase italic tracking-widest">{invoice.client?.name || "CLI_ANONYME"}</p>
                                                <p className="text-secondary/20 text-[9px] font-black uppercase tracking-tight mt-0.5">{invoice.client?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <span className="text-secondary/40 font-black text-[10px] uppercase italic tracking-tighter">/{invoice.project?.title || "N_A"}</span>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-2 text-emerald-600 font-black text-sm italic tracking-tighter uppercase">
                                            {invoice.amount} <span className="text-[10px] opacity-40">CFA_SYNC</span>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <span className={cn(
                                            "px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border italic shadow-sm",
                                            invoice.status === "PAID" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                                invoice.status === "SENT" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                                                    invoice.status === "OVERDUE" ? "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse" :
                                                        "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                        )}>
                                            {invoice.status === "PAID" ? "SYNC_OK" :
                                                invoice.status === "SENT" ? "SENT_OK" :
                                                    invoice.status === "OVERDUE" ? "ALERT_RETARD" : "DRAFT_MODE"}
                                        </span>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-3 text-secondary/40 text-[10px] font-black uppercase italic tracking-tighter">
                                            <Calendar size={14} className="opacity-20" />
                                            {new Date(invoice.dueDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex gap-4 justify-end">
                                            {invoice.pdfUrl && (
                                                <Link href={invoice.pdfUrl} target="_blank" className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center text-primary/40 hover:text-primary hover:border-primary/50 transition-all duration-500 shadow-inner group/icon">
                                                    <Download size={16} className="group-hover/icon:translate-y-0.5 transition-transform" />
                                                </Link>
                                            )}
                                            <button className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center text-primary/40 hover:text-primary hover:border-primary/50 transition-all duration-500 shadow-inner group/icon">
                                                <Eye size={16} className="group-hover/icon:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-700">
                    <div className="w-full h-[1px] bg-primary animate-scan-line" />
                </div>
            </div>
        </div>
    );
}

import { getAllInvoices } from "@/lib/actions/invoices";
import { FileText, Download, Eye, DollarSign, Calendar, User } from "lucide-react";
import Link from "next/link";
import InvoiceCRUDModal from "@/components/admin/invoices/InvoiceCRUDModal";
export const dynamic = 'force-dynamic';
export default async function AdminInvoicesPage() {
    const invoices = await getAllInvoices();

    return (
        <div className="space-y-8 p-8">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Gestion des <span className="text-blue-500">Factures</span></h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2 ml-1 italic">Suivi des paiements et revenus</p>
                </div>
                <InvoiceCRUDModal />
            </header>

            <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Rechercher une facture..."
                                className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                            />
                        </div>
                        <select className="bg-slate-950 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium">
                            <option value="">Tous les statuts</option>
                            <option value="DRAFT">Brouillon</option>
                            <option value="SENT">Envoyée</option>
                            <option value="PAID">Payée</option>
                            <option value="OVERDUE">En retard</option>
                            <option value="CANCELLED">Annulée</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <th className="p-6">Facture</th>
                                <th className="p-6">Client</th>
                                <th className="p-6">Projet</th>
                                <th className="p-6">Montant</th>
                                <th className="p-6">Statut</th>
                                <th className="p-6">Échéance</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">#{invoice.id.slice(-8)}</p>
                                                <p className="text-slate-500 text-xs">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-xs">
                                                {invoice.client?.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium text-sm">{invoice.client?.name || "Client inconnu"}</p>
                                                <p className="text-slate-500 text-xs">{invoice.client?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="text-white font-medium">{invoice.project?.title || "N/A"}</span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-green-400 font-bold">
                                            <DollarSign className="w-4 h-4" />
                                            {invoice.amount}€
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                            invoice.status === "PAID" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                            invoice.status === "SENT" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                            invoice.status === "OVERDUE" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                            "bg-gray-500/10 text-gray-400 border-gray-500/20"
                                        }`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(invoice.dueDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex gap-2 justify-end">
                                            {invoice.pdfUrl && (
                                                <Link href={invoice.pdfUrl} target="_blank" className="p-2 text-slate-500 hover:text-white transition-colors">
                                                    <Download className="w-4 h-4" />
                                                </Link>
                                            )}
                                            <button className="p-2 text-slate-500 hover:text-white transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
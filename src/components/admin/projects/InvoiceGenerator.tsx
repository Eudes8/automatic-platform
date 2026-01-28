"use client";

import { useState } from "react";
import { Plus, Loader2, X, FileText } from "lucide-react";
import { createInvoice } from "@/lib/actions/invoices";

export default function InvoiceGenerator({ projectId }: { projectId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.append("projectId", projectId);
        await createInvoice(formData);
        setLoading(false);
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full py-4 border border-dashed border-slate-700 rounded-xl text-slate-500 font-bold uppercase text-xs tracking-widest hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4" /> Nouvelle Invoice
            </button>
        );
    }

    return (
        <div className="bg-slate-900 border border-white/10 rounded-xl p-6 relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
            </button>
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" /> Générer Invoice
            </h4>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-widest block mb-1">Montant (€)</label>
                    <input
                        name="amount"
                        type="number"
                        step="0.01"
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
                        placeholder="1500.00"
                        required
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-widest block mb-1">Échéance</label>
                    <input
                        name="dueDate"
                        type="date"
                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
                        required
                    />
                </div>

                <button
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 rounded-lg text-white font-bold uppercase text-xs tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Générer & Envoyer
                </button>
            </form>
        </div>
    );
}

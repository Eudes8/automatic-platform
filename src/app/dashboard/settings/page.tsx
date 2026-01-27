import { getCurrentUser } from "@/lib/actions/users";
import prisma from "@/lib/prisma";
import { Shield } from "lucide-react";
import SettingsClient from "@/components/dashboard/SettingsClient";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const user = await getCurrentUser() as any;

    // Fetch user invoices for the "Factures" tab
    const invoices = user ? await prisma.invoice.findMany({
        where: { clientId: user.id },
        include: { project: true },
        orderBy: { createdAt: 'desc' }
    }) : [];

    return (
        <div className="max-w-7xl mx-auto space-y-16 p-10 lg:p-14 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-border/50 pb-12">
                <div>
                    <div className="flex items-center gap-3 mb-5">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                        <p className="text-[10px] text-primary/40 font-black uppercase tracking-[0.5em] italic">CONFIGURATION // COMPTE</p>
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black text-primary italic uppercase tracking-tighter leading-none">
                        PROFIL <span className="text-secondary/20">& SETTINGS.</span>
                    </h1>
                    <p className="text-secondary/40 font-black text-[10px] uppercase tracking-[0.4em] mt-5 italic max-w-xl leading-relaxed">
                        // Personnalisation de vos préférences et accès. <br />
                        Vos modifications sont appliquées instantanément.
                    </p>
                </div>

                <div className="flex flex-col items-end gap-3 text-right">
                    <div className="flex items-center gap-4 px-6 py-4 bg-primary/5 border border-primary/20 rounded-[1.5rem] italic">
                        <Shield size={16} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">SÉCURITÉ : VÉRIFIÉE</span>
                    </div>
                </div>
            </header>

            <SettingsClient user={user} invoices={invoices} />
        </div>
    );
}

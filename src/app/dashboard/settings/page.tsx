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
                    <h1 className="text-4xl md:text-5xl font-bold text-primary uppercase tracking-tight leading-none mb-4">
                        Paramètres
                    </h1>
                    <p className="text-secondary/60 font-medium text-lg leading-relaxed">
                        Gérez vos informations personnelles et vos préférences.
                    </p>
                </div>
            </header>

            <SettingsClient user={user} invoices={invoices} />
        </div>
    );
}

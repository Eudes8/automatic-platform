import { Suspense } from "react";
import { getClientTickets, createTicket } from "@/lib/actions/tickets";
import { getUserProjects } from "@/lib/actions/projects";
import { ClientTicketList } from "@/components/dashboard/tickets/ClientTicketList";
import { CreateTicketForm } from "@/components/dashboard/tickets/CreateTicketForm";
import { Skeleton } from "@/components/shared/Skeleton";

export const dynamic = 'force-dynamic';

async function TicketsPageContent() {
    const [tickets, projects] = await Promise.all([
        getClientTickets(),
        getUserProjects()
    ]);

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-14">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-accent font-bold uppercase text-[10px] tracking-widest inline-block py-2 px-6 bg-accent/5 rounded-full border border-accent/10">Service Client</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-bold text-primary tracking-tight uppercase leading-[0.8]">
                    Support <br /><span className="text-secondary/20">Client</span>
                </h1>
                <p className="text-secondary/40 font-bold text-[10px] uppercase tracking-widest mt-8 ml-1 leading-relaxed max-w-xl">
                    Soumettez vos demandes et suivez leur résolution.<br />
                    Temps de réponse moyen : moins de 24h.
                </p>
            </header>

            <CreateTicketForm projects={projects} onCreateTicket={createTicket} />

            <ClientTicketList tickets={tickets} />
        </div>
    );
}

export default function TicketsPage() {
    return (
        <Suspense fallback={<Skeleton className="h-96" />}>
            <TicketsPageContent />
        </Suspense>
    );
}
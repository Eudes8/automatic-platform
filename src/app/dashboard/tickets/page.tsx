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
                    <span className="text-accent font-black uppercase text-[10px] tracking-[0.5em] inline-block py-2 px-6 bg-accent/5 rounded-full border border-accent/10 italic shadow-inner">// Support_Module.Active</span>
                    <span className="text-secondary/20 font-black text-[10px] uppercase tracking-[0.3em] italic">/ UNITÉ_RÉPONSE_V2.0</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-heading font-black text-primary tracking-tighter uppercase italic leading-[0.8]">
                    Support <br /><span className="text-secondary/20 tracking-[-0.05em]">Technique.</span>
                </h1>
                <p className="text-secondary/40 font-black text-[10px] uppercase tracking-[0.4em] mt-8 ml-1 italic leading-relaxed max-w-xl">
                    // Ouverture de tickets d'incident et requêtes structurelles.<br />
                    Latence moyenne de réponse: &lt; 24H_PROTOCOLE.
                </p>
            </header>

            <CreateTicketForm projects={projects} onCreateTicket={createTicket} />

            <ClientTicketList tickets={tickets} />

            <footer className="mt-20 pt-10 border-t border-border/50">
                <p className="text-[10px] text-secondary/40 font-black uppercase tracking-[0.3em] italic text-center">
                    ORIGINE: AUTOMATIC_ABIDJAN_MAIN_NODE // RÉGULATION_L2024
                </p>
            </footer>
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
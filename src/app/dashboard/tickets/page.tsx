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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Support</h1>
            </div>

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
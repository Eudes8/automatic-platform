import { Suspense } from "react";
import { getAllTickets } from "@/lib/actions/tickets";
import { TicketList } from "@/components/admin/tickets/TicketList";
import { TicketStats } from "@/components/admin/tickets/TicketStats";
import { Skeleton } from "@/components/shared/Skeleton";

export const dynamic = 'force-dynamic';

async function TicketsPageContent({ searchParams }: { searchParams: { page?: string } }) {
    const page = parseInt(searchParams.page || "1");
    const { tickets, total, page: currentPage, limit, totalPages } = await getAllTickets(page);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Support Tickets</h1>
            </div>

            <TicketStats />

            <TicketList
                tickets={tickets}
                currentPage={currentPage}
                totalPages={totalPages}
                total={total}
            />
        </div>
    );
}

export default function TicketsPage({ searchParams }: { searchParams: { page?: string } }) {
    return (
        <Suspense fallback={<Skeleton className="h-96" />}>
            <TicketsPageContent searchParams={searchParams} />
        </Suspense>
    );
}
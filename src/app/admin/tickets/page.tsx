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
        <div className="space-y-12 p-10 lg:p-14 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-border/50 pb-12 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="w-10 h-px bg-primary/30" />
                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.5em] italic">UNITÉ_SUPPORT // ALPHA_MAIN_NODE</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-primary italic uppercase tracking-tighter leading-none">
                        TICKETS <span className="text-secondary/20">Support.</span>
                    </h1>
                </div>
            </header>

            <TicketStats />

            <div className="relative z-10">
                <TicketList
                    tickets={tickets}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    total={total}
                />
            </div>
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
import { Suspense } from "react";
import { getAllTickets } from "@/lib/actions/tickets";
import TicketTable from "@/components/admin/tickets/TicketTable";
import { Skeleton } from "@/components/shared/Skeleton";

export const dynamic = "force-dynamic";

async function TicketsContent({ page }: { page: number }) {
  const { tickets, total } = await getAllTickets(page, 100);

  const open = tickets.filter((ticket) => ticket.status === "OPEN").length;
  const running = tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length;
  const closed = tickets.filter((ticket) => ticket.status === "CLOSED").length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl sm:text-[2.2rem]">Assistance</h1>
        <p className="mt-2 text-[15px] text-secondary">
          {total} demande{total > 1 ? "s" : ""} au total : {open} à prendre, {running} en cours, {closed} résolue
          {closed > 1 ? "s" : ""}.
        </p>
      </header>

      {tickets.length === 0 ? (
        <p className="surface px-5 py-10 text-center text-[14px] text-secondary">
          Aucune demande pour le moment. Les messages clients marqués comme problème arrivent ici.
        </p>
      ) : (
        <TicketTable tickets={tickets} />
      )}
    </div>
  );
}

export default async function TicketsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const resolved = await searchParams;
  const page = Number.parseInt(resolved.page ?? "1", 10) || 1;

  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <TicketsContent page={page} />
    </Suspense>
  );
}

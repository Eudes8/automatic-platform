import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTicketDetails, addTicketResponse } from "@/lib/actions/tickets";
import { ClientTicketDetail } from "@/components/dashboard/tickets/ClientTicketDetail";
import { Skeleton } from "@/components/shared/Skeleton";

export const dynamic = 'force-dynamic';

async function TicketDetailPageContent({ id }: { id: string }) {
    const ticket = await getTicketDetails(id);

    if (!ticket) {
        notFound();
    }

    return (
        <ClientTicketDetail
            ticket={ticket}
            onAddResponse={addTicketResponse}
        />
    );
}

export default function TicketDetailPage({ params }: { params: { id: string } }) {
    return (
        <Suspense fallback={<Skeleton className="h-96" />}>
            <TicketDetailPageContent id={params.id} />
        </Suspense>
    );
}
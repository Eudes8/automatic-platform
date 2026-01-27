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

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <Suspense fallback={<Skeleton className="h-96" />}>
            <TicketDetailPageContent id={id} />
        </Suspense>
    );
}
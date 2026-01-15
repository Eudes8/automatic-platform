import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTicketDetails, updateTicketStatus, assignTicket, addTicketResponse } from "@/lib/actions/tickets";
import { getAllUsers } from "@/lib/actions/adminUserCRUD";
import { TicketDetail } from "@/components/admin/tickets/TicketDetail";
import { Skeleton } from "@/components/shared/Skeleton";

async function TicketDetailPageContent({ id }: { id: string }) {
    const [ticket, users] = await Promise.all([
        getTicketDetails(id),
        getAllUsers(1, 1000) // Get all users for assignment
    ]);

    if (!ticket) {
        notFound();
    }

    return (
        <TicketDetail
            ticket={ticket}
            users={users.users}
            onUpdateStatus={updateTicketStatus}
            onAssign={assignTicket}
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
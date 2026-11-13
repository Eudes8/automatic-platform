import Link from "next/link";
import { redirect } from "next/navigation";
import { LifeBuoy, MessageSquare, ChevronRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/users";
import { formatDate } from "@/lib/format";
import { TICKET_STATUS_LABEL, TICKET_PRIORITY_LABEL, toneFor } from "@/lib/labels";
import NewTicketForm from "@/components/dashboard/NewTicketForm";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [tickets, projects] = await Promise.all([
    prisma.ticket.findMany({
      where: { clientId: user.id },
      include: { _count: { select: { responses: true } }, project: { select: { title: true } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
    prisma.project.findMany({ where: { clientId: user.id }, select: { id: true, title: true }, orderBy: { updatedAt: "desc" } }),
  ]);

  const open = tickets.filter((ticket) => ticket.status === "OPEN" || ticket.status === "IN_PROGRESS").length;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-[2.2rem]">Support</h1>
          <p className="mt-2 text-[15px] text-secondary">
            {tickets.length === 0
              ? "Une question, un blocage ? Ouvrez une demande, nous répondons sous 24 h ouvrées."
              : `${open} demande${open > 1 ? "s" : ""} en cours sur ${tickets.length} au total.`}
          </p>
        </div>
        <NewTicketForm projects={projects} />
      </header>

      {tickets.length === 0 ? (
        <div className="surface flex flex-col items-start gap-3 px-6 py-10">
          <span className="grid h-11 w-11 place-items-center rounded-[12px] border border-border bg-background">
            <LifeBuoy size={20} className="text-accent" aria-hidden="true" />
          </span>
          <h2 className="text-xl">Aucune demande ouverte</h2>
          <p className="max-w-[52ch] text-[14px] text-secondary">
            Utilisez « Nouvelle demande » pour nous signaler un problème ou poser une question sur votre projet.
          </p>
        </div>
      ) : (
        <ul className="surface divide-y divide-border overflow-hidden">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <Link
                href={`/dashboard/tickets/${ticket.id}`}
                className="flex flex-wrap items-center gap-3 px-4 py-4 transition-colors hover:bg-card-hover md:px-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-semibold">{ticket.title}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneFor(ticket.status)}`}>
                      {TICKET_STATUS_LABEL[ticket.status] ?? ticket.status}
                    </span>
                    {(ticket.priority === "HIGH" || ticket.priority === "URGENT") && (
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneFor(ticket.priority)}`}>
                        {TICKET_PRIORITY_LABEL[ticket.priority]}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-1 text-[13px] text-secondary">{ticket.description}</p>
                  <p className="mt-0.5 text-[12px] text-muted">
                    {ticket.project?.title ? `${ticket.project.title} · ` : ""}
                    Ouvert le {formatDate(ticket.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[12px] text-muted">
                  <MessageSquare size={13} aria-hidden="true" />
                  {ticket._count.responses}
                  <ChevronRight size={15} aria-hidden="true" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

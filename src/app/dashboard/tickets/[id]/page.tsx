import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/users";
import { getTicketDetails } from "@/lib/actions/tickets";
import { formatDate } from "@/lib/format";
import { TICKET_STATUS_LABEL, TICKET_PRIORITY_LABEL, toneFor } from "@/lib/labels";
import TicketReplyForm from "@/components/dashboard/TicketReplyForm";

export const dynamic = "force-dynamic";

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const ticket = await getTicketDetails(id).catch(() => null);
  if (!ticket) notFound();

  const closed = ticket.status === "CLOSED";

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <Link
          href="/dashboard/tickets"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-secondary hover:text-foreground"
        >
          <ChevronLeft size={15} aria-hidden="true" /> Support
        </Link>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl">{ticket.title}</h1>
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${toneFor(ticket.status)}`}>
              {TICKET_STATUS_LABEL[ticket.status] ?? ticket.status}
            </span>
            <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium text-secondary">
              {TICKET_PRIORITY_LABEL[ticket.priority] ?? ticket.priority}
            </span>
          </div>
          <p className="mt-2 text-[13px] text-muted">
            Ouvert le {formatDate(ticket.createdAt)}
            {ticket.project?.title ? ` · ${ticket.project.title}` : ""}
            {ticket.assignedTo?.name ? ` · suivi par ${ticket.assignedTo.name}` : ""}
          </p>
        </div>
      </header>

      <section className="surface p-4 md:p-5">
        <p className="whitespace-pre-line text-[14px] leading-relaxed text-secondary">{ticket.description}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
          Échanges ({ticket.responses.length})
        </h2>

        {ticket.responses.length === 0 ? (
          <p className="surface px-5 py-6 text-[14px] text-secondary">
            Pas encore de réponse. Notre équipe revient vers vous sous 24 h ouvrées.
          </p>
        ) : (
          <ul className="space-y-3">
            {ticket.responses.map((response) => {
              const isTeam = response.author.role === "ADMIN" || response.author.role === "STAFF";
              return (
                <li
                  key={response.id}
                  className={`rounded-[14px] border p-4 ${
                    isTeam ? "border-accent/20 bg-accent/[0.03]" : "border-border bg-card"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-semibold">
                      {isTeam ? "Équipe AUTOMATIC" : response.author.name ?? "Vous"}
                    </span>
                    <span className="text-[12px] text-muted">{formatDate(response.createdAt)}</span>
                    {isTeam && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-accent">
                        <ShieldCheck size={12} aria-hidden="true" /> support
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 whitespace-pre-line text-[14px] leading-relaxed text-secondary">
                    {response.message}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="surface p-4 md:p-5">
        {closed ? (
          <p className="text-[13px] text-secondary">
            Cette demande est fermée. Ouvrez une nouvelle demande si le problème revient.
          </p>
        ) : (
          <TicketReplyForm ticketId={ticket.id} />
        )}
      </section>
    </div>
  );
}

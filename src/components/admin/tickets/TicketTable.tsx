"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Ticket, User, Project, TicketResponse, TicketStatus } from "@prisma/client";
import { TICKET_STATUS_LABEL, TICKET_PRIORITY_LABEL, toneFor } from "@/lib/labels";
import { formatDate } from "@/lib/format";

export type TicketRow = Ticket & {
  client: User | null;
  assignedTo: User | null;
  project: Project | null;
  responses: (TicketResponse & { author: User | null })[];
  _count?: { responses: number };
};

const FILTERS: { value: "ALL" | "OPEN" | "IN_PROGRESS" | "CLOSED"; label: string }[] = [
  { value: "ALL", label: "Tous" },
  { value: "OPEN", label: "À prendre" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "CLOSED", label: "Résolus" },
];

export default function TicketTable({ tickets }: { tickets: TicketRow[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "IN_PROGRESS" | "CLOSED">("ALL");

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tickets.filter((ticket) => {
      if (filter !== "ALL" && ticket.status !== filter) return false;
      if (!term) return true;
      return [ticket.title, ticket.description, ticket.client?.name, ticket.client?.email, ticket.project?.title]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [tickets, search, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher une demande, un client, un projet…"
            className="field h-10 pl-9 text-[13px]"
            aria-label="Rechercher une demande"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((option) => {
            const active = filter === option.value;
            const count =
              option.value === "ALL"
                ? tickets.length
                : tickets.filter((ticket) => ticket.status === option.value).length;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                aria-pressed={active}
                className={`rounded-[8px] border px-2.5 py-1.5 text-[12px] transition-colors ${
                  active
                    ? "border-primary/40 bg-primary/[0.06] font-semibold text-foreground"
                    : "border-border text-secondary hover:border-primary/30"
                }`}
              >
                {option.label} <span className="numeric text-muted">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="surface px-5 py-10 text-center text-[14px] text-secondary">
          Aucune demande ne correspond à ce filtre.
        </p>
      ) : (
        <ul className="surface divide-y divide-border overflow-hidden">
          {rows.map((ticket) => {
            const last = ticket.responses[0];
            return (
              <li key={ticket.id}>
                <Link
                  href={`/admin/tickets/${ticket.id}`}
                  className="flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-card-hover md:flex-row md:items-center md:gap-4 md:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-semibold">{ticket.title}</span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneFor(ticket.status)}`}
                      >
                        {TICKET_STATUS_LABEL[ticket.status as TicketStatus] ?? ticket.status}
                      </span>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-secondary">
                        {TICKET_PRIORITY_LABEL[ticket.priority] ?? ticket.priority}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-muted">
                      {ticket.client?.name ?? ticket.client?.email ?? "Client"}
                      {ticket.project ? ` · ${ticket.project.title}` : ""}
                      {last ? ` · dernière réponse de ${last.author?.name ?? "l’équipe"}` : " · sans réponse"}
                    </p>
                  </div>

                  <div className="shrink-0 text-[12px] text-secondary md:text-right">
                    <p>{formatDate(ticket.updatedAt)}</p>
                    <p className="text-muted">
                      {ticket.assignedTo ? `Suivi : ${ticket.assignedTo.name ?? "équipe"}` : "Non attribué"}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

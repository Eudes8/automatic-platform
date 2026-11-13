"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ClipboardList,
  LifeBuoy,
  Loader2,
  MessageSquare,
  Send,
} from "lucide-react";
import { sendChatMessage } from "@/lib/actions/messages";
import { createRequirement, addRequirementComment } from "@/lib/actions/requirements";
import { createTicket } from "@/lib/actions/tickets";

/* ------------------------------------------------------------------ */
/* Types d'affichage (aucun import Prisma côté client)                */
/* ------------------------------------------------------------------ */

export interface ThreadMessage {
  id: string;
  text: string;
  createdAt: string;
  mine: boolean;
  author: string;
  attachment?: string | null;
}

export interface ThreadRequirement {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  comments: number;
}

export interface ThreadTicket {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  responses: number;
}

interface ProjectThreadProps {
  projectId: string;
  messages: ThreadMessage[];
  requirements: ThreadRequirement[];
  tickets: ThreadTicket[];
  canWrite: boolean;
}

type EntryKind = "message" | "demande" | "probleme";

interface Entry {
  id: string;
  kind: EntryKind;
  at: string;
  message?: ThreadMessage;
  requirement?: ThreadRequirement;
  ticket?: ThreadTicket;
}

const STATUS_TONE: Record<string, string> = {
  SUGGESTED: "bg-primary/[0.06] text-secondary border-border",
  IN_REVIEW: "bg-warn/10 text-warn border-warn/25",
  APPROVED: "bg-ok/10 text-ok border-ok/20",
  REJECTED: "bg-danger/10 text-danger border-danger/25",
  OPEN: "bg-warn/10 text-warn border-warn/25",
  IN_PROGRESS: "bg-accent/10 text-accent border-accent/25",
  RESOLVED: "bg-ok/10 text-ok border-ok/20",
  CLOSED: "bg-primary/[0.04] text-secondary border-border",
};

const STATUS_LABEL: Record<string, string> = {
  SUGGESTED: "Proposé",
  IN_REVIEW: "En revue",
  APPROVED: "Validé",
  REJECTED: "Écarté",
  OPEN: "Ouvert",
  IN_PROGRESS: "En cours",
  RESOLVED: "Résolu",
  CLOSED: "Fermé",
};

function timeLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay
    ? date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

/* ------------------------------------------------------------------ */

/**
 * Un seul flux pour tout ce qui se dit sur un projet.
 *
 * Un message, une demande à valider et un problème signalé sont la même chose :
 * une entrée datée dans la conversation. Seul l'état change, pas l'endroit.
 */
export default function ProjectThread({
  projectId,
  messages,
  requirements,
  tickets,
  canWrite,
}: ProjectThreadProps) {
  const [text, setText] = useState("");
  const [kind, setKind] = useState<EntryKind>("message");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const router = useRouter();

  const entries: Entry[] = [
    ...messages.map((message) => ({
      id: message.id,
      kind: "message" as const,
      at: message.createdAt,
      message,
    })),
    ...requirements.map((requirement) => ({
      id: requirement.id,
      kind: "demande" as const,
      at: requirement.createdAt,
      requirement,
    })),
    ...tickets.map((ticket) => ({
      id: ticket.id,
      kind: "probleme" as const,
      at: ticket.createdAt,
      ticket,
    })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  function submit() {
    const value = text.trim();
    if (value.length < 2) {
      setError("Écrivez quelque chose avant d'envoyer.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        if (kind === "message") {
          await sendChatMessage(projectId, value);
        } else if (kind === "demande") {
          const title = value.split("\n")[0].slice(0, 80);
          await createRequirement(projectId, title, value, "FUNCTIONAL" as never);
        } else {
          const formData = new FormData();
          formData.append("title", value.split("\n")[0].slice(0, 80));
          formData.append("description", value);
          formData.append("priority", "MEDIUM");
          formData.append("projectId", projectId);
          await createTicket(formData);
        }
        setText("");
        router.refresh();
      } catch {
        setError("L'envoi a échoué. Réessayez.");
      }
    });
  }

  function sendReply(requirementId: string) {
    const value = reply.trim();
    if (value.length < 2) return;
    startTransition(async () => {
      try {
        await addRequirementComment(requirementId, value);
        setReply("");
        setReplyingTo(null);
        router.refresh();
      } catch {
        setError("La réponse n'a pas pu être envoyée.");
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Flux */}
      {entries.length === 0 ? (
        <div className="surface px-5 py-10 text-center">
          <p className="text-[14px] font-medium">Rien ne s&apos;est encore dit sur ce projet.</p>
          <p className="mt-1 text-[13px] text-secondary">
            Écrivez un message, demandez une validation ou signalez un problème : tout arrive ici.
          </p>
        </div>
      ) : (
        <ol className="space-y-3">
          {entries.map((entry) => {
            if (entry.kind === "message" && entry.message) {
              const message = entry.message;
              return (
                <li
                  key={entry.id}
                  className={`flex ${message.mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[14px] border px-4 py-3 ${
                      message.mine
                        ? "border-primary/20 bg-primary text-background"
                        : "border-border bg-card text-foreground"
                    }`}
                  >
                    {!message.mine && (
                      <p className="mb-1 text-[11px] font-semibold opacity-70">{message.author}</p>
                    )}
                    <p className="whitespace-pre-line text-[14px] leading-relaxed">{message.text}</p>
                    <p
                      className={`mt-1 text-[11px] ${
                        message.mine ? "text-background/60" : "text-muted"
                      }`}
                    >
                      {timeLabel(message.createdAt)}
                    </p>
                  </div>
                </li>
              );
            }

            if (entry.kind === "demande" && entry.requirement) {
              const requirement = entry.requirement;
              return (
                <li key={entry.id} className="rounded-[14px] border border-border bg-card p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
                      <ClipboardList size={12} aria-hidden="true" /> Demande
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                        STATUS_TONE[requirement.status] ?? ""
                      }`}
                    >
                      {STATUS_LABEL[requirement.status] ?? requirement.status}
                    </span>
                    <span className="ml-auto text-[11px] text-muted">{timeLabel(requirement.createdAt)}</span>
                  </div>

                  <p className="mt-2 text-[14px] font-semibold">{requirement.title}</p>
                  {requirement.description.trim() !== requirement.title.trim() && (
                    <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-secondary">
                      {requirement.description}
                    </p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-muted">
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare size={12} aria-hidden="true" /> {requirement.comments} commentaire
                      {requirement.comments > 1 ? "s" : ""}
                    </span>
                    {canWrite && (
                      <button
                        type="button"
                        onClick={() => setReplyingTo(replyingTo === requirement.id ? null : requirement.id)}
                        className="font-medium text-accent hover:underline"
                      >
                        Répondre
                      </button>
                    )}
                  </div>

                  {replyingTo === requirement.id && (
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <input
                        value={reply}
                        onChange={(event) => setReply(event.target.value)}
                        placeholder="Votre précision…"
                        className="field h-10 flex-1 text-[13px]"
                      />
                      <button
                        type="button"
                        onClick={() => sendReply(requirement.id)}
                        disabled={pending}
                        className="btn btn-primary h-10 px-4 text-[12px]"
                      >
                        Envoyer
                      </button>
                    </div>
                  )}
                </li>
              );
            }

            if (entry.kind === "probleme" && entry.ticket) {
              const ticket = entry.ticket;
              return (
                <li key={entry.id}>
                  <Link
                    href={`/dashboard/tickets/${ticket.id}`}
                    className="block rounded-[14px] border border-border bg-card p-4 transition-colors hover:bg-card-hover"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-warn">
                        <LifeBuoy size={12} aria-hidden="true" /> Problème
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                          STATUS_TONE[ticket.status] ?? ""
                        }`}
                      >
                        {STATUS_LABEL[ticket.status] ?? ticket.status}
                      </span>
                      <span className="ml-auto text-[11px] text-muted">{timeLabel(ticket.createdAt)}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <p className="flex-1 text-[14px] font-semibold">{ticket.title}</p>
                      <ChevronRight size={15} className="text-muted" aria-hidden="true" />
                    </div>
                    <p className="mt-1 text-[12px] text-muted">
                      {ticket.responses} réponse{ticket.responses > 1 ? "s" : ""}
                    </p>
                  </Link>
                </li>
              );
            }

            return null;
          })}
        </ol>
      )}

      {/* Un seul champ pour tout dire */}
      {canWrite && (
        <div className="surface p-4">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
            placeholder="Écrivez votre message…"
            className="field resize-none border-0 bg-transparent px-0 focus:shadow-none"
          />

          <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <label htmlFor="thread-kind" className="text-[12px] text-muted">
              Ce message est
            </label>
            <select
              id="thread-kind"
              value={kind}
              onChange={(event) => setKind(event.target.value as EntryKind)}
              className="rounded-[10px] border border-border bg-background px-2.5 py-1.5 text-[12px] font-medium"
            >
              <option value="message">un message</option>
              <option value="demande">une demande à valider</option>
              <option value="probleme">un problème à traiter</option>
            </select>

            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="btn btn-primary ml-auto h-10 px-4 text-[13px]"
            >
              {pending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Envoyer
            </button>
          </div>

          {error && <p className="mt-2 text-[12px] text-danger">{error}</p>}
        </div>
      )}
    </div>
  );
}

"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ClipboardList,
  FileUp,
  LifeBuoy,
  Loader2,
  MessageSquare,
  Paperclip,
  Send,
  ShieldCheck,
  X,
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
  authorName: string;
  authorRole: "CLIENT" | "STAFF" | "ADMIN" | string;
  attachment?: string | null;
  attachmentName?: string | null;
}

export interface ThreadComment {
  id: string;
  text: string;
  createdAt: string;
  authorName: string;
  authorRole: string;
}

export interface ThreadRequirement {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  authorName: string;
  authorRole: string;
  mine: boolean;
  attachment?: string | null;
  attachmentName?: string | null;
  comments: ThreadComment[];
}

export interface ThreadTicket {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  authorName: string;
  mine: boolean;
  responses: number;
  attachment?: string | null;
  attachmentName?: string | null;
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

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function isTeam(role: string): boolean {
  return role === "ADMIN" || role === "STAFF";
}

/** Pièce jointe affichée comme une puce téléchargeable. */
function AttachmentChip({
  url,
  name,
  inverse = false,
}: {
  url: string;
  name?: string | null;
  inverse?: boolean;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`mt-2 inline-flex max-w-full items-center gap-1.5 rounded-[10px] border px-2.5 py-1.5 text-[12px] transition-colors ${
        inverse
          ? "border-background/30 bg-background/15 text-background hover:bg-background/25"
          : "border-border bg-background text-secondary hover:border-primary/40 hover:text-foreground"
      }`}
    >
      <Paperclip size={12} aria-hidden="true" className="shrink-0" />
      <span className="truncate">{name ?? "Pièce jointe"}</span>
    </a>
  );
}

/** Pastille auteur : qui parle, et à quel titre. */
function AuthorBadge({
  name,
  role,
  at,
  inverse = false,
}: {
  name: string;
  role: string;
  at: string;
  inverse?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`grid h-6 w-6 place-items-center rounded-full text-[9px] font-semibold ${
          inverse ? "bg-background/20 text-background" : "bg-primary/10 text-primary"
        }`}
      >
        {initials(name)}
      </span>
      <span className={`text-[12px] font-medium ${inverse ? "text-background" : "text-foreground"}`}>
        {name}
      </span>
      {isTeam(role) && (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] ${
            inverse ? "bg-background/20 text-background" : "bg-accent/10 text-accent"
          }`}
        >
          <ShieldCheck size={10} aria-hidden="true" /> Équipe
        </span>
      )}
      <span className={`text-[11px] ${inverse ? "text-background/60" : "text-muted"}`}>{timeLabel(at)}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Un seul flux pour tout ce qui se dit sur un projet.
 *
 * Un message, une demande à valider et un problème signalé sont la même chose :
 * une entrée datée, signée par une personne, dans la conversation. Seul l'état
 * change, pas l'endroit.
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
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const entries: Entry[] = [
    ...messages.map((message) => ({ id: message.id, kind: "message" as const, at: message.createdAt, message })),
    ...requirements.map((requirement) => ({
      id: requirement.id,
      kind: "demande" as const,
      at: requirement.createdAt,
      requirement,
    })),
    ...tickets.map((ticket) => ({ id: ticket.id, kind: "probleme" as const, at: ticket.createdAt, ticket })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

  /** Envoie le fichier choisi, puis crée l'entrée avec son URL. */
  async function uploadAttachment(): Promise<string | null> {
    if (!file) return null;
    const body = new FormData();
    body.append("file", file);
    body.append("projectId", projectId);
    body.append("folder", "echanges");
    const response = await fetch("/api/files/upload", { method: "POST", body });
    const payload = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
    if (!response.ok || !payload?.url) {
      throw new Error(payload?.error ?? "Envoi de la pièce jointe impossible.");
    }
    return payload.url;
  }

  function submit() {
    const value = text.trim();
    if (value.length < 2 && !file) {
      setError("Écrivez quelque chose avant d'envoyer.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        const attachmentUrl = await uploadAttachment();
        if (kind === "message") {
          await sendChatMessage(projectId, value || "Pièce jointe", attachmentUrl ?? undefined);
        } else if (kind === "demande") {
          const title = value.split("\n")[0].slice(0, 80);
          await createRequirement(projectId, title, value, "FUNCTIONAL" as never, attachmentUrl ?? undefined);
        } else {
          const formData = new FormData();
          formData.append("title", value.split("\n")[0].slice(0, 80));
          formData.append("description", value);
          formData.append("priority", "MEDIUM");
          formData.append("projectId", projectId);
          if (attachmentUrl) formData.append("attachment", attachmentUrl);
          await createTicket(formData);
        }
        setText("");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
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

  if (entries.length === 0 && !canWrite) {
    return <p className="text-[14px] text-secondary">Aucun échange pour le moment.</p>;
  }

  return (
    <div className="space-y-5">
      {entries.length === 0 ? (
        <div className="surface px-5 py-10 text-center">
          <p className="text-[14px] font-medium">Rien ne s&apos;est encore dit sur ce projet.</p>
          <p className="mt-1 text-[13px] text-secondary">
            Écrivez un message, demandez une validation ou signalez un problème : tout arrive ici.
          </p>
        </div>
      ) : (
        <ol className="space-y-4">
          {entries.map((entry) => {
            if (entry.kind === "message" && entry.message) {
              const message = entry.message;
              return (
                <li key={entry.id} className={`flex ${message.mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-[14px] border px-4 py-3 ${
                      message.mine
                        ? "border-primary/20 bg-primary text-background"
                        : "border-border bg-card text-foreground"
                    }`}
                  >
                    <AuthorBadge
                      name={message.mine ? "Vous" : message.authorName}
                      role={message.authorRole}
                      at={message.createdAt}
                      inverse={message.mine}
                    />
                    <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed">{message.text}</p>
                    {message.attachment && (
                      <AttachmentChip url={message.attachment} name={message.attachmentName} inverse={message.mine} />
                    )}
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
                  </div>

                  <div className="mt-2">
                    <AuthorBadge
                      name={requirement.mine ? "Vous" : requirement.authorName}
                      role={requirement.authorRole}
                      at={requirement.createdAt}
                    />
                  </div>

                  <p className="mt-2 text-[14px] font-semibold">{requirement.title}</p>
                  {requirement.description.trim() !== requirement.title.trim() && (
                    <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-secondary">
                      {requirement.description}
                    </p>
                  )}
                  {requirement.attachment && (
                    <AttachmentChip url={requirement.attachment} name={requirement.attachmentName} />
                  )}

                  {requirement.comments.length > 0 && (
                    <ul className="mt-3 space-y-2 border-l-2 border-border pl-3">
                      {requirement.comments.map((comment) => (
                        <li key={comment.id}>
                          <AuthorBadge
                            name={comment.authorName}
                            role={comment.authorRole}
                            at={comment.createdAt}
                          />
                          <p className="mt-1 text-[13px] leading-relaxed text-secondary">{comment.text}</p>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-muted">
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare size={12} aria-hidden="true" /> {requirement.comments.length} réponse
                      {requirement.comments.length > 1 ? "s" : ""}
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
                        placeholder="Votre réponse…"
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
                    </div>

                    <div className="mt-2">
                      <AuthorBadge
                        name={ticket.mine ? "Vous" : ticket.authorName}
                        role="CLIENT"
                        at={ticket.createdAt}
                      />
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <p className="flex-1 text-[14px] font-semibold">{ticket.title}</p>
                      <ChevronRight size={15} className="text-muted" aria-hidden="true" />
                    </div>
                    <p className="mt-1 text-[12px] text-muted">
                      {ticket.responses} réponse{ticket.responses > 1 ? "s" : ""}
                    </p>
                    {ticket.attachment && (
                      <div className="mt-2">
                        <AttachmentChip url={ticket.attachment} name={ticket.attachmentName} />
                      </div>
                    )}
                  </Link>
                </li>
              );
            }

            return null;
          })}
        </ol>
      )}

      {canWrite && (
        <div className="surface p-4">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
            placeholder="Écrivez votre message…"
            className="field resize-none border-0 bg-transparent px-0 focus:shadow-none"
          />

          {file && (
            <div className="mb-2 inline-flex items-center gap-2 rounded-[10px] border border-border bg-background px-2.5 py-1.5 text-[12px] text-secondary">
              <Paperclip size={12} aria-hidden="true" />
              <span className="max-w-[220px] truncate">{file.name}</span>
              <span className="text-muted">{Math.max(1, Math.round(file.size / 1024))} Ko</span>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                aria-label="Retirer la pièce jointe"
                className="text-muted hover:text-danger"
              >
                <X size={13} aria-hidden="true" />
              </button>
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <div role="group" aria-label="Type d'envoi" className="flex flex-wrap gap-1">
              {[
                { value: "message" as EntryKind, label: "Message", icon: MessageSquare },
                { value: "demande" as EntryKind, label: "Demande", icon: ClipboardList },
                { value: "probleme" as EntryKind, label: "Problème", icon: LifeBuoy },
              ].map((option) => {
                const Icon = option.icon;
                const active = kind === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setKind(option.value)}
                    className={`inline-flex items-center gap-1.5 rounded-[10px] border px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
                      active
                        ? "border-primary/30 bg-primary/[0.07] text-foreground"
                        : "border-border bg-background text-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon size={12} aria-hidden="true" />
                    {option.label}
                  </button>
                );
              })}
            </div>

            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-border bg-background px-2.5 py-1.5 text-[12px] font-medium text-secondary transition-colors hover:text-foreground">
              <FileUp size={12} aria-hidden="true" />
              Joindre
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(event) => {
                  const chosen = event.target.files?.[0] ?? null;
                  if (chosen && chosen.size > MAX_ATTACHMENT_BYTES) {
                    setError("Pièce jointe trop lourde : 5 Mo maximum.");
                    event.target.value = "";
                    return;
                  }
                  setError(null);
                  setFile(chosen);
                }}
              />
            </label>

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

          <p className="mt-2 text-[11px] text-muted">
            Un message reste une discussion. Une demande entre dans le cahier des charges. Un problème ouvre un
            suivi dédié.
          </p>

          {error && <p className="mt-2 text-[12px] text-danger">{error}</p>}
        </div>
      )}
    </div>
  );
}

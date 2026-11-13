"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  BadgeCheck,
  CheckCircle2,
  Download,
  File as FileIcon,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageSquareWarning,
  Package,
} from "lucide-react";
import { reviewDeliverable } from "@/lib/actions/execution";
import {
  DELIVERABLE_CATEGORY_LABEL,
  DELIVERABLE_LABEL,
  DELIVERABLE_STYLE,
  formatDay,
  type DeliverableView,
} from "@/types/execution";

function fileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType === "application/pdf") return FileText;
  if (mimeType.includes("zip") || mimeType.includes("compressed")) return Archive;
  return FileIcon;
}

function fileSize(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

interface ProjectDeliverablesProps {
  deliverables: DeliverableView[];
  canReview: boolean;
}

/**
 * Tous les livrables du projet, version par version.
 * Le client peut accepter ou demander des corrections sur ceux qui sont soumis.
 */
export default function ProjectDeliverables({ deliverables, canReview }: ProjectDeliverablesProps) {
  const [items, setItems] = useState<DeliverableView[]>(deliverables);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [openFeedback, setOpenFeedback] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const router = useRouter();

  function decide(id: string, decision: "ACCEPT" | "REQUEST_CHANGES") {
    setError(null);
    if (decision === "REQUEST_CHANGES" && feedback.trim().length < 5) {
      setError("Précisez les corrections attendues (5 caractères minimum).");
      return;
    }

    startTransition(async () => {
      const result = await reviewDeliverable(id, decision, decision === "REQUEST_CHANGES" ? feedback : undefined);
      if (!result.success) {
        if (/introuvable/i.test(result.error ?? "")) {
          setItems((list) => list.filter((item) => item.id !== id));
          setError("Ce livrable n'existe plus. La liste vient d'être actualisée.");
          router.refresh();
          return;
        }
        setError(result.error ?? "Action impossible.");
        return;
      }
      setItems((list) =>
        list.map((item) =>
          item.id === id
            ? {
                ...item,
                status: decision === "ACCEPT" ? "ACCEPTED" : "CHANGES_REQUESTED",
                reviewedAt: new Date().toISOString(),
                feedback: decision === "REQUEST_CHANGES" ? feedback : null,
              }
            : item
        )
      );
      setFeedback("");
      setOpenFeedback(null);
    });
  }

  const waiting = items.filter((item) => item.status === "SUBMITTED");

  if (items.length === 0) {
    return (
      <div className="surface px-5 py-8">
        <p className="text-[14px] text-secondary">
          Aucun livrable pour l&apos;instant. Chaque version déposée par l&apos;équipe apparaîtra ici, avec son
          fichier et votre décision.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-muted">
        {items.length} livrable{items.length > 1 ? "s" : ""} · {waiting.length} en attente de votre décision
      </p>

      {error && (
        <p className="rounded-[10px] border border-danger/25 bg-danger/5 px-4 py-3 text-[13px] text-danger">
          {error}
        </p>
      )}

      <ul className="space-y-3">
        {items.map((item) => {
          const awaitingMe = item.status === "SUBMITTED";
          return (
            <li
              key={item.id}
              className={`rounded-[14px] border p-4 md:p-5 ${
                awaitingMe ? "border-warn/30 bg-warn/[0.04]" : "border-border bg-card"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Package size={15} className={awaitingMe ? "text-warn" : "text-muted"} aria-hidden="true" />
                <span className="text-[15px] font-semibold">{item.name}</span>
                <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-secondary">
                  {item.version}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${DELIVERABLE_STYLE[item.status]}`}
                >
                  {DELIVERABLE_LABEL[item.status]}
                </span>
                <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-secondary">
                  {DELIVERABLE_CATEGORY_LABEL[item.category] ?? "Autre"}
                </span>
              </div>

              {item.files.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {item.files.map((file) => {
                    const Icon = fileIcon(file.mimeType);
                    return (
                      <li key={file.id}>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-background px-2.5 py-1.5 text-[11px] hover:border-primary/40"
                        >
                          <Icon size={12} className="text-accent" aria-hidden="true" />
                          <span className="max-w-[180px] truncate">{file.name}</span>
                          {file.size > 0 && <span className="text-muted">{fileSize(file.size)}</span>}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}

              {item.description && (
                <p className="mt-2 text-[13px] leading-relaxed text-secondary">{item.description}</p>
              )}

              <p className="mt-1.5 text-[12px] text-muted">
                {item.milestone ? `${item.milestone.title} · ` : ""}
                Déposé le {formatDay(item.createdAt)}
                {item.submittedAt ? ` · soumis le ${formatDay(item.submittedAt)}` : ""}
                {item.reviewedAt ? ` · revu le ${formatDay(item.reviewedAt)}` : ""}
              </p>

              {item.feedback && (
                <p className="mt-2 rounded-[10px] border border-danger/20 bg-danger/5 px-3 py-2 text-[12px] text-danger">
                  <strong className="font-semibold">Votre retour :</strong> {item.feedback}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {item.fileUrl && item.files.length === 0 && (
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-[10px] border border-border px-3 py-2 text-[12px] font-medium hover:border-primary/40"
                  >
                    <Download size={13} aria-hidden="true" /> Ouvrir le fichier
                  </a>
                )}

                {awaitingMe && canReview && (
                  <>
                    <button
                      type="button"
                      onClick={() => decide(item.id, "ACCEPT")}
                      disabled={pending}
                      className="btn h-9 px-3 text-[12px] bg-ok text-white border border-ok disabled:opacity-60"
                    >
                      <BadgeCheck size={13} aria-hidden="true" /> Accepter
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenFeedback(openFeedback === item.id ? null : item.id)}
                      className="btn btn-outline h-9 px-3 text-[12px] text-danger border-danger/30"
                    >
                      <MessageSquareWarning size={13} aria-hidden="true" /> Demander des corrections
                    </button>
                  </>
                )}

                {awaitingMe && !canReview && (
                  <span className="text-[12px] text-warn">En attente de la décision du client</span>
                )}

                {pending && awaitingMe && <Loader2 size={14} className="animate-spin text-muted" />}

                {item.status === "ACCEPTED" && (
                  <span className="inline-flex items-center gap-1 text-[12px] text-ok">
                    <CheckCircle2 size={13} aria-hidden="true" /> Validé
                  </span>
                )}
              </div>

              {openFeedback === item.id && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    rows={3}
                    placeholder="Décrivez ce qui doit être corrigé…"
                    className="field resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => decide(item.id, "REQUEST_CHANGES")}
                    disabled={pending}
                    className="btn h-9 px-3 text-[12px] bg-danger text-white border border-danger disabled:opacity-60"
                  >
                    Envoyer la demande
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

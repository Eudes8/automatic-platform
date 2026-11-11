/** Libellés français des statuts métier (source unique pour toute l'interface). */

export const PROJECT_STATUS_LABEL: Record<string, string> = {
  ONBOARDING: "Cadrage",
  ANALYSIS: "Analyse",
  DESIGN: "Design",
  DEV: "Développement",
  QA: "Recette",
  DEPLOYMENT: "Mise en ligne",
  DONE: "Livré",
};

export const INVOICE_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "À payer",
  PAID: "Payée",
  OVERDUE: "En retard",
  CANCELLED: "Annulée",
};

export const TICKET_STATUS_LABEL: Record<string, string> = {
  OPEN: "Ouvert",
  IN_PROGRESS: "En cours",
  RESOLVED: "Résolu",
  CLOSED: "Fermé",
};

export const TICKET_PRIORITY_LABEL: Record<string, string> = {
  LOW: "Basse",
  MEDIUM: "Moyenne",
  HIGH: "Haute",
  URGENT: "Urgente",
};

export const REQUIREMENT_STATUS_LABEL: Record<string, string> = {
  SUGGESTED: "Proposé",
  IN_REVIEW: "En revue",
  APPROVED: "Validé",
  REJECTED: "Écarté",
};

/** Classes de puce de statut (fond doux + texte contrasté). */
export const STATUS_TONE: Record<string, string> = {
  DONE: "bg-ok/10 text-ok border-ok/20",
  PAID: "bg-ok/10 text-ok border-ok/20",
  ACCEPTED: "bg-ok/10 text-ok border-ok/20",
  VALIDATED: "bg-ok/10 text-ok border-ok/20",
  RESOLVED: "bg-ok/10 text-ok border-ok/20",

  SENT: "bg-warn/10 text-warn border-warn/25",
  OVERDUE: "bg-danger/10 text-danger border-danger/25",
  URGENT: "bg-danger/10 text-danger border-danger/25",
  CHANGES_REQUESTED: "bg-danger/10 text-danger border-danger/25",

  SUBMITTED: "bg-warn/10 text-warn border-warn/25",
  IN_REVIEW: "bg-warn/10 text-warn border-warn/25",
  IN_PROGRESS: "bg-accent/10 text-accent border-accent/25",
  DEV: "bg-accent/10 text-accent border-accent/25",
};

export function toneFor(status: string): string {
  return STATUS_TONE[status] ?? "bg-primary/[0.04] text-secondary border-border";
}

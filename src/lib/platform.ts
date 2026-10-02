// ─── Types partagés frontend ────────────────────────────────────────────────

export type User = {
  id: string
  email: string
  name: string
  role: "ADMIN" | "CLIENT"
  companyName: string | null
  phone: string | null
  createdAt: string
}

export type ProjectStatus =
  | "ONBOARDING"
  | "ANALYSIS"
  | "DESIGN"
  | "DEV"
  | "QA"
  | "DEPLOYMENT"
  | "DONE"

export type Project = {
  id: string
  reference: string
  title: string
  description: string | null
  category: string
  budget: number
  currency: string
  progress: number
  status: ProjectStatus
  techStack: string
  features: string
  timeline: string | null
  deadline: string | null
  contractSigned: boolean
  createdAt: string
  clientId: string
  client?: { id: string; name: string; email: string; companyName: string | null }
  _count?: { messages: number; tickets: number; invoices: number }
}

export type Ticket = {
  id: string
  reference: string
  title: string
  description: string
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  clientId: string
  assignedToId: string | null
  projectId: string | null
  createdAt: string
  updatedAt: string
  client?: { id: string; name: string; email: string }
  project?: { id: string; title: string } | null
  responses?: TicketResponse[]
  _count?: { responses: number }
}

export type TicketResponse = {
  id: string
  ticketId: string
  message: string
  isInternal: boolean
  createdAt: string
  author: { id: string; name: string; role: string }
}

export type Invoice = {
  id: string
  number: string
  projectId: string | null
  clientId: string
  amount: number
  currency: string
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED"
  description: string | null
  dueDate: string
  paidAt: string | null
  createdAt: string
  client?: { id: string; name: string; email: string }
  project?: { id: string; title: string } | null
}

export type Message = {
  id: string
  projectId: string
  senderId: string
  text: string
  createdAt: string
  read: boolean
  sender: { id: string; name: string; role: string }
}

export type Notification = {
  id: string
  title: string
  message: string
  type: string
  link: string | null
  read: boolean
  createdAt: string
}

export type PortfolioItem = {
  id: string
  title: string
  category: string
  description: string
  image: string
  tech: string
  url: string | null
  featured: boolean
}

export type ChatMessage = {
  id: string
  projectId: string
  text: string
  senderId: string
  senderName: string
  senderRole: string
  createdAt: string
  pending?: boolean
}

// ─── Libellés & styles ─────────────────────────────────────────────────────

export const PROJECT_STATUS_FLOW: ProjectStatus[] = [
  "ONBOARDING",
  "ANALYSIS",
  "DESIGN",
  "DEV",
  "QA",
  "DEPLOYMENT",
  "DONE",
]

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  ONBOARDING: "Onboarding",
  ANALYSIS: "Analyse",
  DESIGN: "Design",
  DEV: "Développement",
  QA: "Tests",
  DEPLOYMENT: "Déploiement",
  DONE: "Livré",
}

export const PROJECT_STATUS_COLOR: Record<ProjectStatus, string> = {
  ONBOARDING: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  ANALYSIS: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  DESIGN: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  DEV: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  QA: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  DEPLOYMENT: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  DONE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
}

export const TICKET_STATUS_LABEL: Record<Ticket["status"], string> = {
  OPEN: "Ouvert",
  IN_PROGRESS: "En cours",
  RESOLVED: "Résolu",
  CLOSED: "Fermé",
}

export const TICKET_STATUS_COLOR: Record<Ticket["status"], string> = {
  OPEN: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  IN_PROGRESS: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  RESOLVED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  CLOSED: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
}

export const TICKET_PRIORITY_LABEL: Record<Ticket["priority"], string> = {
  LOW: "Basse",
  MEDIUM: "Moyenne",
  HIGH: "Haute",
  URGENT: "Urgente",
}

export const TICKET_PRIORITY_COLOR: Record<Ticket["priority"], string> = {
  LOW: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  MEDIUM: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  HIGH: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  URGENT: "bg-red-500/15 text-red-400 border-red-500/30",
}

export const INVOICE_STATUS_LABEL: Record<Invoice["status"], string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyée",
  PAID: "Payée",
  OVERDUE: "En retard",
  CANCELLED: "Annulée",
}

export const INVOICE_STATUS_COLOR: Record<Invoice["status"], string> = {
  DRAFT: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  SENT: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  PAID: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  OVERDUE: "bg-red-500/15 text-red-400 border-red-500/30",
  CANCELLED: "bg-zinc-600/15 text-zinc-500 border-zinc-600/30",
}

export const CATEGORY_LABEL: Record<string, string> = {
  web: "Site Vitrine",
  mobile: "App Mobile",
  ecommerce: "E-commerce",
  saas: "Plateforme SaaS",
  branding: "Branding",
}

export function formatAmount(amount: number, currency = "XOF"): string {
  const suffix = currency === "XOF" ? " FCFA" : currency === "EUR" ? " €" : " $"
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount) + suffix
}

export function formatDate(date: string | Date, withTime = false): string {
  const d = new Date(date)
  if (withTime) {
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) + " · " +
      d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  }
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
}

export function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "à l'instant"
  if (min < 60) return `il y a ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `il y a ${h} h`
  const j = Math.floor(h / 24)
  if (j < 30) return `il y a ${j} j`
  return formatDate(date)
}

export function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

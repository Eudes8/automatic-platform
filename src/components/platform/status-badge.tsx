"use client"

import { cn } from "@/lib/utils"
import {
  PROJECT_STATUS_LABEL,
  PROJECT_STATUS_COLOR,
  TICKET_STATUS_LABEL,
  TICKET_STATUS_COLOR,
  TICKET_PRIORITY_LABEL,
  TICKET_PRIORITY_COLOR,
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_COLOR,
} from "@/lib/platform"

const base = "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"

export function ProjectStatusBadge({ status }: { status: string }) {
  const label = PROJECT_STATUS_LABEL[status as keyof typeof PROJECT_STATUS_LABEL] ?? status
  const color = PROJECT_STATUS_COLOR[status as keyof typeof PROJECT_STATUS_COLOR] ?? "bg-zinc-500/15 text-zinc-400 border-zinc-500/30"
  return <span className={cn(base, color)}>{label}</span>
}

export function TicketStatusBadge({ status }: { status: string }) {
  const label = TICKET_STATUS_LABEL[status as keyof typeof TICKET_STATUS_LABEL] ?? status
  const color = TICKET_STATUS_COLOR[status as keyof typeof TICKET_STATUS_COLOR] ?? ""
  return <span className={cn(base, color)}>{label}</span>
}

export function TicketPriorityBadge({ priority }: { priority: string }) {
  const label = TICKET_PRIORITY_LABEL[priority as keyof typeof TICKET_PRIORITY_LABEL] ?? priority
  const color = TICKET_PRIORITY_COLOR[priority as keyof typeof TICKET_PRIORITY_COLOR] ?? ""
  return <span className={cn(base, color)}>{label}</span>
}

export function InvoiceStatusBadge({ status }: { status: string }) {
  const label = INVOICE_STATUS_LABEL[status as keyof typeof INVOICE_STATUS_LABEL] ?? status
  const color = INVOICE_STATUS_COLOR[status as keyof typeof INVOICE_STATUS_COLOR] ?? ""
  return <span className={cn(base, color)}>{label}</span>
}

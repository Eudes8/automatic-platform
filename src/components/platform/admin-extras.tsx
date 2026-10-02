"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TicketPriorityBadge, TicketStatusBadge, InvoiceStatusBadge, TicketPriorityBadge as PrioBadge } from "./status-badge"
import type { Invoice, Project, Ticket, User } from "@/lib/platform"
import { formatAmount, formatDate, timeAgo, TICKET_PRIORITY_LABEL, TICKET_STATUS_LABEL, INVOICE_STATUS_LABEL, CATEGORY_LABEL } from "@/lib/platform"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  ChevronRight, Loader2, Plus, Pencil, Trash2, SendHorizonal, ShieldCheck, User as UserIcon,
} from "lucide-react"

// ─── Utilisateurs (CRUD) ────────────────────────────────────────────────────

type AdminUser = User & { _count?: { projects: number; tickets: number } }

export function AdminUsersView() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [dialog, setDialog] = useState<"create" | "edit" | null>(null)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CLIENT", companyName: "" })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/users")
    const data = await res.json()
    setUsers(data.users ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function openCreate() {
    setForm({ name: "", email: "", password: "", role: "CLIENT", companyName: "" })
    setDialog("create")
  }

  function openEdit(u: AdminUser) {
    setEditing(u)
    setForm({ name: u.name, email: u.email, password: "", role: u.role, companyName: u.companyName ?? "" })
    setDialog("edit")
  }

  async function save() {
    setSaving(true)
    try {
      const url = dialog === "create" ? "/api/admin/users" : `/api/admin/users/${editing?.id}`
      const payload =
        dialog === "create"
          ? form
          : { name: form.name, role: form.role, companyName: form.companyName, ...(form.password ? { password: form.password } : {}) }
      const res = await fetch(url, { method: dialog === "create" ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(dialog === "create" ? "Compte créé ✅" : "Compte mis à jour ✅")
      setDialog(null)
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur")
    } finally {
      setSaving(false)
    }
  }

  async function remove(u: AdminUser) {
    if (!confirm(`Supprimer définitivement ${u.name} et toutes ses données ?`)) return
    const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Compte supprimé")
      load()
    } else {
      const d = await res.json().catch(() => ({}))
      toast.error(d.error ?? "Erreur")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{users.length} compte(s)</p>
        <Button size="sm" onClick={openCreate} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
          <Plus size={15} className="mr-1" /> Nouveau compte
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-zinc-900 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2.5">
          {users.map((u) => (
            <div key={u.id} className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center gap-3 flex-wrap">
              <div className={cn("w-9 h-9 rounded-full flex items-center justify-center font-bold text-zinc-950 shrink-0",
                u.role === "ADMIN" ? "bg-gradient-to-br from-amber-400 to-orange-500" : "bg-gradient-to-br from-emerald-400 to-teal-600")}>
                {u.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold flex items-center gap-2">
                  {u.name}
                  {u.role === "ADMIN" && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">ADMIN</span>}
                </p>
                <p className="text-xs text-zinc-500 truncate">{u.email}{u.companyName ? ` · ${u.companyName}` : ""}</p>
              </div>
              <span className="text-xs text-zinc-500 shrink-0">{u._count?.projects ?? 0} projet(s) · {u._count?.tickets ?? 0} ticket(s)</span>
              <div className="flex gap-1.5 shrink-0">
                <Button size="sm" variant="outline" onClick={() => openEdit(u)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"><Pencil size={13} /></Button>
                <Button size="sm" variant="outline" onClick={() => remove(u)} className="border-red-500/30 text-red-400 hover:bg-red-500/10"><Trash2 size={13} /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {dialog && (
        <Dialog open onOpenChange={(v) => !v && setDialog(null)}>
          <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
            <DialogHeader><DialogTitle>{dialog === "create" ? "Créer un compte" : `Modifier ${editing?.name}`}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nom</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="bg-zinc-950/60 border-zinc-800" /></div>
              {dialog === "create" && (
                <div className="space-y-2"><Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="bg-zinc-950/60 border-zinc-800" /></div>
              )}
              <div className="space-y-2">
                <Label>{dialog === "create" ? "Mot de passe" : "Nouveau mot de passe (optionnel)"}</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="bg-zinc-950/60 border-zinc-800" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Rôle</Label>
                  <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                    <SelectTrigger className="bg-zinc-950/60 border-zinc-800"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10">
                      <SelectItem value="CLIENT">Client</SelectItem>
                      <SelectItem value="ADMIN">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Entreprise</Label>
                  <Input value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} className="bg-zinc-950/60 border-zinc-800" /></div>
              </div>
              <Button onClick={save} disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
                {saving && <Loader2 size={15} className="animate-spin mr-2" />} {dialog === "create" ? "Créer" : "Enregistrer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// ─── Tickets (admin) ────────────────────────────────────────────────────────

export function AdminTicketsView({ user, onChanged }: { user: User; onChanged: () => void }) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/tickets")
    const data = await res.json()
    setTickets(data.tickets ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (selected) return <AdminTicketDetail ticketId={selected} user={user} goBack={() => { setSelected(null); load(); onChanged() }} />

  const byStatus = (s: string) => tickets.filter((t) => t.status === s).length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
          <Card key={s} className="bg-zinc-900/60 border-white/5"><CardContent className="p-3 text-center">
            <p className="text-xl font-black">{byStatus(s)}</p>
            <p className="text-[10px] text-zinc-500">{TICKET_STATUS_LABEL[s as keyof typeof TICKET_STATUS_LABEL]}</p>
          </CardContent></Card>
        ))}
      </div>
      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-zinc-900 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2.5">
          {tickets.map((t) => (
            <button key={t.id} onClick={() => setSelected(t.id)}
              className="w-full text-left p-4 rounded-xl bg-zinc-900/60 border border-white/5 hover:border-emerald-500/30 transition-colors cursor-pointer flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-mono text-zinc-500">{t.reference} · {t.client?.name} · {timeAgo(t.updatedAt)}</p>
                <p className="font-semibold truncate">{t.title}</p>
              </div>
              <div className="flex gap-2 shrink-0"><TicketPriorityBadge priority={t.priority} /><TicketStatusBadge status={t.status} /></div>
              <ChevronRight size={16} className="text-zinc-600 shrink-0" />
            </button>
          ))}
          {tickets.length === 0 && <p className="text-sm text-zinc-500 text-center py-10">Aucun ticket.</p>}
        </div>
      )}
    </div>
  )
}

function AdminTicketDetail({ ticketId, user, goBack }: { ticketId: string; user: User; goBack: () => void }) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [response, setResponse] = useState("")
  const [internal, setInternal] = useState(false)
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch(`/api/tickets/${ticketId}`)
    if (res.ok) setTicket((await res.json()).ticket)
  }, [ticketId])

  useEffect(() => { load() }, [load])

  async function patch(data: Record<string, unknown>) {
    await fetch(`/api/tickets/${ticketId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    load()
  }

  async function send() {
    if (!response.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}/responses`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: response, isInternal: internal }),
      })
      if (!res.ok) throw new Error("Erreur d'envoi")
      setResponse("")
      setInternal(false)
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur")
    } finally {
      setSending(false)
    }
  }

  if (!ticket) return <div className="h-64 rounded-2xl bg-zinc-900 animate-pulse" />

  return (
    <div className="space-y-4 max-w-3xl">
      <button onClick={goBack} className="text-sm text-zinc-400 hover:text-emerald-400 flex items-center gap-1.5 cursor-pointer">
        <ChevronRight size={15} className="rotate-180" /> Retour aux tickets
      </button>

      <Card className="bg-zinc-900/60 border-white/5">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs font-mono text-zinc-500">{ticket.reference} · {ticket.client?.name}</p>
              <h2 className="text-lg font-bold">{ticket.title}</h2>
            </div>
            <div className="flex gap-2 items-center">
              <Select value={ticket.priority} onValueChange={(v) => patch({ priority: v })}>
                <SelectTrigger size="sm" className="bg-zinc-950/60 border-zinc-800 h-8 text-xs w-[110px]"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {Object.entries(TICKET_PRIORITY_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={ticket.status} onValueChange={(v) => patch({ status: v })}>
                <SelectTrigger size="sm" className="bg-zinc-950/60 border-zinc-800 h-8 text-xs w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {Object.entries(TICKET_STATUS_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-sm text-zinc-300 whitespace-pre-wrap bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">{ticket.description}</p>
          <div className="space-y-3">
            {ticket.responses?.map((r) => (
              <div key={r.id} className={cn("flex", r.author.role === "ADMIN" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] rounded-2xl px-4 py-3", r.author.role === "ADMIN" ? "bg-emerald-500/90 text-zinc-950 rounded-br-sm" : "bg-zinc-800 rounded-bl-sm")}>
                  <p className={cn("text-xs font-semibold mb-1 flex items-center gap-1.5", r.author.role === "ADMIN" ? "text-zinc-800" : "text-emerald-400")}>
                    {r.author.name}{r.isInternal && <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-500">INTERNE</span>}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{r.message}</p>
                  <p className={cn("text-[10px] mt-1.5 text-right", r.author.role === "ADMIN" ? "text-zinc-800" : "text-zinc-500")}>{timeAgo(r.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
              <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} className="accent-amber-400" />
              Note interne (non visible par le client)
            </label>
            <div className="flex gap-2">
              <Textarea value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Répondre au client…" rows={2} className="bg-zinc-950/60 border-zinc-800 resize-none" />
              <Button onClick={send} disabled={sending} size="icon" className={cn("shrink-0 self-end", internal ? "bg-amber-500 hover:bg-amber-400 text-zinc-950" : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950")} aria-label="Envoyer">
                {sending ? <Loader2 size={16} className="animate-spin" /> : <SendHorizonal size={16} />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Factures (admin) ───────────────────────────────────────────────────────

export function AdminInvoicesView({ onChanged }: { onChanged: () => void }) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ clientId: "", projectId: "none", amount: "", description: "", dueDate: "" })

  const load = useCallback(async () => {
    const [i, u, p] = await Promise.all([
      fetch("/api/invoices").then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
    ])
    setInvoices(i.invoices ?? [])
    setUsers((u.users ?? []).filter((x: AdminUser) => x.role === "CLIENT"))
    setProjects(p.projects ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  async function create() {
    if (!form.clientId || !form.amount || !form.dueDate) {
      toast.error("Client, montant et échéance requis")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/invoices", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, projectId: form.projectId === "none" ? undefined : form.projectId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success("Facture envoyée au client 🧾")
      setOpen(false)
      setForm({ clientId: "", projectId: "none", amount: "", description: "", dueDate: "" })
      load()
      onChanged()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur")
    } finally {
      setSaving(false)
    }
  }

  async function markPaid(inv: Invoice) {
    await fetch(`/api/invoices/${inv.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "PAID" }) })
    toast.success("Facture marquée payée ✅")
    load()
    onChanged()
  }

  const totalPaid = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0)
  const totalPending = invoices.filter((i) => i.status === "SENT" || i.status === "OVERDUE").reduce((s, i) => s + i.amount, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-3 text-sm">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold">Encaissé : {formatAmount(totalPaid)}</span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 font-semibold">En attente : {formatAmount(totalPending)}</span>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
          <Plus size={15} className="mr-1" /> Nouvelle facture
        </Button>
      </div>

      <div className="space-y-2.5">
        {invoices.map((inv) => (
          <div key={inv.id} className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center gap-3 flex-wrap">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-zinc-500">{inv.number} · {inv.client?.name}</p>
              <p className="font-bold">{formatAmount(inv.amount)}</p>
              <p className="text-xs text-zinc-500 truncate">{inv.description ?? inv.project?.title ?? "—"}</p>
            </div>
            <div className="text-right shrink-0">
              <InvoiceStatusBadge status={inv.status} />
              <p className="text-xs text-zinc-500 mt-1">Échéance : {formatDate(inv.dueDate)}</p>
            </div>
            {inv.status !== "PAID" && inv.status !== "CANCELLED" && (
              <Button size="sm" onClick={() => markPaid(inv)} className="bg-emerald-500/90 hover:bg-emerald-400 text-zinc-950 font-semibold shrink-0">
                Marquer payée
              </Button>
            )}
          </div>
        ))}
        {invoices.length === 0 && <p className="text-sm text-zinc-500 text-center py-10">Aucune facture.</p>}
      </div>

      {open && (
        <Dialog open onOpenChange={setOpen}>
          <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
            <DialogHeader><DialogTitle>Créer une facture</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Client</Label>
                <Select value={form.clientId} onValueChange={(v) => setForm((f) => ({ ...f, clientId: v }))}>
                  <SelectTrigger className="bg-zinc-950/60 border-zinc-800"><SelectValue placeholder="Choisir un client" /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Projet lié</Label>
                <Select value={form.projectId} onValueChange={(v) => setForm((f) => ({ ...f, projectId: v }))}>
                  <SelectTrigger className="bg-zinc-950/60 border-zinc-800"><SelectValue placeholder="Aucun" /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    <SelectItem value="none">Aucun</SelectItem>
                    {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Montant (FCFA)</Label>
                  <Input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className="bg-zinc-950/60 border-zinc-800" /></div>
                <div className="space-y-2"><Label>Échéance</Label>
                  <Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} className="bg-zinc-950/60 border-zinc-800" /></div>
              </div>
              <div className="space-y-2"><Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2}
                  placeholder="Ex : Acompte de démarrage (40%)" className="bg-zinc-950/60 border-zinc-800 resize-none" /></div>
              <Button onClick={create} disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
                {saving && <Loader2 size={15} className="animate-spin mr-2" />} Créer et envoyer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// ─── Portfolio (admin) ──────────────────────────────────────────────────────

export function AdminPortfolioView() {
  const [items, setItems] = useState<import("@/lib/platform").PortfolioItem[]>([])
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: "", category: "Site Vitrine", description: "", image: "", url: "" })

  const load = useCallback(async () => {
    const res = await fetch("/api/portfolio")
    const data = await res.json()
    setItems(data.items ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  async function create() {
    if (!form.title || !form.description || !form.image) {
      toast.error("Titre, description et image requis")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Erreur")
      toast.success("Projet ajouté au portfolio ✨")
      setOpen(false)
      setForm({ title: "", category: "Site Vitrine", description: "", image: "", url: "" })
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{items.length} réalisation(s) affichée(s) sur la landing</p>
        <Button size="sm" onClick={() => setOpen(true)} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
          <Plus size={15} className="mr-1" /> Ajouter
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p) => (
          <div key={p.id} className="rounded-2xl overflow-hidden border border-white/5 bg-zinc-900/60">
            { }
            <img src={p.image} alt={p.title} className="w-full h-36 object-cover" />
            <div className="p-4">
              <p className="text-xs text-emerald-400 font-semibold">{p.category}</p>
              <p className="font-semibold">{p.title}</p>
              <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{p.description}</p>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <Dialog open onOpenChange={setOpen}>
          <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
            <DialogHeader><DialogTitle>Ajouter une réalisation</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Titre</Label>
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="bg-zinc-950/60 border-zinc-800" /></div>
              <div className="space-y-2"><Label>Catégorie</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger className="bg-zinc-950/60 border-zinc-800"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {["Site Vitrine", "E-commerce", "Application Mobile", "Plateforme SaaS", "Branding"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="bg-zinc-950/60 border-zinc-800 resize-none" /></div>
              <div className="space-y-2"><Label>URL de l&apos;image</Label>
                <Input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="https://…" className="bg-zinc-950/60 border-zinc-800" /></div>
              <Button onClick={create} disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
                {saving && <Loader2 size={15} className="animate-spin mr-2" />} Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

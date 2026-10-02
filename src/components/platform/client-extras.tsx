"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { TicketPriorityBadge, TicketStatusBadge, InvoiceStatusBadge, ProjectStatusBadge } from "./status-badge"
import { ContractDialog } from "./contract-dialog"
import type { Invoice, Project, Ticket, User } from "@/lib/platform"
import { formatDate, formatAmount, timeAgo, TICKET_PRIORITY_LABEL } from "@/lib/platform"
import { useApp } from "@/lib/store"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  ChevronRight, Loader2, Plus, Wallet, ShieldCheck, Lock, LogOut, SendHorizonal, User as UserIcon,
} from "lucide-react"

// ─── Support / Tickets ──────────────────────────────────────────────────────

export function TicketsView({ user, tickets, projects, onChanged }: {
  user: User
  tickets: Ticket[]
  projects: Project[]
  onChanged: () => void
}) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM", projectId: "" })

  async function create() {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Titre et description requis")
      return
    }
    setCreating(true)
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, projectId: form.projectId || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success("Ticket créé ! Notre équipe vous répond au plus vite. 🎫")
      setOpen(false)
      setForm({ title: "", description: "", priority: "MEDIUM", projectId: "" })
      onChanged()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur")
    } finally {
      setCreating(false)
    }
  }

  if (selected) {
    return <TicketDetail ticketId={selected} user={user} goBack={() => { setSelected(null); onChanged() }} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{tickets.length} ticket(s) · {tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length} en cours</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold"><Plus size={15} className="mr-1" /> Nouveau ticket</Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-white/10 max-w-lg">
            <DialogHeader><DialogTitle>Ouvrir un ticket de support</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Titre</Label>
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ex : Erreur sur la page de paiement" className="bg-zinc-950/60 border-zinc-800" />
              </div>
              <div className="space-y-2">
                <Label>Description détaillée</Label>
                <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Décrivez le problème : que se passe-t-il, quand, sur quelle page…" rows={4} className="bg-zinc-950/60 border-zinc-800 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Priorité</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}>
                    <SelectTrigger className="bg-zinc-950/60 border-zinc-800"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10">
                      {Object.entries(TICKET_PRIORITY_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Projet concerné</Label>
                  <Select value={form.projectId} onValueChange={(v) => setForm((f) => ({ ...f, projectId: v }))}>
                    <SelectTrigger className="bg-zinc-950/60 border-zinc-800"><SelectValue placeholder="Aucun" /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10">
                      <SelectItem value="none">Aucun</SelectItem>
                      {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={create} disabled={creating} className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
                {creating && <Loader2 size={15} className="animate-spin mr-2" />} Envoyer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {tickets.length === 0 ? (
        <Card className="bg-zinc-900/60 border-white/5"><CardContent className="p-10 text-center flex flex-col items-center gap-2">
          <span className="text-3xl">🎫</span>
          <p className="font-semibold">Aucun ticket</p>
          <p className="text-sm text-zinc-500">Un problème ? Une question ? Ouvrez un ticket, l'équipe répond rapidement.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2.5">
          {tickets.map((t) => (
            <button key={t.id} onClick={() => setSelected(t.id)}
              className="w-full text-left p-4 rounded-xl bg-zinc-900/60 border border-white/5 hover:border-emerald-500/30 transition-colors cursor-pointer flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-mono text-zinc-500">{t.reference} · {timeAgo(t.updatedAt)}</p>
                <p className="font-semibold truncate">{t.title}</p>
                <p className="text-xs text-zinc-500 truncate">{t.project?.title ?? "Sans projet"} · {t._count?.responses ?? 0} réponse(s)</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <TicketPriorityBadge priority={t.priority} />
                <TicketStatusBadge status={t.status} />
              </div>
              <ChevronRight size={16} className="text-zinc-600 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function TicketDetail({ ticketId, user, goBack }: { ticketId: string; user: User; goBack: () => void }) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [response, setResponse] = useState("")
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch(`/api/tickets/${ticketId}`)
    if (res.ok) setTicket((await res.json()).ticket)
  }, [ticketId])

  useEffect(() => {
    load()
  }, [load])

  async function send() {
    if (!response.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: response }),
      })
      if (!res.ok) throw new Error("Erreur d'envoi")
      setResponse("")
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
        <ChevronRight size={15} className="rotate-180" /> Retour au support
      </button>
      <Card className="bg-zinc-900/60 border-white/5">
        <CardHeader>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs font-mono text-zinc-500">{ticket.reference}</p>
              <CardTitle className="text-lg">{ticket.title}</CardTitle>
            </div>
            <div className="flex gap-2"><TicketPriorityBadge priority={ticket.priority} /><TicketStatusBadge status={ticket.status} /></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-zinc-300 whitespace-pre-wrap bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">{ticket.description}</p>
          <div className="space-y-3">
            {ticket.responses?.map((r) => (
              <div key={r.id} className={cn("flex", r.author.role === "ADMIN" ? "justify-start" : "justify-end")}>
                <div className={cn("max-w-[85%] rounded-2xl px-4 py-3", r.author.role === "ADMIN" ? "bg-zinc-800 rounded-bl-sm" : "bg-emerald-500/90 text-zinc-950 rounded-br-sm")}>
                  <p className={cn("text-xs font-semibold mb-1", r.author.role === "ADMIN" ? "text-emerald-400" : "text-zinc-800")}>
                    {r.author.name}{r.author.role === "ADMIN" ? " · Équipe" : ""}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{r.message}</p>
                  <p className={cn("text-[10px] mt-1.5 text-right", r.author.role === "ADMIN" ? "text-zinc-500" : "text-zinc-800")}>{timeAgo(r.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
          {(ticket.status === "OPEN" || ticket.status === "IN_PROGRESS" || ticket.status === "RESOLVED") && (
            <div className="flex gap-2 pt-2">
              <Textarea value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Écrire une réponse…" rows={2} className="bg-zinc-950/60 border-zinc-800 resize-none" />
              <Button onClick={send} disabled={sending} size="icon" className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shrink-0 self-end" aria-label="Envoyer">
                {sending ? <Loader2 size={16} className="animate-spin" /> : <SendHorizonal size={16} />}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


// ─── Facturation ────────────────────────────────────────────────────────────

export function InvoicesView({ user, invoices, onChanged }: { user: User; invoices: Invoice[]; onChanged: () => void }) {
  const totalDue = invoices.filter((i) => i.status === "SENT" || i.status === "OVERDUE").reduce((s, i) => s + i.amount, 0)
  const totalPaid = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0)

  async function declarePayment(inv: Invoice) {
    const res = await fetch(`/api/invoices/${inv.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAID" }),
    })
    if (res.ok) {
      toast.success("Paiement déclaré ! Notre équipe confirme dès réception des fonds. 💳")
      onChanged()
    } else {
      toast.error("Erreur lors de la déclaration")
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-zinc-900/60 border-white/5"><CardContent className="p-4">
          <p className="text-xs text-zinc-500 flex items-center gap-1.5"><Wallet size={14} className="text-amber-400" /> Reste à payer</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{formatAmount(totalDue)}</p>
        </CardContent></Card>
        <Card className="bg-zinc-900/60 border-white/5"><CardContent className="p-4">
          <p className="text-xs text-zinc-500 flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400" /> Total réglé</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{formatAmount(totalPaid)}</p>
        </CardContent></Card>
      </div>

      {invoices.length === 0 ? (
        <Card className="bg-zinc-900/60 border-white/5"><CardContent className="p-10 text-center flex flex-col items-center gap-2">
          <span className="text-3xl">🧾</span><p className="font-semibold">Aucune facture</p>
          <p className="text-sm text-zinc-500">Vos factures apparaîtront ici après signature d'un contrat.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2.5">
          {invoices.map((inv) => (
            <div key={inv.id} className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-zinc-500">{inv.number}</p>
                <p className="font-bold">{formatAmount(inv.amount)}</p>
                <p className="text-xs text-zinc-500 truncate">{inv.description ?? inv.project?.title ?? "Prestation"}</p>
              </div>
              <div className="text-right shrink-0">
                <InvoiceStatusBadge status={inv.status} />
                <p className="text-xs text-zinc-500 mt-1">Échéance : {formatDate(inv.dueDate)}</p>
              </div>
              {(inv.status === "SENT" || inv.status === "OVERDUE") && (
                <Button size="sm" onClick={() => declarePayment(inv)} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
                  J'ai payé
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Paramètres ─────────────────────────────────────────────────────────────

export function SettingsView({ user, onUpdated }: { user: User; onUpdated: (u: User) => void }) {
  const [profile, setProfile] = useState({ name: user.name, companyName: user.companyName ?? "", phone: user.phone ?? "" })
  const [pwd, setPwd] = useState({ current: "", next: "" })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)
  const { logout } = useApp()

  async function saveProfile() {
    setSavingProfile(true)
    try {
      const res = await fetch("/api/auth/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onUpdated(data.user)
      toast.success("Profil mis à jour ✅")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur")
    } finally {
      setSavingProfile(false)
    }
  }

  async function savePwd() {
    if (pwd.next.length < 6) { toast.error("6 caractères minimum"); return }
    setSavingPwd(true)
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwd.current, newPassword: pwd.next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPwd({ current: "", next: "" })
      toast.success("Mot de passe modifié 🔒")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur")
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <Card className="bg-zinc-900/60 border-white/5">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><UserIcon size={16} className="text-emerald-400" /> Informations personnelles</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Nom complet</Label>
              <Input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className="bg-zinc-950/60 border-zinc-800" /></div>
            <div className="space-y-2"><Label>Entreprise</Label>
              <Input value={profile.companyName} onChange={(e) => setProfile((p) => ({ ...p, companyName: e.target.value }))} className="bg-zinc-950/60 border-zinc-800" /></div>
          </div>
          <div className="space-y-2"><Label>Téléphone</Label>
            <Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} placeholder="+225…" className="bg-zinc-950/60 border-zinc-800" /></div>
          <div className="space-y-2"><Label>Email</Label>
            <Input value={user.email} disabled className="bg-zinc-950/60 border-zinc-800 text-zinc-500" /></div>
          <Button onClick={saveProfile} disabled={savingProfile} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
            {savingProfile && <Loader2 size={15} className="animate-spin mr-2" />} Enregistrer
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/60 border-white/5">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock size={16} className="text-emerald-400" /> Sécurité</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Mot de passe actuel</Label>
              <Input type="password" value={pwd.current} onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))} className="bg-zinc-950/60 border-zinc-800" /></div>
            <div className="space-y-2"><Label>Nouveau mot de passe</Label>
              <Input type="password" value={pwd.next} onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))} className="bg-zinc-950/60 border-zinc-800" /></div>
          </div>
          <Button onClick={savePwd} disabled={savingPwd} variant="outline" className="border-zinc-700 text-zinc-200 hover:bg-zinc-800">
            {savingPwd && <Loader2 size={15} className="animate-spin mr-2" />} Modifier le mot de passe
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-red-500/5 border-red-500/20">
        <CardContent className="p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-semibold text-red-400">Déconnexion</p>
            <p className="text-sm text-zinc-400">Vous devrez vous reconnecter pour accéder à nouveau à votre espace.</p>
          </div>
          <Button onClick={() => logout()} variant="outline" className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300">
            <LogOut size={15} className="mr-1.5" /> Se déconnecter
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Logo } from "./logo"
import { NotificationBell, useNotifications } from "./notification-bell"
import { ChatPanel } from "./chat-panel"
import { ProjectStatusBadge } from "./status-badge"
import { AdminUsersView, AdminTicketsView, AdminInvoicesView, AdminPortfolioView } from "./admin-extras"
import { useApp } from "@/lib/store"
import type { Project, Ticket, User } from "@/lib/platform"
import { formatAmount, formatDate, timeAgo, CATEGORY_LABEL, PROJECT_STATUS_LABEL, PROJECT_STATUS_FLOW } from "@/lib/platform"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, FolderKanban, Users, LifeBuoy, Receipt, Image as ImageIcon,
  ArrowLeft, Wallet, Rocket, TrendingUp, MessageSquare, Loader2, Pencil, Plus,
} from "lucide-react"

type Section = "dashboard" | "projects" | "users" | "tickets" | "invoices" | "portfolio"

const NAV: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "projects", label: "Projets", icon: FolderKanban },
  { id: "users", label: "Clients", icon: Users },
  { id: "tickets", label: "Tickets", icon: LifeBuoy },
  { id: "invoices", label: "Factures", icon: Receipt },
  { id: "portfolio", label: "Portfolio", icon: ImageIcon },
]

const STATUS_COLORS: Record<string, string> = {
  ONBOARDING: "#a1a1aa", ANALYSIS: "#a78bfa", DESIGN: "#f472b6", DEV: "#fbbf24",
  QA: "#22d3ee", DEPLOYMENT: "#fb923c", DONE: "#34d399",
}

type Stats = {
  stats: {
    totalProjects: number
    activeProjects: number
    totalClients: number
    totalRevenue: number
    pendingRevenue: number
    openTickets: number
    unreadMessages: number
  }
  statusCounts: { status: string; count: number }[]
  monthlyRevenue: { label: string; amount: number }[]
  recentProjects: Project[]
  recentTickets: Ticket[]
}

export function AdminApp({ user }: { user: User }) {
  const { logout, setView } = useApp()
  const [section, setSection] = useState<Section>("dashboard")
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const { notifications, unread, markAllRead } = useNotifications(user)

  const refreshKey = useCallback(() => setSection((s) => s), [])

  function sidebar() {
    return (
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-white/5 bg-zinc-950/80 p-4 gap-1">
        <div className="px-2 py-3 mb-2"><Logo onClick={() => setSection("dashboard")} /></div>
        {NAV.map((n) => (
          <button key={n.id} onClick={() => { setSection(n.id); setSelectedProject(null) }}
            className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer",
              section === n.id ? "bg-emerald-500/12 text-emerald-400" : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5")}>
            <n.icon size={18} /> {n.label}
          </button>
        ))}
        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-zinc-950 text-sm font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-emerald-400">Administration</p>
            </div>
          </div>
          <button onClick={() => logout()} className="w-full text-left px-3 py-2 text-sm text-zinc-500 hover:text-red-400 transition-colors cursor-pointer">
            Se déconnecter
          </button>
        </div>
      </aside>
    )
  }

  function mobileNav() {
    return (
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/5 bg-zinc-950/95 backdrop-blur-xl flex justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {NAV.map((n) => (
          <button key={n.id} onClick={() => { setSection(n.id); setSelectedProject(null) }}
            className={cn("flex flex-col items-center gap-0.5 px-2 py-1 text-[9px] cursor-pointer", section === n.id ? "text-emerald-400" : "text-zinc-500")}>
            <n.icon size={18} />
            {n.label.slice(0, 8)}
          </button>
        ))}
      </nav>
    )
  }

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-100">
      {sidebar()}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="lg:hidden"><Logo size="sm" onClick={() => setSection("dashboard")} /></div>
            {selectedProject ? (
              <Button variant="ghost" size="sm" onClick={() => setSelectedProject(null)} className="text-zinc-400 -ml-2">
                <ArrowLeft size={16} /> Projets
              </Button>
            ) : (
              <div>
                <h1 className="font-bold text-lg leading-tight">{NAV.find((n) => n.id === section)?.label}</h1>
                <p className="text-xs text-zinc-500 hidden sm:block">Pilotage global de l&apos;activité</p>
              </div>
            )}
          </div>
          <NotificationBell user={user} notifications={notifications} unread={unread} markAllRead={markAllRead}
            onOpenProject={(pid) => { setSection("projects"); setSelectedProject(pid) }} />
        </header>

        <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-6 max-w-7xl w-full mx-auto">
          {section === "dashboard" && <Dashboard onOpenProject={(id) => { setSection("projects"); setSelectedProject(id) }} refreshKey={refreshKey} />}
          {section === "projects" && (
            selectedProject ? (
              <AdminProjectDetail projectId={selectedProject} user={user} goBack={() => setSelectedProject(null)} />
            ) : (
              <ProjectsAdmin onOpen={(id) => setSelectedProject(id)} />
            )
          )}
          {section === "users" && <AdminUsersView />}
          {section === "tickets" && <AdminTicketsView user={user} onChanged={refreshKey} />}
          {section === "invoices" && <AdminInvoicesView onChanged={refreshKey} />}
          {section === "portfolio" && <AdminPortfolioView />}
        </main>
        {mobileNav()}
      </div>
    </div>
  )
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

function Dashboard({ onOpenProject }: { onOpenProject: (id: string) => void }) {
  const [data, setData] = useState<Stats | null>(null)

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setData).catch(() => {})
  }, [])

  if (!data?.stats) {
    return <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-zinc-900 animate-pulse" />)}</div>
  }

  const cards = [
    { label: "Projets totaux", value: data.stats.totalProjects, sub: `${data.stats.activeProjects} actifs`, icon: Rocket, tone: "text-emerald-400" },
    { label: "Chiffre d'affaires", value: formatAmount(data.stats.totalRevenue), sub: "encaissé", icon: TrendingUp, tone: "text-emerald-400" },
    { label: "En attente", value: formatAmount(data.stats.pendingRevenue), sub: "à encaisser", icon: Wallet, tone: "text-amber-400" },
    { label: "Clients", value: data.stats.totalClients, sub: `${data.stats.openTickets} tickets ouverts`, icon: Users, tone: "text-cyan-400" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-zinc-900/60 border-white/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-zinc-500">{c.label}</p>
                  <c.icon size={16} className={c.tone} />
                </div>
                <p className="text-xl lg:text-2xl font-black mt-2 truncate">{c.value}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{c.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-zinc-900/60 border-white/5 lg:col-span-2">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp size={16} className="text-emerald-400" /> Revenus encaissés (6 mois)</CardTitle></CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyRevenue} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v: number) => v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)} />
                <Tooltip
                  formatter={(v) => [formatAmount(Number(v)), "Encaissé"]}
                  contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 12, color: "#f4f4f5" }}
                  cursor={{ fill: "#ffffff08" }} />
                <Bar dataKey="amount" fill="#34d399" radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/60 border-white/5">
          <CardHeader><CardTitle className="text-base">Répartition des projets</CardTitle></CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.statusCounts} dataKey="count" nameKey="status" innerRadius={54} outerRadius={85} paddingAngle={3} strokeWidth={0}>
                  {data.statusCounts.map((s) => <Cell key={s.status} fill={STATUS_COLORS[s.status] ?? "#71717a"} />)}
                </Pie>
                <Tooltip
                  formatter={(v, name) => [v, PROJECT_STATUS_LABEL[String(name) as keyof typeof PROJECT_STATUS_LABEL] ?? name]}
                  contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 12, color: "#f4f4f5" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 -mt-3">
              {data.statusCounts.map((s) => (
                <span key={s.status} className="flex items-center gap-1 text-[10px] text-zinc-400">
                  <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s.status] }} />
                  {PROJECT_STATUS_LABEL[s.status as keyof typeof PROJECT_STATUS_LABEL] ?? s.status}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-zinc-900/60 border-white/5">
          <CardHeader><CardTitle className="text-base">Derniers projets</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.recentProjects.map((p) => (
              <button key={p.id} onClick={() => onOpenProject(p.id)} className="w-full flex items-center justify-between gap-2 p-3 rounded-xl bg-zinc-950/50 hover:bg-zinc-800/60 transition-colors text-left cursor-pointer">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{p.title}</p>
                  <p className="text-xs text-zinc-500">{p.client?.name} · {timeAgo(p.updatedAt)}</p>
                </div>
                <ProjectStatusBadge status={p.status} />
              </button>
            ))}
            {data.recentProjects.length === 0 && <p className="text-sm text-zinc-500 text-center py-6">Aucun projet</p>}
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/60 border-white/5">
          <CardHeader><CardTitle className="text-base">Derniers tickets</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.recentTickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-zinc-950/50">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{t.title}</p>
                  <p className="text-xs text-zinc-500">{t.client?.name} · {t.reference}</p>
                </div>
                <span className={cn("text-xs shrink-0", t.status === "OPEN" ? "text-amber-400" : t.status === "IN_PROGRESS" ? "text-cyan-400" : "text-emerald-400")}>
                  {PROJECT_STATUS_LABEL[t.status as keyof typeof PROJECT_STATUS_LABEL] ?? t.status}
                </span>
              </div>
            ))}
            {data.recentTickets.length === 0 && <p className="text-sm text-zinc-500 text-center py-6">Aucun ticket</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Gestion des projets ────────────────────────────────────────────────────

function ProjectsAdmin({ onOpen }: { onOpen: (id: string) => void }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL")
  const [editing, setEditing] = useState<Project | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/projects")
    const data = await res.json()
    setProjects(data.projects ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = filter === "ALL" ? projects : projects.filter((p) => p.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px] bg-zinc-900 border-zinc-800"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10">
            <SelectItem value="ALL">Tous les statuts ({projects.length})</SelectItem>
            {PROJECT_STATUS_FLOW.map((s) => (
              <SelectItem key={s} value={s}>{PROJECT_STATUS_LABEL[s]} ({projects.filter((p) => p.status === s).length})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-zinc-900 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="bg-zinc-900/60 border-white/5"><CardContent className="p-10 text-center text-sm text-zinc-500">Aucun projet dans cette catégorie.</CardContent></Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((p) => (
            <div key={p.id} className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center gap-3 flex-wrap">
              <button onClick={() => onOpen(p.id)} className="min-w-0 flex-1 text-left cursor-pointer group">
                <p className="text-[11px] font-mono text-zinc-500">{p.reference} · {CATEGORY_LABEL[p.category] ?? p.category}</p>
                <p className="font-semibold group-hover:text-emerald-400 transition-colors truncate">{p.title}</p>
                <p className="text-xs text-zinc-500">{p.client?.name} · {formatAmount(p.budget)} · {p.progress}%</p>
              </button>
              <ProjectStatusBadge status={p.status} />
              <Button size="sm" variant="outline" onClick={() => setEditing(p)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                <Pencil size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {editing && <EditProjectDialog project={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />}
    </div>
  )
}

function EditProjectDialog({ project, onClose, onSaved }: { project: Project; onClose: () => void; onSaved: () => void }) {
  const [status, setStatus] = useState(project.status)
  const [progress, setProgress] = useState(project.progress)
  const [budget, setBudget] = useState(String(project.budget))
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, progress, budget: Number(budget) }),
      })
      if (!res.ok) throw new Error("Erreur de sauvegarde")
      toast.success("Projet mis à jour ✅")
      onSaved()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
        <DialogHeader><DialogTitle>Modifier « {project.title} »</DialogTitle></DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Statut</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-zinc-950/60 border-zinc-800"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {PROJECT_STATUS_FLOW.map((s) => <SelectItem key={s} value={s}>{PROJECT_STATUS_LABEL[s]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Progression : {progress}%</Label>
            <Slider value={[progress]} onValueChange={([v]) => setProgress(v)} max={100} step={5}
              className="[&_[data-slot=slider-range]]:bg-emerald-400 [&_[data-slot=slider-thumb]]:border-emerald-400" />
          </div>
          <div className="space-y-2">
            <Label>Budget (FCFA)</Label>
            <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="bg-zinc-950/60 border-zinc-800" />
          </div>
          <Button onClick={save} disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
            {saving && <Loader2 size={15} className="animate-spin mr-2" />} Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Détail projet côté admin ───────────────────────────────────────────────

function AdminProjectDetail({ projectId, user, goBack }: { projectId: string; user: User; goBack: () => void }) {
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    fetch(`/api/projects/${projectId}`).then((r) => r.json()).then((d) => setProject(d.project)).catch(() => {})
  }, [projectId])

  if (!project) return <div className="h-64 rounded-2xl bg-zinc-900 animate-pulse" />

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <p className="text-xs font-mono text-zinc-500">{project.reference} · {CATEGORY_LABEL[project.category] ?? project.category}</p>
            <h2 className="text-xl font-bold mt-1">{project.title}</h2>
            <p className="text-sm text-zinc-400 mt-2">{project.description}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-emerald-400">{formatAmount(project.budget)}</p>
            <p className="text-xs text-zinc-500">{project.client?.name} · {project.client?.email}</p>
            <div className="mt-2"><ProjectStatusBadge status={project.status} /></div>
          </div>
        </div>
      </div>
      <ChatPanel user={user} projectId={project.id} targetUserIds={[project.clientId]} className="h-[440px]" />
    </div>
  )
}

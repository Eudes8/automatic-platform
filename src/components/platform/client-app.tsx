"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Logo } from "./logo"
import { NotificationBell, useNotifications } from "./notification-bell"
import { ChatPanel } from "./chat-panel"
import { ContractDialog } from "./contract-dialog"
import { ProjectBuilder } from "./project-builder"
import { TicketsView, InvoicesView, SettingsView } from "./client-extras"
import { useApp } from "@/lib/store"
import type { Project, Ticket, Invoice, User } from "@/lib/platform"
import {
  formatAmount, formatDate, parseJsonArray, timeAgo, CATEGORY_LABEL,
  PROJECT_STATUS_FLOW, PROJECT_STATUS_LABEL,
} from "@/lib/platform"
import { ProjectStatusBadge, InvoiceStatusBadge } from "./status-badge"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, FolderKanban, LifeBuoy, Receipt, Settings, Bell,
  Plus, ArrowLeft, Calendar, Wallet, MessageSquare, FileSignature,
  ChevronRight, Rocket, CheckCircle2, Clock,
} from "lucide-react"

type Section = "overview" | "projects" | "tickets" | "invoices" | "settings" | "builder"

const NAV: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: "projects", label: "Mes projets", icon: FolderKanban },
  { id: "tickets", label: "Support", icon: LifeBuoy },
  { id: "invoices", label: "Facturation", icon: Receipt },
  { id: "settings", label: "Paramètres", icon: Settings },
]

export function ClientApp({ user }: { user: User }) {
  const { logout, setView } = useApp()
  const [section, setSection] = useState<Section>("overview")
  const [projects, setProjects] = useState<Project[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const { notifications, unread, markAllRead } = useNotifications(user)

  const loadAll = useCallback(async () => {
    const [p, t, i] = await Promise.all([
      fetch("/api/projects").then((r) => r.json()).catch(() => ({})),
      fetch("/api/tickets").then((r) => r.json()).catch(() => ({})),
      fetch("/api/invoices").then((r) => r.json()).catch(() => ({})),
    ])
    setProjects(p.projects ?? [])
    setTickets(t.tickets ?? [])
    setInvoices(i.invoices ?? [])
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const activeProjects = projects.filter((p) => p.status !== "DONE")
  const dueInvoices = invoices.filter((i) => i.status === "SENT" || i.status === "OVERDUE")
  const openTickets = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS")
  const unreadMessages = projects.reduce((s, p) => s + (p._count?.messages ?? 0), 0)

  function sidebar() {
    return (
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-white/5 bg-zinc-950/80 p-4 gap-1">
        <div className="px-2 py-3 mb-2"><Logo onClick={() => setSection("overview")} /></div>
        {NAV.map((n) => (
          <button key={n.id} onClick={() => { setSection(n.id); setSelectedProject(null) }}
            className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer",
              section === n.id ? "bg-emerald-500/12 text-emerald-400" : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5")}>
            <n.icon size={18} /> {n.label}
          </button>
        ))}
        <Button onClick={() => setSection("builder")} size="sm" className="mt-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
          <Plus size={15} className="mr-1" /> Nouveau projet
        </Button>
        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-zinc-950 text-sm font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user.companyName ?? user.email}</p>
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
            className={cn("flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] cursor-pointer", section === n.id ? "text-emerald-400" : "text-zinc-500")}>
            <n.icon size={19} />
            {n.label.split(" ")[0]}
          </button>
        ))}
      </nav>
    )
  }

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-100">
      {sidebar()}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="lg:hidden"><Logo size="sm" onClick={() => setSection("overview")} /></div>
            {selectedProject ? (
              <Button variant="ghost" size="sm" onClick={() => setSelectedProject(null)} className="text-zinc-400 -ml-2">
                <ArrowLeft size={16} /> Projets
              </Button>
            ) : (
              <div>
                <h1 className="font-bold text-lg leading-tight truncate">
                  {section === "overview" ? `Bonjour, ${user.name.split(" ")[0]} 👋` : NAV.find((n) => n.id === section)?.label}
                </h1>
                {section === "overview" && <p className="text-xs text-zinc-500 hidden sm:block">{formatDate(new Date())}</p>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell user={user} notifications={notifications} unread={unread} markAllRead={markAllRead}
              onOpenProject={(pid) => { setSection("projects"); setSelectedProject(pid) }} />
            <Button size="sm" onClick={() => setSection("builder")} className="hidden sm:inline-flex bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
              <Plus size={15} className="mr-1" /> Projet
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-6 max-w-6xl w-full mx-auto">
          {section === "overview" && (
            <Overview projects={projects} dueInvoices={dueInvoices.length} openTickets={openTickets.length}
              unreadMessages={unreadMessages} onOpenProject={(id) => { setSection("projects"); setSelectedProject(id) }}
              onNewProject={() => setSection("builder")} />
          )}
          {section === "projects" && (
            selectedProject ? (
              <ProjectDetail projectId={selectedProject} user={user} goBack={() => setSelectedProject(null)} onRefresh={loadAll} />
            ) : (
              <ProjectsList projects={projects} onOpen={(id) => setSelectedProject(id)} onNewProject={() => setSection("builder")} />
            )
          )}
          {section === "tickets" && <TicketsView user={user} tickets={tickets} projects={projects} onChanged={loadAll} />}
          {section === "invoices" && <InvoicesView user={user} invoices={invoices} onChanged={loadAll} />}
          {section === "settings" && <SettingsView user={user} onUpdated={(u) => useApp.getState().setUser(u)} />}
          {section === "builder" && (
            <div>
              <Button variant="ghost" onClick={() => setSection("projects")} className="text-zinc-400 mb-4 -ml-2">
                <ArrowLeft size={16} /> Annuler
              </Button>
              <ProjectBuilder embedded onCreated={() => { setSection("projects"); loadAll() }} />
            </div>
          )}
        </main>
        {mobileNav()}
      </div>
    </div>
  )
}

// ─── Vue d'ensemble ─────────────────────────────────────────────────────────

function Overview({ projects, dueInvoices, openTickets, unreadMessages, onOpenProject, onNewProject }: {
  projects: Project[]
  dueInvoices: number
  openTickets: number
  unreadMessages: number
  onOpenProject: (id: string) => void
  onNewProject: () => void
}) {
  const active = projects.filter((p) => p.status !== "DONE")
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Projets actifs", value: active.length, icon: Rocket, tone: "text-emerald-400" },
          { label: "Factures à payer", value: dueInvoices, icon: Wallet, tone: "text-amber-400" },
          { label: "Tickets ouverts", value: openTickets, icon: LifeBuoy, tone: "text-cyan-400" },
          { label: "Messages", value: unreadMessages, icon: MessageSquare, tone: "text-pink-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-zinc-900/60 border-white/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0"><s.icon size={19} className={s.tone} /></div>
              <div className="min-w-0">
                <p className="text-2xl font-black leading-none">{s.value}</p>
                <p className="text-xs text-zinc-500 mt-1 truncate">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">Vos projets</h2>
          <Button variant="ghost" size="sm" onClick={onNewProject} className="text-emerald-400 hover:text-emerald-300">
            <Plus size={15} className="mr-1" /> Nouveau
          </Button>
        </div>
        {projects.length === 0 ? (
          <Card className="bg-zinc-900/60 border-white/5">
            <CardContent className="p-10 text-center flex flex-col items-center gap-3">
              <span className="text-4xl">🚀</span>
              <p className="font-semibold">Lancez votre premier projet</p>
              <p className="text-sm text-zinc-500 max-w-sm">Utilisez le Project Builder pour configurer votre projet et obtenir une estimation instantanée.</p>
              <Button onClick={onNewProject} className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
                <Plus size={16} className="mr-1.5" /> Démarrer maintenant
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.slice(0, 4).map((p, i) => (
              <motion.button key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                onClick={() => onOpenProject(p.id)}
                className="text-left p-5 rounded-2xl bg-zinc-900/60 border border-white/5 hover:border-emerald-500/30 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <p className="text-[11px] text-zinc-500 font-mono">{p.reference}</p>
                    <h3 className="font-bold truncate">{p.title}</h3>
                  </div>
                  <ProjectStatusBadge status={p.status} />
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                  <span>{CATEGORY_LABEL[p.category] ?? p.category}</span>
                  <span className="font-semibold text-zinc-300">{formatAmount(p.budget)}</span>
                </div>
                <Progress value={p.progress} className="h-1.5 bg-zinc-800 [&_[data-slot=progress-indicator]]:bg-emerald-400" />
                <p className="text-xs text-zinc-500 mt-2">{p.progress}% — {PROJECT_STATUS_LABEL[p.status as keyof typeof PROJECT_STATUS_LABEL]}</p>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Liste des projets ──────────────────────────────────────────────────────

function ProjectsList({ projects, onOpen, onNewProject }: { projects: Project[]; onOpen: (id: string) => void; onNewProject: () => void }) {
  if (projects.length === 0) {
    return (
      <Card className="bg-zinc-900/60 border-white/5">
        <CardContent className="p-12 text-center flex flex-col items-center gap-3">
          <FolderKanban size={36} className="text-zinc-600" />
          <p className="font-semibold">Aucun projet pour le moment</p>
          <p className="text-sm text-zinc-500">Créez votre premier projet avec le Project Builder.</p>
          <Button onClick={onNewProject} className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
            <Plus size={16} className="mr-1.5" /> Nouveau projet
          </Button>
        </CardContent>
      </Card>
    )
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {projects.map((p, i) => (
        <motion.button key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          onClick={() => onOpen(p.id)}
          className="text-left p-5 rounded-2xl bg-zinc-900/60 border border-white/5 hover:border-emerald-500/30 transition-all hover:shadow-lg hover:shadow-emerald-500/5 cursor-pointer">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0">
              <p className="text-[11px] text-zinc-500 font-mono">{p.reference} · {CATEGORY_LABEL[p.category] ?? p.category}</p>
              <h3 className="font-bold truncate">{p.title}</h3>
            </div>
            <ProjectStatusBadge status={p.status} />
          </div>
          <p className="text-sm text-zinc-400 line-clamp-2 mb-4">{p.description ?? "Aucune description."}</p>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="flex items-center gap-1 text-zinc-500"><Wallet size={13} /> {formatAmount(p.budget)}</span>
            <span className="flex items-center gap-1 text-zinc-500"><Clock size={13} /> {p.timeline ?? "—"}</span>
            {p.contractSigned
              ? <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={13} /> Contrat signé</span>
              : <span className="flex items-center gap-1 text-amber-400"><FileSignature size={13} /> À signer</span>}
          </div>
          <Progress value={p.progress} className="h-1.5 bg-zinc-800 [&_[data-slot=progress-indicator]]:bg-emerald-400" />
          <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
            <span>{p.progress}%</span>
            <span className="flex items-center gap-0.5 text-emerald-400">Ouvrir <ChevronRight size={13} /></span>
          </div>
        </motion.button>
      ))}
    </div>
  )
}

// ─── Détail d'un projet ─────────────────────────────────────────────────────

export function ProjectDetail({ projectId, user, goBack, onRefresh }: {
  projectId: string
  user: User
  goBack: () => void
  onRefresh: () => void
}) {
  const [project, setProject] = useState<Project | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])

  const load = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}`)
    if (res.ok) setProject((await res.json()).project)
  }, [projectId])

  useEffect(() => {
    load()
  }, [load])

  async function loadInvoices() {
    const res = await fetch("/api/invoices")
    if (res.ok) {
      const data = await res.json()
      setInvoices((data.invoices as Invoice[]).filter((i) => i.projectId === projectId))
    }
  }

  useEffect(() => {
    loadInvoices()
     
  }, [projectId])

  if (!project) {
    return <div className="space-y-4"><div className="h-8 w-48 bg-zinc-900 rounded animate-pulse" /><div className="h-64 bg-zinc-900 rounded-2xl animate-pulse" /></div>
  }

  const statusIdx = PROJECT_STATUS_FLOW.indexOf(project.status)
  const tech = parseJsonArray(project.techStack)

  return (
    <div className="space-y-6">
      {/* En-tête projet */}
      <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-white/5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <p className="text-xs text-zinc-500 font-mono">{project.reference} · {CATEGORY_LABEL[project.category] ?? project.category}</p>
            <h2 className="text-xl font-bold mt-1">{project.title}</h2>
            <p className="text-sm text-zinc-400 mt-2 max-w-2xl">{project.description}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {tech.map((t) => <Badge key={t} variant="secondary" className="bg-white/5 text-zinc-300 border-0 text-xs">{t}</Badge>)}
            </div>
          </div>
          <div className="text-right space-y-1">
            <p className="text-2xl font-black text-emerald-400">{formatAmount(project.budget)}</p>
            <p className="text-xs text-zinc-500 flex items-center justify-end gap-1"><Calendar size={12} /> {project.timeline ?? "Délai en cours"}</p>
            {project.deadline && <p className="text-xs text-zinc-500">Échéance : {formatDate(project.deadline)}</p>}
          </div>
        </div>

        {/* Timeline des phases */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progression : {project.progress}%</span>
            <ProjectStatusBadge status={project.status} />
          </div>
          <Progress value={project.progress} className="h-2 bg-zinc-800 [&_[data-slot=progress-indicator]]:bg-gradient-to-r [&_[data-slot=progress-indicator]]:from-emerald-500 [&_[data-slot=progress-indicator]]:to-teal-400" />
          <div className="flex justify-between mt-3 overflow-x-auto">
            {PROJECT_STATUS_FLOW.map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-1 min-w-[56px]">
                <div className={cn("w-3 h-3 rounded-full border-2 transition-colors",
                  i < statusIdx ? "bg-emerald-500 border-emerald-500" : i === statusIdx ? "bg-emerald-400 border-emerald-400 shadow-lg shadow-emerald-500/40" : "bg-zinc-800 border-zinc-700")} />
                <span className={cn("text-[9px] sm:text-[10px] whitespace-nowrap", i <= statusIdx ? "text-emerald-400 font-medium" : "text-zinc-600")}>
                  {PROJECT_STATUS_LABEL[s]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="chat">
        <TabsList className="bg-zinc-900 border border-white/5 h-auto p-1 flex-wrap">
          <TabsTrigger value="chat" className="data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400"><MessageSquare size={14} className="mr-1.5" /> Discussion</TabsTrigger>
          <TabsTrigger value="contract" className="data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400"><FileSignature size={14} className="mr-1.5" /> Contrat</TabsTrigger>
          <TabsTrigger value="invoices" className="data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400"><Receipt size={14} className="mr-1.5" /> Factures</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-4">
          <ChatPanel user={user} projectId={project.id} className="h-[440px]" />
        </TabsContent>

        <TabsContent value="contract" className="mt-4">
          <Card className="bg-zinc-900/60 border-white/5">
            <CardHeader>
              <CardTitle className="text-base">Contrat de prestation</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-sm text-zinc-400">
                {project.contractSigned ? (
                  <p className="flex items-center gap-2 text-emerald-400"><CheckCircle2 size={16} /> Contrat signé électroniquement. Vous pouvez consulter le document complet.</p>
                ) : (
                  <p>Lisez les termes du contrat et signez électroniquement pour démarrer officiellement votre projet. Une facture d&apos;acompte de 40% est générée automatiquement.</p>
                )}
              </div>
              <ContractDialog
                projectId={project.id}
                signed={project.contractSigned}
                onSigned={() => { load(); onRefresh() }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4 space-y-3">
          {invoices.length === 0 ? (
            <Card className="bg-zinc-900/60 border-white/5"><CardContent className="p-8 text-center text-sm text-zinc-500">Aucune facture liée à ce projet pour l&apos;instant.</CardContent></Card>
          ) : (
            invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between gap-3 p-4 rounded-xl bg-zinc-900/60 border border-white/5">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-zinc-500">{inv.number}</p>
                  <p className="font-semibold truncate">{formatAmount(inv.amount)}</p>
                  <p className="text-xs text-zinc-500 truncate">{inv.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <InvoiceStatusBadge status={inv.status} />
                  <p className="text-xs text-zinc-500 mt-1">Échéance {formatDate(inv.dueDate)}</p>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

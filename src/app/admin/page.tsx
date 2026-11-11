import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  LifeBuoy,
  Package,
  Receipt,
  Users,
  FolderOpen,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { formatMoney, formatDate } from "@/lib/format";
import { PROJECT_STATUS_LABEL, INVOICE_STATUS_LABEL, toneFor } from "@/lib/labels";

export const dynamic = "force-dynamic";

function isPast(date: Date | string): boolean {
  const value = typeof date === "string" ? new Date(date) : date;
  return value.getTime() < Date.now();
}

export default async function AdminDashboard() {
  const [
    clientsCount,
    activeProjects,
    invoices,
    submittedDeliverables,
    openTickets,
    projects,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.project.count({ where: { status: { not: "DONE" } } }),
    prisma.invoice.findMany({
      orderBy: { dueDate: "asc" },
      select: { id: true, amount: true, status: true, dueDate: true, client: { select: { name: true, email: true } }, project: { select: { title: true } } },
    }),
    prisma.deliverable.findMany({
      where: { status: "SUBMITTED" },
      orderBy: { submittedAt: "asc" },
      select: { id: true, name: true, projectId: true, project: { select: { title: true } } },
    }),
    prisma.ticket.findMany({
      where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
      orderBy: { createdAt: "asc" },
      take: 5,
      select: { id: true, title: true, priority: true, client: { select: { name: true, email: true } } },
    }),
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        status: true,
        progress: true,
        client: { select: { name: true, email: true } },
        _count: { select: { tasks: true } },
        milestones: {
          where: { status: { not: "VALIDATED" } },
          orderBy: { dueDate: "asc" },
          take: 1,
          select: { title: true, dueDate: true },
        },
      },
    }),
  ]);

  const unpaid = invoices.filter((invoice) => invoice.status === "SENT" || invoice.status === "OVERDUE");
  const overdue = unpaid.filter((invoice) => isPast(invoice.dueDate));
  const unpaidTotal = unpaid.reduce((sum, invoice) => sum + invoice.amount, 0);
  const collectedTotal = invoices
    .filter((invoice) => invoice.status === "PAID")
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidCount = invoices.filter((invoice) => invoice.status === "PAID").length;

  const queue = [
    ...overdue.map((invoice) => ({
      key: `inv-${invoice.id}`,
      icon: Receipt,
      label: "Facture en retard",
      title: `${formatMoney(invoice.amount)} · ${invoice.client?.name ?? invoice.client?.email ?? "Client"}`,
      href: "/admin/invoices",
      tone: "text-danger",
    })),
    ...submittedDeliverables.map((deliverable) => ({
      key: `del-${deliverable.id}`,
      icon: Package,
      label: "Livrable en attente client",
      title: `${deliverable.name} · ${deliverable.project.title}`,
      href: `/admin/projects/${deliverable.projectId}/execution`,
      tone: "text-warn",
    })),
    ...openTickets.map((ticket) => ({
      key: `tk-${ticket.id}`,
      icon: LifeBuoy,
      label: "Ticket ouvert",
      title: `${ticket.title} · ${ticket.client?.name ?? ticket.client?.email ?? "Client"}`,
      href: `/admin/tickets/${ticket.id}`,
      tone: "text-accent",
    })),
  ].slice(0, 6);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl sm:text-[2.2rem]">Vue d&apos;ensemble</h1>
        <p className="mt-2 text-[15px] text-secondary">
          {activeProjects} projet{activeProjects > 1 ? "s" : ""} en cours, {unpaid.length} facture
          {unpaid.length > 1 ? "s" : ""} à encaisser.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Encaissé" value={formatMoney(collectedTotal)} hint={`${paidCount} facture${paidCount > 1 ? "s" : ""} payée${paidCount > 1 ? "s" : ""}`} />
        <Metric label="À encaisser" value={formatMoney(unpaidTotal)} hint={`${unpaid.length} facture${unpaid.length > 1 ? "s" : ""} en attente`} />
        <Metric label="Projets actifs" value={String(activeProjects)} hint={`${projects.length} projet${projects.length > 1 ? "s" : ""} récent${projects.length > 1 ? "s" : ""}`} />
        <Metric label="Clients" value={String(clientsCount)} hint="Comptes espace client" />
      </section>

      {queue.length > 0 && (
        <section aria-labelledby="queue" className="space-y-3">
          <h2 id="queue" className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
            À traiter
          </h2>
          <ul className="surface divide-y divide-border overflow-hidden">
            {queue.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.key}>
                  <Link href={item.href} className="flex items-center gap-4 px-4 py-3.5 hover:bg-card-hover transition-colors md:px-5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-border bg-background">
                      <Icon size={16} className={item.tone} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-foreground">{item.label}</p>
                      <p className="truncate text-[13px] text-secondary">{item.title}</p>
                    </div>
                    <ArrowRight size={15} className="shrink-0 text-muted" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="projects" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="projects" className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
            Projets récents
          </h2>
          <Link href="/admin/projects" className="text-[13px] font-medium text-accent hover:underline">
            Tous les projets
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="surface flex flex-col items-start gap-3 px-6 py-10">
            <span className="grid h-11 w-11 place-items-center rounded-[12px] border border-border bg-background">
              <FolderOpen size={20} className="text-accent" aria-hidden="true" />
            </span>
            <h3 className="text-xl">Aucun projet en cours</h3>
            <p className="max-w-[52ch] text-[14px] text-secondary">
              Les projets créés depuis l&apos;espace client apparaîtront ici avec leur avancement et leurs
              livrables.
            </p>
          </div>
        ) : (
          <ul className="surface divide-y divide-border overflow-hidden">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/admin/projects/${project.id}/execution`}
                  className="grid gap-3 px-4 py-4 hover:bg-card-hover transition-colors md:grid-cols-12 md:items-center md:px-5"
                >
                  <div className="md:col-span-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-semibold text-foreground">{project.title}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneFor(project.status)}`}>
                        {PROJECT_STATUS_LABEL[project.status] ?? project.status}
                      </span>
                    </div>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted">
                      <Users size={12} aria-hidden="true" />
                      {project.client?.name ?? project.client?.email ?? "Client"}
                    </p>
                  </div>

                  <div className="md:col-span-4">
                    <div className="flex items-center justify-between text-[12px] text-secondary">
                      <span>{project._count.tasks} tâches</span>
                      <span className="numeric">{project.progress}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-primary/[0.07]">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-3 text-[12px] text-secondary md:text-right">
                    {project.milestones[0]
                      ? `${project.milestones[0].title} · ${formatDate(project.milestones[0].dueDate)}`
                      : "Aucun jalon planifié"}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {invoices.length > 0 && (
        <section aria-labelledby="invoices" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="invoices" className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
              Dernières factures
            </h2>
            <Link href="/admin/invoices" className="text-[13px] font-medium text-accent hover:underline">
              Toute la facturation
            </Link>
          </div>
          <ul className="surface divide-y divide-border">
            {invoices.slice(0, 5).map((invoice) => (
              <li key={invoice.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-foreground">
                    {invoice.client?.name ?? invoice.client?.email ?? "Client"}
                  </p>
                  <p className="truncate text-[12px] text-muted">
                    {invoice.project?.title ?? "Sans projet"} · échéance {formatDate(invoice.dueDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="numeric text-[13px] font-semibold">{formatMoney(invoice.amount)}</p>
                  <p className="text-[11px] text-secondary">{INVOICE_STATUS_LABEL[invoice.status]}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="flex items-center gap-2 text-[12px] text-muted">
        <BadgeCheck size={14} className="text-ok" aria-hidden="true" />
        Données en direct de la base Neon. Aucune métrique simulée.
      </p>
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="surface px-5 py-4">
      <p className="text-[12px] text-muted">{label}</p>
      <p className="numeric mt-1 text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-[12px] text-secondary">{hint}</p>
    </div>
  );
}

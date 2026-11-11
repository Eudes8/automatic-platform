import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  FileSignature,
  FolderOpen,
  Package,
  Receipt,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/users";
import { formatDate, formatMoney, daysUntil } from "@/lib/format";
import { PROJECT_STATUS_LABEL, INVOICE_STATUS_LABEL, toneFor } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { clientId: user.id },
    include: {
      invoices: { orderBy: { createdAt: "desc" } },
      deliverables: { where: { status: "SUBMITTED" }, select: { id: true, name: true } },
      milestones: {
        where: { status: { not: "VALIDATED" } },
        orderBy: { dueDate: "asc" },
        take: 1,
        select: { title: true, dueDate: true },
      },
      tasks: { select: { status: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const pendingInvoices = projects
    .flatMap((project) => project.invoices.map((invoice) => ({ ...invoice, projectTitle: project.title })))
    .filter((invoice) => invoice.status === "SENT" || invoice.status === "OVERDUE")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const submittedDeliverables = projects.flatMap((project) =>
    project.deliverables.map((deliverable) => ({ ...deliverable, projectId: project.id, projectTitle: project.title }))
  );

  const unsignedProjects = projects.filter((project) => !project.contractSigned);

  const actions = [
    ...unsignedProjects.map((project) => ({
      key: `contract-${project.id}`,
      icon: FileSignature,
      label: "Signer le contrat",
      title: project.title,
      detail: "Le projet démarre dès la signature.",
      href: `/dashboard/projects/${project.id}`,
      tone: "text-warn",
    })),
    ...submittedDeliverables.map((deliverable) => ({
      key: `deliverable-${deliverable.id}`,
      icon: Package,
      label: "Valider un livrable",
      title: deliverable.name,
      detail: `Projet ${deliverable.projectTitle}`,
      href: `/dashboard/projects/${deliverable.projectId}`,
      tone: "text-accent",
    })),
    ...pendingInvoices.slice(0, 3).map((invoice) => ({
      key: `invoice-${invoice.id}`,
      icon: Receipt,
      label: "Régler une facture",
      title: `${formatMoney(invoice.amount)} · échéance ${formatDate(invoice.dueDate)}`,
      detail: `Projet ${invoice.projectTitle}`,
      href: "/dashboard/invoices",
      tone: "text-accent",
    })),
  ];

  const openProjects = projects.filter((project) => project.status !== "DONE");
  const unpaidTotal = pendingInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const firstName = (user.name || user.email).split(/[ @]/)[0];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl sm:text-[2.4rem]">Bonjour {firstName}.</h1>
        <p className="mt-2 text-[15px] text-secondary">
          {projects.length === 0
            ? "Votre espace est prêt. Démarrons votre premier projet."
            : `${openProjects.length} projet${openProjects.length > 1 ? "s" : ""} en cours, ${
                actions.length
              } action${actions.length > 1 ? "s" : ""} de votre part.`}
        </p>
      </header>

      {/* Décisions en attente */}
      {actions.length > 0 && (
        <section aria-labelledby="decisions" className="space-y-3">
          <h2 id="decisions" className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
            En attente de votre décision
          </h2>
          <ul className="surface divide-y divide-border overflow-hidden">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <li key={action.key}>
                  <Link
                    href={action.href}
                    className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-card-hover md:px-5"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] border border-border bg-background">
                      <Icon size={18} className={action.tone} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-foreground">{action.label}</p>
                      <p className="truncate text-[13px] text-secondary">
                        {action.title}
                        <span className="text-muted"> · {action.detail}</span>
                      </p>
                    </div>
                    <ArrowRight size={16} className="shrink-0 text-muted" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {actions.length === 0 && projects.length > 0 && (
        <section className="surface flex items-start gap-3 px-5 py-4">
          <BadgeCheck size={18} className="mt-0.5 text-ok" aria-hidden="true" />
          <div>
            <p className="text-[14px] font-semibold text-foreground">Rien à valider pour le moment.</p>
            <p className="text-[13px] text-secondary">Vos projets avancent. Vous serez notifié dès qu&apos;une décision sera nécessaire.</p>
          </div>
        </section>
      )}

      {/* Projets */}
      <section aria-labelledby="projects" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="projects" className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
            Mes projets
          </h2>
          <Link href="/dashboard/projects" className="text-[13px] font-medium text-accent hover:underline">
            Tout voir
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="surface flex flex-col items-start gap-4 px-6 py-10">
            <span className="grid h-11 w-11 place-items-center rounded-[12px] border border-border bg-background">
              <FolderOpen size={20} className="text-accent" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-xl">Aucun projet pour l&apos;instant</h3>
              <p className="mt-1 max-w-[52ch] text-[14px] text-secondary">
                Décrivez votre besoin en quelques minutes. Nous revenons avec un périmètre et un budget.
              </p>
            </div>
            <Link href="/onboarding" className="btn btn-primary h-11 px-5">
              Démarrer un projet
            </Link>
          </div>
        ) : (
          <ul className="surface divide-y divide-border overflow-hidden">
            {projects.map((project) => {
              const done = project.tasks.filter((task) => task.status === "DONE").length;
              const total = project.tasks.length;
              const nextMilestone = project.milestones[0];
              const remaining = daysUntil(nextMilestone?.dueDate ?? null);

              return (
                <li key={project.id}>
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="grid gap-4 px-4 py-5 transition-colors hover:bg-card-hover md:grid-cols-12 md:items-center md:px-5"
                  >
                    <div className="md:col-span-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[15px] font-semibold text-foreground">{project.title}</span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneFor(
                            project.status
                          )}`}
                        >
                          {PROJECT_STATUS_LABEL[project.status] ?? project.status}
                        </span>
                      </div>
                      {nextMilestone ? (
                        <p className="mt-1 flex items-center gap-1.5 text-[12px] text-secondary">
                          <CalendarClock size={13} className="text-muted" aria-hidden="true" />
                          {nextMilestone.title} · {formatDate(nextMilestone.dueDate)}
                          {remaining !== null && remaining >= 0 && (
                            <span className="text-muted"> ({remaining} j)</span>
                          )}
                        </p>
                      ) : (
                        <p className="mt-1 text-[12px] text-muted">Aucun jalon planifié</p>
                      )}
                    </div>

                    <div className="md:col-span-5">
                      <div className="flex items-center justify-between text-[12px] text-secondary">
                        <span>Avancement</span>
                        <span className="numeric">{project.progress}%</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-primary/[0.07]">
                        <div
                          className="h-full rounded-full bg-accent transition-[width] duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-[11px] text-muted">
                        {total > 0 ? `${done} tâche${done > 1 ? "s" : ""} terminée${done > 1 ? "s" : ""} sur ${total}` : "Planning en préparation"}
                      </p>
                    </div>

                    <div className="md:col-span-2 flex md:justify-end">
                      <span className="inline-flex items-center gap-1 text-[13px] font-medium text-accent">
                        Ouvrir <ArrowRight size={14} aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Facturation */}
      {pendingInvoices.length > 0 && (
        <section aria-labelledby="billing" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="billing" className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
              À régler
            </h2>
            <Link href="/dashboard/invoices" className="text-[13px] font-medium text-accent hover:underline">
              Toutes les factures
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="surface px-5 py-4 md:col-span-1">
              <p className="text-[12px] text-muted">Total à payer</p>
              <p className="numeric mt-1 text-2xl font-semibold text-foreground">{formatMoney(unpaidTotal)}</p>
              <p className="mt-1 text-[12px] text-secondary">
                {pendingInvoices.length} facture{pendingInvoices.length > 1 ? "s" : ""} en attente
              </p>
            </div>

            <ul className="surface divide-y divide-border md:col-span-2">
              {pendingInvoices.slice(0, 3).map((invoice) => (
                <li key={invoice.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-foreground">{invoice.projectTitle}</p>
                    <p className="text-[12px] text-muted">Échéance {formatDate(invoice.dueDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="numeric text-[13px] font-semibold">{formatMoney(invoice.amount)}</p>
                    <p className="text-[11px] text-warn">{INVOICE_STATUS_LABEL[invoice.status]}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}

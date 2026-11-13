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
import { PROJECT_STATUS_LABEL, toneFor } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { clientId: user.id },
    include: {
      invoices: { select: { amount: true, amountPaid: true, status: true, dueDate: true } },
      deliverables: { where: { status: "SUBMITTED" }, select: { id: true, name: true, projectId: true } },
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

  const pendingInvoices = projects.flatMap((project) =>
    project.invoices
      .filter((invoice) => invoice.status === "SENT" || invoice.status === "OVERDUE")
      .map((invoice) => ({ ...invoice, projectTitle: project.title }))
  );

  const submitted = projects.flatMap((project) =>
    project.deliverables.map((deliverable) => ({
      ...deliverable,
      projectTitle: project.title,
    }))
  );

  const unsigned = projects.filter((project) => !project.contractSigned);
  const totalDue = pendingInvoices.reduce(
    (sum, invoice) => sum + Math.max(0, invoice.amount - invoice.amountPaid),
    0
  );

  const actions = [
    ...unsigned.map((project) => ({
      key: `contract-${project.id}`,
      icon: FileSignature,
      label: "Signer le contrat",
      detail: project.title,
      href: `/dashboard/projects/${project.id}`,
      tone: "text-warn",
    })),
    ...submitted.map((deliverable) => ({
      key: `deliverable-${deliverable.id}`,
      icon: Package,
      label: "Valider un livrable",
      detail: `${deliverable.name} · ${deliverable.projectTitle}`,
      href: `/dashboard/projects/${deliverable.projectId}?tab=livrables`,
      tone: "text-warn",
    })),
    ...(totalDue > 0
      ? [
          {
            key: "invoices",
            icon: Receipt,
            label: "Régler une facture",
            detail: `${formatMoney(totalDue)} restant à payer`,
            href: "/dashboard/invoices",
            tone: "text-accent",
          },
        ]
      : []),
  ];

  const firstName = (user.name || user.email).split(/[ @]/)[0];
  const mainProject = projects[0];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl sm:text-[2.4rem]">Bonjour {firstName}.</h1>
        <p className="mt-2 text-[15px] text-secondary">
          {projects.length === 0
            ? "Votre espace est prêt. Démarrons votre premier projet."
            : actions.length > 0
              ? `${actions.length} chose${actions.length > 1 ? "s" : ""} attend${actions.length > 1 ? "ent" : ""} votre décision.`
              : "Rien ne requiert votre attention. Votre projet avance."}
        </p>
      </header>

      {actions.length > 0 && (
        <section aria-labelledby="decisions" className="space-y-3">
          <h2 id="decisions" className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
            À faire maintenant
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
                      <p className="text-[14px] font-semibold">{action.label}</p>
                      <p className="truncate text-[13px] text-secondary">{action.detail}</p>
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
            <p className="text-[14px] font-semibold">Tout est à jour.</p>
            <p className="text-[13px] text-secondary">
              Vous serez notifié dès qu&apos;une signature, une validation ou un paiement sera nécessaire.
            </p>
          </div>
        </section>
      )}

      {projects.length === 0 ? (
        <div className="surface flex flex-col items-start gap-4 px-6 py-10">
          <span className="grid h-11 w-11 place-items-center rounded-[12px] border border-border bg-background">
            <FolderOpen size={20} className="text-accent" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl">Aucun projet pour l&apos;instant</h2>
            <p className="mt-1 max-w-[52ch] text-[14px] text-secondary">
              Décrivez votre besoin en quelques minutes. Nous revenons avec un périmètre et un budget.
            </p>
          </div>
          <Link href="/onboarding" className="btn btn-primary h-11 px-5">
            Démarrer un projet
          </Link>
        </div>
      ) : (
        <section aria-labelledby="project" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="project" className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
              {projects.length > 1 ? "Vos projets" : "Votre projet"}
            </h2>
            {projects.length > 1 && (
              <Link href="/dashboard/projects" className="text-[13px] font-medium text-accent hover:underline">
                Tout voir
              </Link>
            )}
          </div>

          <ul className="surface divide-y divide-border">
            {(projects.length > 1 ? projects : [mainProject]).map((project) => {
              const done = project.tasks.filter((task) => task.status === "DONE").length;
              const total = project.tasks.length;
              const milestone = project.milestones[0];
              const remaining = daysUntil(milestone?.dueDate ?? null);

              return (
                <li key={project.id}>
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="block px-4 py-4 transition-colors hover:bg-card-hover md:px-5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-semibold">{project.title}</span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneFor(project.status)}`}
                      >
                        {PROJECT_STATUS_LABEL[project.status] ?? project.status}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[12px] text-secondary">
                      <span>
                        {milestone
                          ? `${milestone.title} · ${formatDate(milestone.dueDate)}${
                              remaining !== null && remaining >= 0 ? ` (${remaining} j)` : ""
                            }`
                          : "Planning en préparation"}
                      </span>
                      <span className="numeric">{project.progress}%</span>
                    </div>

                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-primary/[0.07]">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                      />
                    </div>

                    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted">
                      <CalendarClock size={11} aria-hidden="true" />
                      {total > 0
                        ? `${done} tâche${done > 1 ? "s" : ""} terminée${done > 1 ? "s" : ""} sur ${total}`
                        : "Aucune tâche planifiée"}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

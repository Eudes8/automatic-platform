import { getClientProjects } from "@/lib/actions/projects";
import { getCurrentUser } from "@/lib/actions/users";
import { getProjectExecution } from "@/lib/actions/execution";
import ContractBarrier from "@/components/dashboard/ContractBarrier";
import RequirementWorkspace from "@/components/dashboard/RequirementWorkspace";
import ChatSidebar from "@/components/dashboard/ChatSidebar";
import NewTicketForm from "@/components/dashboard/NewTicketForm";
import ProjectDeliverables from "@/components/projects/ProjectDeliverables";
import {
  ChevronLeft,
  CalendarClock,
  Wallet,
  Layers,
  CheckCircle2,
  Users,
  Download,
  FileText,
  MessageSquare,
  ClipboardList,
  LifeBuoy,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { RequirementWithDetails } from "@/components/dashboard/RequirementWorkspace";
import { Project, Asset, Contract, Invoice, User } from "@prisma/client";
import prisma from "@/lib/prisma";
import { PROJECT_STATUS_LABEL, TICKET_STATUS_LABEL, toneFor } from "@/lib/labels";
import { formatMoney, formatDate } from "@/lib/format";
import { MILESTONE_LABEL, MILESTONE_STYLE, TEAM_ROLE_LABEL, formatDay, initialsOf } from "@/types/execution";

type ProjectWithDetails = Project & {
  client: User | null;
  assets: Asset[];
  contracts: Contract[];
  invoices: (Invoice & { project?: { title: string } | null })[];
  requirements: RequirementWithDetails[];
};

const TABS = [
  { key: "apercu", label: "Aperçu" },
  { key: "echanges", label: "Échanges" },
  { key: "livrables", label: "Livrables" },
] as const;

type TabKey = (typeof TABS)[number]["key"];
type VueKey = "conversation" | "demandes" | "support";

const VUES: { key: VueKey; label: string; icon: typeof MessageSquare }[] = [
  { key: "conversation", label: "Conversation", icon: MessageSquare },
  { key: "demandes", label: "Demandes", icon: ClipboardList },
  { key: "support", label: "Support", icon: LifeBuoy },
];

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; vue?: string }>;
}) {
  const { id } = await params;
  const { tab: tabParam, vue: vueParam } = await searchParams;
  const user = await getCurrentUser();
  if (!user) return notFound();

  const projects = await getClientProjects();
  const project = (projects as ProjectWithDetails[]).find((item) => item.id.trim() === id.trim());
  if (!project) return notFound();

  if (!project.contractSigned) {
    return (
      <ContractBarrier
        projectName={project.title}
        projectId={project.id}
        clientName={project.client?.name || "Client"}
        budget={project.budget ? formatMoney(project.budget) : undefined}
        description={project.description || undefined}
      />
    );
  }

  const [execution, tickets] = await Promise.all([
    getProjectExecution(project.id).catch(() => null),
    prisma.ticket.findMany({
      where: { projectId: project.id },
      include: { _count: { select: { responses: true } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  // Les anciennes entrées (?tab=demandes / ?tab=messages) pointent vers Échanges.
  const legacyTab = tabParam === "demandes" || tabParam === "messages" ? "echanges" : tabParam;
  const tab: TabKey = TABS.some((item) => item.key === legacyTab) ? (legacyTab as TabKey) : "apercu";
  const vue: VueKey =
    vueParam === "demandes" || vueParam === "support"
      ? vueParam
      : tabParam === "demandes"
        ? "demandes"
        : tabParam === "messages"
          ? "conversation"
          : "conversation";

  const tasks = execution?.tasks ?? [];
  const done = tasks.filter((task) => task.status === "DONE").length;
  const milestones = execution?.milestones ?? [];
  const validated = milestones.filter((milestone) => milestone.status === "VALIDATED").length;
  const deliverables = execution?.deliverables ?? [];
  const waiting = deliverables.filter((item) => item.status === "SUBMITTED").length;
  const openTickets = tickets.filter((ticket) => ticket.status === "OPEN" || ticket.status === "IN_PROGRESS").length;

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-secondary hover:text-foreground"
        >
          <ChevronLeft size={15} aria-hidden="true" /> Mes projets
        </Link>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-[2rem]">{project.title}</h1>
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${toneFor(project.status)}`}>
              {PROJECT_STATUS_LABEL[project.status] ?? project.status}
            </span>
            {waiting > 0 && (
              <span className="rounded-full border border-warn/25 bg-warn/10 px-2.5 py-0.5 text-[11px] font-medium text-warn">
                {waiting} livrable{waiting > 1 ? "s" : ""} à valider
              </span>
            )}
          </div>
          {project.description && (
            <p className="mt-2 max-w-[70ch] text-[14px] leading-relaxed text-secondary">{project.description}</p>
          )}
        </div>

        <dl className="flex flex-wrap gap-x-8 gap-y-2 border-t border-border pt-4 text-[13px]">
          <div className="flex items-center gap-2">
            <Wallet size={15} className="text-muted" aria-hidden="true" />
            <dt className="text-muted">Budget</dt>
            <dd className="font-medium">{project.budget ? formatMoney(project.budget) : "À définir"}</dd>
          </div>
          <div className="flex items-center gap-2">
            <CalendarClock size={15} className="text-muted" aria-hidden="true" />
            <dt className="text-muted">Délai</dt>
            <dd className="font-medium">{project.timeline || "À définir"}</dd>
          </div>
          {project.techStack.length > 0 && (
            <div className="flex items-center gap-2">
              <Layers size={15} className="text-muted" aria-hidden="true" />
              <dt className="text-muted">Technologies</dt>
              <dd className="font-medium">{project.techStack.join(", ")}</dd>
            </div>
          )}
        </dl>
      </header>

      <nav aria-label="Sections du projet" className="flex flex-wrap gap-1.5 border-b border-border pb-3">
        {TABS.map((item) => {
          const active = item.key === tab;
          const badge = item.key === "livrables" ? waiting : item.key === "echanges" ? openTickets : null;

          return (
            <Link
              key={item.key}
              href={`/dashboard/projects/${project.id}?tab=${item.key}`}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors ${
                active ? "bg-primary text-background" : "text-secondary hover:bg-primary/5 hover:text-foreground"
              }`}
            >
              {item.label}
              {badge !== null && badge > 0 && (
                <span
                  className={`rounded-full px-1.5 text-[11px] ${active ? "bg-background/20" : "bg-primary/10 text-primary"}`}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {tab === "apercu" && (
        <section className="space-y-6">
          <div className="surface p-5 md:p-6">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-[12px] text-muted">Avancement du projet</p>
                <p className="numeric mt-1 text-4xl font-semibold leading-none">
                  {project.progress}
                  <span className="ml-1 text-base text-muted">%</span>
                </p>
                <p className="mt-2 text-[12px] text-secondary">
                  {done} tâche{done > 1 ? "s" : ""} terminée{done > 1 ? "s" : ""} sur {tasks.length} ·{" "}
                  {validated} jalon{validated > 1 ? "s" : ""} validé{validated > 1 ? "s" : ""} sur{" "}
                  {milestones.length}
                </p>
              </div>

              {execution && execution.members.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {execution.members.slice(0, 5).map((member) => (
                      <span
                        key={member.id}
                        title={`${member.user.name ?? member.user.email} · ${TEAM_ROLE_LABEL[member.role]}`}
                        className="grid h-9 w-9 place-items-center rounded-full border-2 border-card bg-background text-[9px] font-semibold"
                      >
                        {initialsOf(member.user.name, member.user.email)}
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
                    <Users size={12} aria-hidden="true" /> Équipe
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-primary/[0.07]">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-500"
                style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
                Jalons et étapes
              </h2>
              {milestones.length === 0 ? (
                <p className="surface px-5 py-6 text-[14px] text-secondary">
                  Les jalons seront publiés par l&apos;équipe.
                </p>
              ) : (
                <ul className="surface divide-y divide-border">
                  {milestones.map((milestone) => (
                    <li key={milestone.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium">{milestone.title}</p>
                        <p className="text-[12px] text-muted">Échéance {formatDay(milestone.dueDate)}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                          MILESTONE_STYLE[milestone.status]
                        }`}
                      >
                        {MILESTONE_LABEL[milestone.status]}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
                Contrat et documents
              </h2>
              <ul className="surface divide-y divide-border">
                <li className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <span className="inline-flex items-center gap-2 text-[13px]">
                    <FileText size={14} className="text-muted" aria-hidden="true" /> Contrat de prestation
                  </span>
                  <span className="inline-flex items-center gap-1 text-[12px] text-ok">
                    <CheckCircle2 size={13} aria-hidden="true" /> Signé
                  </span>
                </li>
                {project.contracts[0]?.id && (
                  <li className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <span className="text-[13px] text-secondary">
                      Signature du {formatDate(project.contracts[0].signedAt)}
                    </span>
                    <span className="text-[12px] text-muted">
                      réf. {project.contracts[0].id.slice(-6).toUpperCase()}
                    </span>
                  </li>
                )}
                {project.assets.slice(0, 3).map((asset) => (
                  <li key={asset.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <span className="truncate text-[13px] text-secondary">{asset.name}</span>
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-accent hover:underline"
                    >
                      <Download size={12} aria-hidden="true" /> Ouvrir
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {tab === "echanges" && (
        <section className="space-y-5">
          <nav aria-label="Type d'échange" className="flex flex-wrap gap-1.5">
            {VUES.map((item) => {
              const active = item.key === vue;
              const Icon = item.icon;
              const count =
                item.key === "demandes" ? project.requirements.length : item.key === "support" ? openTickets : 0;

              return (
                <Link
                  key={item.key}
                  href={`/dashboard/projects/${project.id}?tab=echanges&vue=${item.key}`}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-[10px] border px-3 py-2 text-[12px] font-medium transition-colors ${
                    active
                      ? "border-primary/30 bg-primary/[0.06] text-foreground"
                      : "border-border bg-card text-secondary hover:text-foreground"
                  }`}
                >
                  <Icon size={14} aria-hidden="true" />
                  {item.label}
                  {count > 0 && <span className="text-[11px] text-muted">{count}</span>}
                </Link>
              );
            })}
          </nav>

          {vue === "conversation" && (
            <div className="min-h-[420px] overflow-hidden rounded-[18px] border border-border bg-card">
              <ChatSidebar projectId={project.id} />
            </div>
          )}

          {vue === "demandes" && (
            <div className="surface p-4 sm:p-6">
              <RequirementWorkspace
                projectId={project.id}
                initialRequirements={project.requirements || []}
                currentUser={user}
              />
            </div>
          )}

          {vue === "support" && (
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <p className="surface px-5 py-6 text-[14px] text-secondary">
                  Aucune demande de support pour ce projet. Ouvrez-en une si quelque chose bloque.
                </p>
              ) : (
                <ul className="surface divide-y divide-border">
                  {tickets.map((ticket) => (
                    <li key={ticket.id}>
                      <Link
                        href={`/dashboard/tickets/${ticket.id}`}
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-card-hover transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-[13px] font-semibold">{ticket.title}</span>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneFor(ticket.status)}`}
                            >
                              {TICKET_STATUS_LABEL[ticket.status] ?? ticket.status}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[12px] text-muted">
                            Ouvert le {formatDate(ticket.createdAt)} · {ticket._count.responses} réponse
                            {ticket._count.responses > 1 ? "s" : ""}
                          </p>
                        </div>
                        <ChevronRight size={15} className="text-muted" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <NewTicketForm projects={[{ id: project.id, title: project.title }]} />
            </div>
          )}
        </section>
      )}

      {tab === "livrables" && (
        <section className="space-y-6">
          <ProjectDeliverables
            deliverables={deliverables}
            canReview={user.role === "ADMIN" || project.clientId === user.id}
          />

          {project.assets.length > 0 && (
            <div>
              <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
                Fichiers joints au projet
              </h2>
              <ul className="surface divide-y divide-border">
                {project.assets.map((asset) => (
                  <li key={asset.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium">{asset.name}</p>
                      <p className="text-[12px] text-muted">{formatDate(asset.createdAt)}</p>
                    </div>
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-accent hover:underline"
                    >
                      <Download size={12} aria-hidden="true" /> Ouvrir
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

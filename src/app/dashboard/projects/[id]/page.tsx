import { getClientProjects } from "@/lib/actions/projects";
import { getCurrentUser } from "@/lib/actions/users";
import { getProjectExecution } from "@/lib/actions/execution";
import Deliverables from "@/components/dashboard/Deliverables";
import ContractBarrier from "@/components/dashboard/ContractBarrier";
import RequirementWorkspace, { type RequirementWithDetails } from "@/components/dashboard/RequirementWorkspace";
import ClientExecution from "@/components/projects/ClientExecution";
import { ChevronLeft, CalendarClock, Wallet, Layers } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Project, Asset, Contract, Invoice, User } from "@prisma/client";
import { PROJECT_STATUS_LABEL, toneFor } from "@/lib/labels";
import { formatMoney } from "@/lib/format";

type ProjectWithDetails = Project & {
  client: User | null;
  assets: Asset[];
  contracts: Contract[];
  invoices: (Invoice & { project?: { title: string } | null })[];
  requirements: RequirementWithDetails[];
};

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) return notFound();

  const projects = await getClientProjects();
  const project = (projects as ProjectWithDetails[]).find((item) => item.id.trim() === id.trim());

  if (!project) return notFound();

  // Barrière contractuelle : la signature conditionne l'accès au projet.
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

  const execution = await getProjectExecution(project.id).catch(() => null);
  const taskTotal = execution?.tasks.length ?? 0;
  const taskDone = execution?.tasks.filter((task) => task.status === "DONE").length ?? 0;

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-secondary hover:text-foreground"
        >
          <ChevronLeft size={15} aria-hidden="true" /> Mes projets
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl sm:text-[2.2rem]">{project.title}</h1>
              <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${toneFor(project.status)}`}>
                {PROJECT_STATUS_LABEL[project.status] ?? project.status}
              </span>
            </div>
            {project.description && (
              <p className="mt-2 max-w-[70ch] text-[14px] leading-relaxed text-secondary">{project.description}</p>
            )}
          </div>
        </div>

        <dl className="flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-4 text-[13px]">
          <div className="flex items-center gap-2">
            <Wallet size={15} className="text-muted" aria-hidden="true" />
            <dt className="text-muted">Budget</dt>
            <dd className="font-medium text-foreground">
              {project.budget ? `${formatMoney(project.budget)}` : "À définir"}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <CalendarClock size={15} className="text-muted" aria-hidden="true" />
            <dt className="text-muted">Délai</dt>
            <dd className="font-medium text-foreground">{project.timeline || "À définir"}</dd>
          </div>
          {project.techStack.length > 0 && (
            <div className="flex items-center gap-2">
              <Layers size={15} className="text-muted" aria-hidden="true" />
              <dt className="text-muted">Technologies</dt>
              <dd className="font-medium text-foreground">{project.techStack.join(", ")}</dd>
            </div>
          )}
        </dl>
      </header>

      <ClientExecution
        projectId={project.id}
        progress={project.progress ?? 0}
        tasks={{ total: taskTotal, done: taskDone }}
        milestones={execution?.milestones ?? []}
        deliverables={execution?.deliverables ?? []}
        members={execution?.members ?? []}
        canReview={user.role === "ADMIN" || project.clientId === user.id}
      />

      <section aria-labelledby="cdc" className="space-y-3">
        <h2 id="cdc" className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
          Cahier des charges
        </h2>
        <div className="surface p-4 sm:p-6">
          <RequirementWorkspace
            projectId={project.id}
            initialRequirements={project.requirements || []}
            currentUser={user}
          />
        </div>
      </section>

      <section aria-labelledby="documents" className="space-y-3">
        <h2 id="documents" className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">
          Documents et factures
        </h2>
        <Deliverables
          projectId={project.id}
          projectName={project.title}
          projectAssets={project.assets}
          contracts={project.contracts}
          invoices={project.invoices}
          clientName={project.client?.name || "Client"}
          budget={project.budget ? formatMoney(project.budget) : "Non spécifié"}
          description={project.description || undefined}
          techStack={project.techStack}
          timeline={project.timeline || undefined}
        />
      </section>
    </div>
  );
}

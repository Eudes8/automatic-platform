import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FolderOpen, FileSignature } from "lucide-react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/users";
import { PROJECT_STATUS_LABEL, toneFor } from "@/lib/labels";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { clientId: user.id },
    include: {
      tasks: { select: { status: true } },
      milestones: {
        where: { status: { not: "VALIDATED" } },
        orderBy: { dueDate: "asc" },
        take: 1,
        select: { title: true, dueDate: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl sm:text-[2.2rem]">Mes projets</h1>
        <p className="mt-2 text-[15px] text-secondary">
          {projects.length === 0
            ? "Aucun projet pour le moment."
            : `${projects.length} projet${projects.length > 1 ? "s" : ""} suivi${projects.length > 1 ? "s" : ""} dans votre espace.`}
        </p>
      </header>

      {projects.length === 0 ? (
        <div className="surface flex flex-col items-start gap-4 px-6 py-10">
          <span className="grid h-11 w-11 place-items-center rounded-[12px] border border-border bg-background">
            <FolderOpen size={20} className="text-accent" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl">Démarrons votre premier projet</h2>
            <p className="mt-1 max-w-[52ch] text-[14px] text-secondary">
              Décrivez votre besoin en quelques minutes. Nous revenons avec un périmètre, un budget et un
              calendrier.
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
            const milestone = project.milestones[0];

            return (
              <li key={project.id}>
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="grid gap-4 px-4 py-5 transition-colors hover:bg-card-hover md:grid-cols-12 md:items-center md:px-5"
                >
                  <div className="md:col-span-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-semibold text-foreground">{project.title}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneFor(project.status)}`}>
                        {PROJECT_STATUS_LABEL[project.status] ?? project.status}
                      </span>
                      {!project.contractSigned && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-warn/25 bg-warn/10 px-2 py-0.5 text-[11px] font-medium text-warn">
                          <FileSignature size={11} aria-hidden="true" /> Signature requise
                        </span>
                      )}
                    </div>
                    {project.description && (
                      <p className="mt-1 line-clamp-1 text-[13px] text-secondary">{project.description}</p>
                    )}
                  </div>

                  <div className="md:col-span-5">
                    <div className="flex items-center justify-between text-[12px] text-secondary">
                      <span>Avancement</span>
                      <span className="numeric">{project.progress}%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-primary/[0.07]">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted">
                      {total > 0
                        ? `${done} tâche${done > 1 ? "s" : ""} terminée${done > 1 ? "s" : ""} sur ${total}`
                        : "Planning en préparation"}
                      {milestone ? ` · ${milestone.title} le ${formatDate(milestone.dueDate)}` : ""}
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
    </div>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, GripVertical, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { Project, User, ProjectStatus } from "@prisma/client";
import { updateProjectStatus } from "@/lib/actions/kanban";
import { PROJECT_STATUS_LABEL } from "@/lib/labels";
import { formatMoney } from "@/lib/format";

export type ProjectWithClient = Project & {
  client: User | null;
  assets: { id: string }[];
  messages: { id: string }[];
};

const COLUMNS: { status: ProjectStatus; label: string }[] = [
  { status: "ONBOARDING", label: "Cadrage" },
  { status: "ANALYSIS", label: "Analyse" },
  { status: "DESIGN", label: "Design" },
  { status: "DEV", label: "Développement" },
  { status: "QA", label: "Recette" },
  { status: "DEPLOYMENT", label: "Mise en ligne" },
  { status: "DONE", label: "Livré" },
];

/**
 * Tableau des projets par étape. Le glisser-déposer change le statut ;
 * un clic ouvre l'espace d'exécution du projet.
 */
export default function Kanban({ initialProjects }: { initialProjects: ProjectWithClient[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter((project) =>
      [project.title, project.id, project.client?.name, project.client?.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [projects, search]);

  function move(projectId: string, status: ProjectStatus) {
    const current = projects.find((project) => project.id === projectId);
    if (!current || current.status === status) return;

    const previous = projects;
    setProjects((list) => list.map((project) => (project.id === projectId ? { ...project, status } : project)));

    startTransition(async () => {
      const result = await updateProjectStatus(projectId, status);
      if (!result.success) {
        setProjects(previous);
        toast.error("Changement de statut impossible");
        return;
      }
      toast.success(`Projet déplacé vers « ${PROJECT_STATUS_LABEL[status] ?? status} »`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un projet ou un client…"
            className="field h-10 pl-9 text-[13px]"
          />
        </div>
        <p className="text-[12px] text-muted">
          {filtered.length} projet{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
        {COLUMNS.map((column) => {
          const items = filtered.filter((project) => project.status === column.status);

          return (
            <section
              key={column.status}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const id = event.dataTransfer.getData("projectId") || dragging;
                if (id) move(id, column.status);
                setDragging(null);
              }}
              className={`w-[260px] shrink-0 rounded-[14px] border bg-card/60 p-3 transition-colors ${
                dragging ? "border-primary/30" : "border-border"
              }`}
            >
              <header className="flex items-center justify-between px-1 pb-2">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">
                  {column.label}
                </h2>
                <span className="numeric text-[11px] text-muted">{items.length}</span>
              </header>

              <div className="space-y-2">
                {items.map((project) => (
                  <article
                    key={project.id}
                    draggable
                    onDragStart={(event) => {
                      setDragging(project.id);
                      event.dataTransfer.setData("projectId", project.id);
                    }}
                    onDragEnd={() => setDragging(null)}
                    className="group rounded-[12px] border border-border bg-background p-3 transition-colors hover:border-primary/30"
                  >
                    <div className="flex items-start gap-1.5">
                      <GripVertical
                        size={13}
                        className="mt-0.5 shrink-0 cursor-grab text-muted/60 group-hover:text-muted"
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/admin/projects/${project.id}/execution`}
                          className="block truncate text-[13px] font-semibold hover:underline"
                        >
                          {project.title}
                        </Link>
                        <p className="truncate text-[11px] text-muted">
                          {project.client?.name ?? project.client?.email ?? "Client"}
                        </p>
                      </div>
                      <ArrowUpRight size={13} className="shrink-0 text-muted/50" aria-hidden="true" />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-secondary">
                      <span>{project.budget ? formatMoney(project.budget) : "Budget à définir"}</span>
                      <span className="numeric">{project.progress}%</span>
                    </div>

                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-primary/[0.07]">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                      />
                    </div>
                  </article>
                ))}

                {items.length === 0 && (
                  <p className="rounded-[10px] border border-dashed border-border px-3 py-6 text-center text-[11px] text-muted">
                    Aucun projet
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

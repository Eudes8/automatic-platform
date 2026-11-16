import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";
import { getPortfolioItemsAdmin } from "@/lib/actions/adminPortfolio";
import PortfolioCRUDModal from "@/components/admin/portfolio/PortfolioCRUDModal";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  const projects = await getPortfolioItemsAdmin();
  const featured = projects.filter((project) => project.featured).length;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-[2.2rem]">Vitrine</h1>
          <p className="mt-2 text-[15px] text-secondary">
            {projects.length} réalisation{projects.length > 1 ? "s" : ""} publiée{projects.length > 1 ? "s" : ""}
            {featured > 0 ? `, dont ${featured} mise${featured > 1 ? "s" : ""} en avant` : ""}. Ces fiches
            apparaissent sur la page d&apos;accueil.
          </p>
        </div>
        <PortfolioCRUDModal mode="CREATE" />
      </header>

      {projects.length === 0 ? (
        <p className="surface px-5 py-10 text-center text-[14px] text-secondary">
          Aucune réalisation publiée. Ajoutez un projet pour alimenter la vitrine.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id} className="surface flex flex-col overflow-hidden">
              <div className="relative aspect-[16/10] w-full bg-primary/[0.04]">
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-[12px] text-muted">Sans visuel</div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[14px] font-semibold">{project.title}</h2>
                  {project.featured && (
                    <span className="rounded-full border border-accent/30 bg-accent/[0.08] px-2 py-0.5 text-[11px] font-medium text-accent">
                      En avant
                    </span>
                  )}
                </div>

                <p className="text-[12px] text-muted">
                  {project.category} · ajouté le {formatDate(project.createdAt)}
                </p>

                <p className="line-clamp-2 text-[13px] text-secondary">{project.description}</p>

                {project.tech.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5">
                    {project.tech.slice(0, 5).map((tech) => (
                      <li
                        key={tech}
                        className="rounded-[6px] border border-border px-1.5 py-0.5 text-[11px] text-secondary"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto flex items-center gap-3 pt-2">
                  {project.url && (
                    <Link
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[12px] font-medium text-accent hover:underline"
                    >
                      <ExternalLink size={13} aria-hidden="true" /> Voir le site
                    </Link>
                  )}
                  {project.github && (
                    <Link
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[12px] text-secondary hover:underline"
                    >
                      <Github size={13} aria-hidden="true" /> Dépôt
                    </Link>
                  )}
                  <span className="ml-auto">
                    <PortfolioCRUDModal mode="EDIT" project={project} />
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

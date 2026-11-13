import Kanban from "@/components/admin/Kanban";
import { getProjectsByStatus } from "@/lib/actions/admin";
import ProjectCRUDModal from "@/components/admin/projects/ProjectCRUDModal";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await getProjectsByStatus();
  const active = projects.filter((project) => project.status !== "DONE").length;
  const done = projects.filter((project) => project.status === "DONE").length;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-[2.2rem]">Projets</h1>
          <p className="mt-2 text-[15px] text-secondary">
            {active} en cours, {done} livré{done > 1 ? "s" : ""}. Glissez une carte pour changer d&apos;étape.
          </p>
        </div>
        <ProjectCRUDModal />
      </header>

      <Kanban initialProjects={projects} />
    </div>
  );
}

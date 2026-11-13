import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/users";
import ContractBarrier from "@/components/dashboard/ContractBarrier";
import Chat from "@/components/dashboard/ChatSidebar";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { project: projectParam } = await searchParams;

  const projects = await prisma.project.findMany({
    where: { clientId: user.id },
    select: {
      id: true,
      title: true,
      contractSigned: true,
      budget: true,
      client: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  if (projects.length === 0) {
    return (
      <div className="surface flex flex-col items-start gap-3 px-6 py-10">
        <span className="grid h-11 w-11 place-items-center rounded-[12px] border border-border bg-background">
          <MessageSquare size={20} className="text-accent" aria-hidden="true" />
        </span>
        <h1 className="text-xl">Aucune discussion</h1>
        <p className="max-w-[52ch] text-[14px] text-secondary">
          La messagerie s&apos;ouvre automatiquement dès qu&apos;un projet est créé. Décrivez votre besoin pour
          démarrer.
        </p>
        <Link href="/onboarding" className="btn btn-primary h-11 px-5">
          Démarrer un projet
        </Link>
      </div>
    );
  }

  const selected = projects.find((item) => item.id === projectParam) ?? projects[0];

  if (!selected.contractSigned) {
    return (
      <ContractBarrier
        projectName={selected.title}
        projectId={selected.id}
        clientName={selected.client?.name || "Client"}
        budget={selected.budget ? formatMoney(selected.budget) : undefined}
      />
    );
  }

  return (
    <div className="flex h-[calc(100dvh-12rem)] flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl">Messagerie</h1>
          <p className="mt-1 text-[14px] text-secondary">
            Échangez avec l&apos;équipe en charge de {selected.title}.
          </p>
        </div>

        {projects.length > 1 && (
          <nav aria-label="Choisir un projet" className="flex flex-wrap gap-1.5">
            {projects.map((project) => {
              const active = project.id === selected.id;
              return (
                <Link
                  key={project.id}
                  href={`/dashboard/chat?project=${project.id}`}
                  className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary text-background"
                      : "border-border bg-card text-secondary hover:text-foreground"
                  }`}
                >
                  {project.title}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-hidden rounded-[18px] border border-border bg-card">
        <Chat projectId={selected.id} />
      </div>
    </div>
  );
}

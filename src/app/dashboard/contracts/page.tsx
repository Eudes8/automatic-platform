import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Receipt, Package, Download, ShieldCheck } from "lucide-react";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/users";
import { formatDate, formatMoney } from "@/lib/format";
import { PROJECT_STATUS_LABEL, toneFor } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [projects, invoices] = await Promise.all([
    prisma.project.findMany({
      where: { clientId: user.id },
      include: {
        contracts: { orderBy: { createdAt: "desc" } },
        assets: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.invoice.findMany({
      where: { clientId: user.id, receiptUrl: { not: null } },
      include: { project: { select: { title: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const contracts = projects.flatMap((project) =>
    project.contracts
      .filter((contract) => contract.status === "SIGNED")
      .map((contract) => ({ ...contract, projectTitle: project.title, projectId: project.id }))
  );

  const assets = projects.flatMap((project) =>
    project.assets.map((asset) => ({ ...asset, projectTitle: project.title }))
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl sm:text-[2.2rem]">Documents</h1>
        <p className="mt-2 text-[15px] text-secondary">
          Contrats signés, reçus de paiement et livrables de vos projets.
        </p>
      </header>

      {/* Contrats */}
      <section className="space-y-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">Contrats</h2>

        {contracts.length === 0 ? (
          <p className="surface px-5 py-6 text-[14px] text-secondary">
            Aucun contrat signé pour le moment. Il apparaîtra ici dès que vous aurez signé le contrat d&apos;un projet.
          </p>
        ) : (
          <ul className="surface divide-y divide-border">
            {contracts.map((contract) => (
              <li key={contract.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-[10px] border border-border bg-background">
                    <FileText size={16} className="text-accent" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold">{contract.projectTitle}</p>
                    <p className="text-[12px] text-muted">
                      Signé le {formatDate(contract.signedAt)} · réf. {contract.id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/dashboard/projects/${contract.projectId}`}
                  className="text-[12px] font-medium text-accent hover:underline"
                >
                  Voir le projet
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Reçus */}
      <section className="space-y-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">Reçus de paiement</h2>

        {invoices.length === 0 ? (
          <p className="surface px-5 py-6 text-[14px] text-secondary">
            Aucun reçu pour l&apos;instant. Un reçu est généré automatiquement à chaque paiement confirmé.
          </p>
        ) : (
          <ul className="surface divide-y divide-border">
            {invoices.map((invoice) => (
              <li key={invoice.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-[10px] border border-border bg-background">
                    <Receipt size={16} className="text-ok" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold">
                      Facture #{invoice.id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-[12px] text-muted">
                      {invoice.project?.title ?? "Sans projet"} · {formatMoney(invoice.amountPaid)}
                    </p>
                  </div>
                </div>
                <a
                  href={invoice.receiptUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-accent hover:underline"
                >
                  <Download size={13} aria-hidden="true" /> Télécharger
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Livrables */}
      <section className="space-y-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">Livrables et fichiers</h2>

        {assets.length === 0 ? (
          <p className="surface px-5 py-6 text-[14px] text-secondary">
            Aucun fichier publié. Vos livrables apparaîtront ici au fil du projet.
          </p>
        ) : (
          <ul className="surface divide-y divide-border">
            {assets.map((asset) => (
              <li key={asset.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-[10px] border border-border bg-background">
                    <Package size={16} className="text-accent" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold">{asset.name}</p>
                    <p className="text-[12px] text-muted">
                      {asset.projectTitle} · {formatDate(asset.createdAt)}
                    </p>
                  </div>
                </div>
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-accent hover:underline"
                >
                  <Download size={13} aria-hidden="true" /> Ouvrir
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Projets */}
      <section className="space-y-3">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">Projets</h2>
        <ul className="surface divide-y divide-border">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 hover:bg-card-hover transition-colors md:px-5"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-muted" aria-hidden="true" />
                  <span className="text-[14px] font-medium">{project.title}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneFor(project.status)}`}>
                    {PROJECT_STATUS_LABEL[project.status] ?? project.status}
                  </span>
                </div>
                <span className="text-[12px] text-muted">
                  {project.contractSigned ? "Contrat signé" : "Contrat en attente"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

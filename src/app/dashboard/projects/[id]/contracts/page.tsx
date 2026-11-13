import { redirect } from "next/navigation";

/** Ancienne page documents d'un projet : renvoie vers l'onglet Aperçu. */
export default async function ProjectContractsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/dashboard/projects/${id}?tab=apercu`);
}

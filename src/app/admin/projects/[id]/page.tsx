import { redirect } from "next/navigation";

/**
 * La fiche projet admin n'a plus de page propre : l'espace d'exécution
 * regroupe le suivi, l'équipe, les jalons et les livrables.
 */
export default async function AdminProjectRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/projects/${id}/execution`);
}

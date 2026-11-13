import { redirect } from "next/navigation";

/** Ancienne page de chat d'un projet : renvoie vers l'onglet Échanges. */
export default async function ProjectChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/dashboard/projects/${id}?tab=echanges`);
}

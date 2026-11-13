import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/users";

/**
 * Ancienne messagerie globale. La conversation vit désormais dans l'onglet
 * « Échanges » du projet : on redirige vers le projet concerné plutôt que
 * d'afficher une page vide.
 */
export default async function ChatRedirect() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await prisma.project.findFirst({
    where: { clientId: user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  redirect(project ? `/dashboard/projects/${project.id}?tab=echanges` : "/dashboard");
}

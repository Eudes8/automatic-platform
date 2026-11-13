import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/actions/users";

/**
 * Ancienne page « Documents ». Contrats, reçus et livrables sont désormais
 * dans le projet et dans Paiements : on renvoie vers le projet concerné.
 */
export default async function DocumentsRedirect() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const project = await prisma.project.findFirst({
    where: { clientId: user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  redirect(project ? `/dashboard/projects/${project.id}?tab=apercu` : "/dashboard");
}

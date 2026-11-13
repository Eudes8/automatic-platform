/**
 * GET /api/files/[id]
 *
 * Sert un fichier stocké en base (moteur de stockage interne).
 * Contrôle d'accès serveur :
 *  - session obligatoire ;
 *  - fichier rattaché à un projet → ADMIN, client du projet ou membre de l'équipe ;
 *  - fichier non rattaché → ADMIN uniquement.
 */

import prisma from "@/lib/prisma";
import { getAuthenticatedUser, jsonResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonResponse({ error: "Authentification requise." }, 401);
  }

  const file = await prisma.storedFile.findUnique({ where: { id } });
  if (!file) {
    return jsonResponse({ error: "Fichier introuvable." }, 404);
  }

  if (file.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: file.projectId },
      select: { clientId: true, members: { select: { userId: true } } },
    });
    const isStakeholder =
      user.role === "ADMIN" ||
      project?.clientId === user.id ||
      project?.members.some((member) => member.userId === user.id);
    if (!isStakeholder) {
      return jsonResponse({ error: "Accès refusé." }, 403);
    }
  } else if (user.role !== "ADMIN") {
    // Reçus : accessibles au client propriétaire de la facture.
    const receiptMatch = file.name.match(/^receipts\/([^/]+)\//);
    if (receiptMatch) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: receiptMatch[1] },
        select: { clientId: true },
      });
      if (invoice?.clientId !== user.id) {
        return jsonResponse({ error: "Accès refusé." }, 403);
      }
    } else {
      return jsonResponse({ error: "Accès refusé." }, 403);
    }
  }

  // Nom de fichier : celui demandé en query string, sinon le chemin stocké.
  const requestedName = new URL(request.url).searchParams.get("name");
  const filename = requestedName || file.name.split("/").pop() || file.name;

  const body = new Uint8Array(file.data);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(file.size),
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "private, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

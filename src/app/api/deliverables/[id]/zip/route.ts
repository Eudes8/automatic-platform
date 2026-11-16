/**
 * GET /api/deliverables/[id]/zip
 *
 * Archive ZIP d'un livrable complet : toutes ses pièces en un seul
 * téléchargement, nommées comme à l'origine.
 *
 * Contrôle d'accès serveur (identique aux fichiers du projet) :
 *  - session obligatoire ;
 *  - ADMIN, client du projet ou membre de l'équipe projet.
 *
 * Les pièces stockées en base (moteur interne) sont lues directement ;
 * les URL externes (Supabase) sont récupérées à la volée.
 */

import prisma from "@/lib/prisma";
import { getAuthenticatedUser, jsonResponse } from "@/lib/api-helpers";
import JSZip from "jszip";

export const dynamic = "force-dynamic";

function sanitize(value: string): string {
  return value.replace(/[^\w.\- ]+/g, "_").trim() || "livrable";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonResponse({ error: "Authentification requise." }, 401);
  }

  const deliverable = await prisma.deliverable.findUnique({
    where: { id },
    include: {
      files: { orderBy: { createdAt: "asc" } },
      project: { select: { id: true, clientId: true, members: { select: { userId: true } } } },
    },
  });

  if (!deliverable) {
    return jsonResponse({ error: "Livrable introuvable." }, 404);
  }

  const project = deliverable.project;
  const isStakeholder =
    user.role === "ADMIN" ||
    project?.clientId === user.id ||
    project?.members.some((member) => member.userId === user.id);

  if (!isStakeholder) {
    return jsonResponse({ error: "Accès refusé." }, 403);
  }

  if (deliverable.files.length === 0) {
    return jsonResponse({ error: "Ce livrable n'a aucune pièce à archiver." }, 404);
  }

  const zip = new JSZip();
  const usedNames = new Set<string>();
  const missing: string[] = [];

  for (const file of deliverable.files) {
    let bytes: Buffer | null = null;

    const internalMatch = file.url.match(/^\/api\/files\/([A-Za-z0-9]+)$/);
    if (internalMatch) {
      const stored = await prisma.storedFile.findUnique({
        where: { id: internalMatch[1] },
        select: { data: true },
      });
      if (stored) bytes = Buffer.from(stored.data);
    } else if (/^https?:\/\//i.test(file.url)) {
      try {
        const response = await fetch(file.url);
        if (response.ok) bytes = Buffer.from(await response.arrayBuffer());
      } catch {
        bytes = null;
      }
    }

    if (!bytes) {
      missing.push(file.name);
      continue;
    }

    // Deux pièces ne doivent jamais s'écraser : on suffixe si besoin.
    let name = file.name || `piece-${usedNames.size + 1}`;
    if (usedNames.has(name)) {
      const dot = name.lastIndexOf(".");
      const base = dot > 0 ? name.slice(0, dot) : name;
      const ext = dot > 0 ? name.slice(dot) : "";
      let index = 2;
      while (usedNames.has(`${base}-${index}${ext}`)) index += 1;
      name = `${base}-${index}${ext}`;
    }
    usedNames.add(name);
    zip.file(name, bytes);
  }

  if (missing.length > 0) {
    // Les pièces indisponibles sont signalées dans l'archive plutôt que
    // de bloquer le téléchargement des autres.
    zip.file(
      "PIECES-INDISPONIBLES.txt",
      "Ces pièces n'ont pas pu être ajoutées à l'archive :\n" + missing.map((name) => "- " + name).join("\n"),
    );
  }

  if (usedNames.size === 0) {
    return jsonResponse({ error: "Les fichiers de ce livrable sont indisponibles." }, 502);
  }

  const archive = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const filename = `${sanitize(deliverable.name)}-${sanitize(deliverable.version)}.zip`;

  return new Response(new Uint8Array(archive), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Length": String(archive.length),
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/users";
import { uploadFileToStorage } from "@/lib/storage";
import prisma from "@/lib/prisma";

/**
 * POST /api/files/upload
 *
 * Upload d'un fichier rattaché à un projet (livrable, pièce jointe, contrat).
 * Champs multipart : `file`, `projectId`, `folder` (optionnel).
 *
 * Contrôle d'accès : ADMIN, client propriétaire du projet, ou membre de
 * l'équipe projet. Aucune autre session ne peut écrire dans un projet.
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const projectId = formData.get("projectId") as string | null;
        const folder = ((formData.get("folder") as string | null) || "assets").replace(/[^a-z0-9_-]/gi, "");

        if (!file || !projectId) {
            return NextResponse.json({ error: "Missing file or projectId" }, { status: 400 });
        }

        // Accès au projet : admin, client propriétaire ou membre de l'équipe.
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                ...(user.role === "ADMIN"
                    ? {}
                    : {
                          OR: [{ clientId: user.id }, { members: { some: { userId: user.id } } }],
                      }),
            },
            select: { id: true },
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
        }

        const safeName = file.name.replace(/[^\w.\-]+/g, "_");
        const fileName = `${Date.now()}-${safeName}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        // Le chemin suit la convention `<dossier>/<projectId>/<fichier>` :
        // le stockage en déduit le projet pour appliquer le contrôle d'accès.
        const publicUrl = await uploadFileToStorage(
            "project-assets",
            `${folder}/${projectId}/${fileName}`,
            buffer,
            file.type || "application/octet-stream"
        );

        const asset = await prisma.asset.create({
            data: {
                projectId,
                name: file.name,
                url: publicUrl,
                type: file.type || "application/octet-stream",
            },
        });

        return NextResponse.json({ success: true, asset, url: publicUrl });
    } catch (error) {
        console.error("File upload error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * Contrôle d'accès aux projets — source unique de vérité côté serveur.
 *
 * Rôles applicatifs (table `User.role`) :
 *  - ADMIN  : accès complet à tous les projets ;
 *  - CLIENT : accès en lecture à ses projets + validation des livrables ;
 *  - membre d'équipe (`ProjectMember`) : accès en lecture/écriture à l'exécution.
 *
 * Toute action serveur touchant un projet doit passer par ces helpers :
 * un identifiant de projet reçu du client n'est jamais une preuve d'accès.
 */

import prisma from "@/lib/prisma";

export interface ProjectAccess {
    isAdmin: boolean;
    isClientOwner: boolean;
    isMember: boolean;
    canRead: boolean;
    canWrite: boolean;
}

export async function getProjectAccess(
    projectId: string,
    user: { id: string; role: string }
): Promise<ProjectAccess | null> {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
            clientId: true,
            members: { where: { userId: user.id }, select: { id: true } },
        },
    });

    if (!project) return null;

    const isAdmin = user.role === "ADMIN";
    const isClientOwner = project.clientId === user.id;
    const isMember = project.members.length > 0;

    return {
        isAdmin,
        isClientOwner,
        isMember,
        canRead: isAdmin || isClientOwner || isMember,
        canWrite: isAdmin || isMember,
    };
}

/** Lève une erreur si l'utilisateur ne peut pas lire le projet. */
export async function requireProjectRead(
    projectId: string,
    user: { id: string; role: string } | null
): Promise<ProjectAccess> {
    if (!user) throw new Error("Non autorisé : session requise.");
    const access = await getProjectAccess(projectId, user);
    if (!access) throw new Error("Projet introuvable.");
    if (!access.canRead) throw new Error("Accès refusé à ce projet.");
    return access;
}

/** Lève une erreur si l'utilisateur ne peut pas modifier l'exécution du projet. */
export async function requireProjectWrite(
    projectId: string,
    user: { id: string; role: string } | null
): Promise<ProjectAccess> {
    const access = await requireProjectRead(projectId, user);
    if (!access.canWrite) {
        throw new Error("Accès refusé : seul l'équipe projet peut modifier cet élément.");
    }
    return access;
}

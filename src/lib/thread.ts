import prisma from "@/lib/prisma";
import { getProjectMessages } from "@/lib/actions/messages";
import type {
  ThreadMessage,
  ThreadRequirement,
  ThreadTicket,
} from "@/components/projects/ProjectThread";

/**
 * Assemble le fil d'échanges d'un projet : messages, demandes et problèmes
 * dans une seule chronologie, avec l'auteur résolu et le nom des pièces
 * jointes. Utilisé par l'espace client et la console d'exécution admin.
 */
export async function getProjectThreadData(
  projectId: string,
  viewerId: string
): Promise<{
  messages: ThreadMessage[];
  requirements: ThreadRequirement[];
  tickets: ThreadTicket[];
}> {
  const [rawMessages, requirements, tickets] = await Promise.all([
    getProjectMessages(projectId),
    prisma.requirement.findMany({
      where: { projectId },
      include: { comments: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.ticket.findMany({
      where: { projectId },
      include: { _count: { select: { responses: true } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  const authorIds = new Set<string>();
  for (const requirement of requirements) {
    authorIds.add(requirement.createdBy);
    for (const comment of requirement.comments) authorIds.add(comment.authorId);
  }
  for (const ticket of tickets) authorIds.add(ticket.clientId);
  for (const message of rawMessages as Array<{ senderId: string }>) authorIds.add(message.senderId);

  const authors = await prisma.user.findMany({
    where: { id: { in: Array.from(authorIds) } },
    select: { id: true, name: true, email: true, role: true },
  });
  const authorOf = (id: string) => {
    const found = authors.find((candidate) => candidate.id === id);
    return {
      name: found?.name?.trim() || found?.email || "Compte supprimé",
      role: found?.role ?? "CLIENT",
    };
  };

  // Le nom affiché d'une pièce jointe vient de la fiche Asset créée à
  // l'upload ; l'URL seule ne serait pas lisible pour un client.
  const attachmentUrls = new Set<string>();
  for (const message of rawMessages as Array<{ attachment?: string | null }>) {
    if (message.attachment) attachmentUrls.add(message.attachment);
  }
  for (const requirement of requirements) {
    if (requirement.attachment) attachmentUrls.add(requirement.attachment);
  }
  for (const ticket of tickets) {
    if (ticket.attachment) attachmentUrls.add(ticket.attachment);
  }
  const assets = attachmentUrls.size
    ? await prisma.asset.findMany({
        where: { url: { in: Array.from(attachmentUrls) } },
        select: { url: true, name: true },
      })
    : [];
  const nameOf = (url?: string | null) =>
    url ? assets.find((asset) => asset.url === url)?.name ?? null : null;

  const messages: ThreadMessage[] = (rawMessages as Array<{
    id: string;
    text: string;
    createdAt: Date;
    senderId: string;
    attachment: string | null;
  }>).map((message) => {
    const author = authorOf(message.senderId);
    return {
      id: message.id,
      text: message.text,
      createdAt: new Date(message.createdAt).toISOString(),
      mine: message.senderId === viewerId,
      authorName: author.name,
      authorRole: author.role,
      attachment: message.attachment,
      attachmentName: nameOf(message.attachment),
    };
  });

  const threadRequirements: ThreadRequirement[] = requirements.map((requirement) => {
    const author = authorOf(requirement.createdBy);
    return {
      id: requirement.id,
      title: requirement.title,
      description: requirement.description,
      status: requirement.status as string,
      createdAt: new Date(requirement.createdAt).toISOString(),
      authorName: author.name,
      authorRole: author.role,
      mine: requirement.createdBy === viewerId,
      attachment: requirement.attachment,
      attachmentName: nameOf(requirement.attachment),
      comments: requirement.comments.map((comment) => {
        const commentAuthor = authorOf(comment.authorId);
        return {
          id: comment.id,
          text: comment.text,
          createdAt: new Date(comment.createdAt).toISOString(),
          authorName: commentAuthor.name,
          authorRole: commentAuthor.role,
        };
      }),
    };
  });

  const threadTickets: ThreadTicket[] = tickets.map((ticket) => {
    const author = authorOf(ticket.clientId);
    return {
      id: ticket.id,
      title: ticket.title,
      status: ticket.status as string,
      createdAt: new Date(ticket.createdAt).toISOString(),
      authorName: author.name,
      mine: ticket.clientId === viewerId,
      responses: ticket._count.responses,
      attachment: ticket.attachment,
      attachmentName: nameOf(ticket.attachment),
    };
  });

  return { messages, requirements: threadRequirements, tickets: threadTickets };
}

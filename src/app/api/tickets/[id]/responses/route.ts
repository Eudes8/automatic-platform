import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser, notify } from "@/lib/auth"
import { handleError } from "@/lib/api"

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser()
    const { id } = await params
    const ticket = await db.ticket.findUnique({ where: { id }, include: { client: true } })
    if (!ticket) return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 })
    if (user.role !== "ADMIN" && ticket.clientId !== user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await req.json()
    const message = String(body?.message ?? "").trim()
    if (!message) return NextResponse.json({ error: "Message vide" }, { status: 400 })
    const isInternal = Boolean(body?.isInternal) && user.role === "ADMIN"

    const created = await db.ticketResponse.create({
      data: { ticketId: id, authorId: user.id, message: message.slice(0, 4000), isInternal },
      include: { author: { select: { id: true, name: true, role: true } } },
    })

    // Première réponse admin → passe le ticket "En cours"
    if (user.role === "ADMIN" && ticket.status === "OPEN") {
      await db.ticket.update({ where: { id }, data: { status: "IN_PROGRESS", assignedToId: user.id } })
    }

    if (!isInternal) {
      if (user.role === "ADMIN") {
        await notify(ticket.clientId, "Réponse au ticket", `Votre ticket ${ticket.reference} a reçu une réponse de l'équipe.`, "TICKET")
      } else {
        const admins = await db.user.findMany({ where: { role: "ADMIN" } })
        await Promise.all(
          admins.map((a) => notify(a.id, "Nouvelle réponse client", `${user.name} a répondu au ticket ${ticket.reference}.`, "TICKET"))
        )
      }
    }

    return NextResponse.json({ response: created })
  } catch (e) {
    return handleError(e)
  }
}

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser, notify } from "@/lib/auth"
import { handleError } from "@/lib/api"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser()
    const { id } = await params
    const ticket = await db.ticket.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } },
        responses: {
          where: user.role === "ADMIN" ? {} : { isInternal: false },
          include: { author: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    })
    if (!ticket) return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 })
    if (user.role !== "ADMIN" && ticket.clientId !== user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    return NextResponse.json({ ticket })
  } catch (e) {
    return handleError(e)
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser()
    const { id } = await params
    const ticket = await db.ticket.findUnique({ where: { id } })
    if (!ticket) return NextResponse.json({ error: "Ticket introuvable" }, { status: 404 })
    if (user.role !== "ADMIN" && ticket.clientId !== user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await req.json()
    const data: Record<string, unknown> = {}
    if (user.role === "ADMIN") {
      if (body.status) data.status = body.status
      if (body.priority) data.priority = body.priority
      if (body.assignedToId !== undefined) data.assignedToId = body.assignedToId || null
    } else {
      // Un client peut clôturer son ticket s'il est résolu
      if (body.status && body.status === "CLOSED" && ticket.status === "RESOLVED") {
        data.status = "CLOSED"
      }
    }

    const updated = await db.ticket.update({ where: { id }, data })

    if (data.status && data.status !== ticket.status) {
      await notify(
        ticket.clientId,
        "Ticket mis à jour",
        `Votre ticket ${updated.reference} est maintenant : ${String(data.status).replace("_", " ").toLowerCase()}.`,
        "TICKET"
      )
    }
    return NextResponse.json({ ticket: updated })
  } catch (e) {
    return handleError(e)
  }
}

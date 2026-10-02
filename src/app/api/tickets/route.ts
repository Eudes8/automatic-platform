import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { makeReference, requireUser, notify } from "@/lib/auth"
import { handleError } from "@/lib/api"

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser()
    const status = req.nextUrl.searchParams.get("status")
    const where = {
      ...(user.role === "ADMIN" ? {} : { clientId: user.id }),
      ...(status ? { status } : {}),
    }
    const tickets = await db.ticket.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
        _count: { select: { responses: true } },
      },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    })
    return NextResponse.json({ tickets })
  } catch (e) {
    return handleError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    const body = await req.json()
    const { title, description, priority, projectId } = body ?? {}
    if (!title || !description) {
      return NextResponse.json({ error: "Titre et description requis" }, { status: 400 })
    }
    if (projectId) {
      const project = await db.project.findUnique({ where: { id: projectId } })
      if (!project || (user.role !== "ADMIN" && project.clientId !== user.id)) {
        return NextResponse.json({ error: "Projet invalide" }, { status: 400 })
      }
    }

    const count = await db.ticket.count()
    const ticket = await db.ticket.create({
      data: {
        reference: makeReference("TCK", count),
        title: String(title).trim().slice(0, 150),
        description: String(description).trim().slice(0, 4000),
        priority: ["LOW", "MEDIUM", "HIGH", "URGENT"].includes(body.priority) ? body.priority : "MEDIUM",
        projectId: projectId || null,
        clientId: user.id,
      },
      include: { project: { select: { id: true, title: true } } },
    })

    if (user.role === "CLIENT") {
      const admins = await db.user.findMany({ where: { role: "ADMIN" } })
      await Promise.all(
        admins.map((a) =>
          notify(a.id, "Nouveau ticket", `${user.name} a ouvert le ticket ${ticket.reference} : « ${ticket.title} »`, "TICKET", `/tickets`)
        )
      )
    }

    return NextResponse.json({ ticket })
  } catch (e) {
    return handleError(e)
  }
}

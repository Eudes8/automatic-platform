import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser, audit, notify } from "@/lib/auth"
import { handleError } from "@/lib/api"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser()
    const { id } = await params
    const project = await db.project.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, email: true, companyName: true, phone: true } },
        requirements: { orderBy: { createdAt: "desc" } },
        invoices: { orderBy: { createdAt: "desc" } },
        tickets: { orderBy: { updatedAt: "desc" } },
        assets: { orderBy: { createdAt: "desc" } },
        contracts: { orderBy: { createdAt: "desc" } },
      },
    })
    if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 })
    if (user.role !== "ADMIN" && project.clientId !== user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    return NextResponse.json({ project })
  } catch (e) {
    return handleError(e)
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser()
    const { id } = await params
    const project = await db.project.findUnique({ where: { id } })
    if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 })

    const body = await req.json()
    const data: Record<string, unknown> = {}

    if (user.role === "ADMIN") {
      // Champs réservés à l'admin
      if (body.status !== undefined) data.status = String(body.status)
      if (body.progress !== undefined) {
        const p = Math.max(0, Math.min(100, Number(body.progress) || 0))
        data.progress = p
        if (p === 100 && project.status !== "DONE") data.status = "DONE"
      }
      if (body.budget !== undefined) data.budget = Number(body.budget) || 0
      if (body.title !== undefined) data.title = String(body.title)
      if (body.description !== undefined) data.description = String(body.description)
      if (body.deadline !== undefined) data.deadline = body.deadline ? new Date(body.deadline) : null
    } else {
      // Le client ne peut modifier que titre/description tant que le projet démarre
      if (project.status !== "ONBOARDING") {
        return NextResponse.json({ error: "Le projet est déjà en cours, contactez votre chef de projet." }, { status: 403 })
      }
      if (body.title !== undefined) data.title = String(body.title)
      if (body.description !== undefined) data.description = String(body.description)
    }

    const updated = await db.project.update({ where: { id }, data })

    // Notifications de changement de statut
    if (data.status && data.status !== project.status) {
      const progressMap: Record<string, number> = {
        ONBOARDING: 5, ANALYSIS: 15, DESIGN: 30, DEV: 55, QA: 75, DEPLOYMENT: 90, DONE: 100,
      }
      if (!data.progress) {
        await db.project.update({ where: { id }, data: { progress: progressMap[String(data.status)] ?? project.progress } })
      }
      await notify(
        project.clientId,
        "Avancement du projet",
        `« ${updated.title} » est passé en phase : ${String(data.status)}.`,
        "PROJECT",
        `/projects/${id}`
      )
    }
    if (user.role === "ADMIN") {
      await audit(user.id, "UPDATE_PROJECT", "Project", id, JSON.stringify(data).slice(0, 300))
    }

    return NextResponse.json({ project: updated })
  } catch (e) {
    return handleError(e)
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser()
    if (user.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    const { id } = await params
    await db.project.delete({ where: { id } })
    await audit(user.id, "DELETE_PROJECT", "Project", id)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return handleError(e)
  }
}

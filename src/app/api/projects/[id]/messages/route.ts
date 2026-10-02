import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { handleError } from "@/lib/api"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser()
    const { id } = await params
    const project = await db.project.findUnique({ where: { id } })
    if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 })
    if (user.role !== "ADMIN" && project.clientId !== user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    const messages = await db.message.findMany({
      where: { projectId: id },
      include: { sender: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: "asc" },
      take: 200,
    })
    return NextResponse.json({ messages })
  } catch (e) {
    return handleError(e)
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser()
    const { id } = await params
    const project = await db.project.findUnique({ where: { id } })
    if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 })
    if (user.role !== "ADMIN" && project.clientId !== user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await req.json()
    const text = String(body?.text ?? "").trim()
    if (!text) return NextResponse.json({ error: "Message vide" }, { status: 400 })

    const message = await db.message.create({
      data: { projectId: id, senderId: user.id, text: text.slice(0, 4000) },
      include: { sender: { select: { id: true, name: true, role: true } } },
    })

    // Marquer les anciens messages du projet comme lus pour l'expéditeur
    await db.message.updateMany({
      where: { projectId: id, senderId: { not: user.id }, read: false },
      data: { read: true },
    })

    // Notifier les destinataires (client du projet + admins)
    if (user.role === "ADMIN") {
      if (project.clientId !== user.id) {
        await db.notification.create({
          data: {
            userId: project.clientId,
            title: "Nouveau message",
            message: `Votre équipe a répondu sur « ${project.title} » : ${text.slice(0, 80)}`,
            type: "CHAT",
            link: `/projects/${id}?tab=chat`,
          },
        })
      }
    } else {
      const admins = await db.user.findMany({ where: { role: "ADMIN" } })
      await Promise.all(
        admins.map((a) =>
          db.notification.create({
            data: {
              userId: a.id,
              title: "Nouveau message client",
              message: `${user.name} sur « ${project.title} » : ${text.slice(0, 80)}`,
              type: "CHAT",
              link: `/projects/${id}?tab=chat`,
            },
          })
        )
      )
    }

    return NextResponse.json({ message })
  } catch (e) {
    return handleError(e)
  }
}

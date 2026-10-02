import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { makeReference, requireUser, notify } from "@/lib/auth"
import { estimate } from "@/lib/estimator"
import { handleError } from "@/lib/api"

export async function GET() {
  try {
    const user = await requireUser()
    const where = user.role === "ADMIN" ? {} : { clientId: user.id }
    const projects = await db.project.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true, companyName: true } },
        _count: { select: { messages: true, tickets: true, invoices: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ projects })
  } catch (e) {
    return handleError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    const body = await req.json()
    const { title, description, category, features, urgency } = body ?? {}

    if (!title || !category) {
      return NextResponse.json({ error: "Titre et type de projet requis" }, { status: 400 })
    }

    const est = estimate(category, Array.isArray(features) ? features : [], Boolean(urgency))
    const count = await db.project.count()

    const project = await db.project.create({
      data: {
        reference: makeReference("PRJ", count),
        title: String(title).trim(),
        description: description ? String(description).trim() : null,
        category: String(category),
        budget: est.total,
        features: JSON.stringify(Array.isArray(features) ? features : []),
        techStack: JSON.stringify(est.stack),
        timeline: `${est.days} jours`,
        status: "ONBOARDING",
        progress: 5,
        clientId: user.id,
      },
    })

    // Admins sont notifiés du nouveau projet
    const admins = await db.user.findMany({ where: { role: "ADMIN" } })
    await Promise.all(
      admins.map((a) =>
        notify(a.id, "Nouveau projet", `${user.name} a lancé le projet « ${project.title} » (${est.total.toLocaleString("fr-FR")} FCFA).`, "PROJECT", `/projects/${project.id}`)
      )
    )
    await notify(user.id, "Projet créé ✅", `Votre projet « ${project.title} » a bien été enregistré. Notre équipe l'analyse dès maintenant.`, "PROJECT")

    return NextResponse.json({ project })
  } catch (e) {
    return handleError(e)
  }
}

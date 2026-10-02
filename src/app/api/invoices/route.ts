import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { makeReference, requireUser, notify } from "@/lib/auth"
import { handleError } from "@/lib/api"
import { formatAmount } from "@/lib/platform"

export async function GET() {
  try {
    const user = await requireUser()
    const where = user.role === "ADMIN" ? {} : { clientId: user.id }
    const invoices = await db.invoice.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ invoices })
  } catch (e) {
    return handleError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    if (user.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 })

    const body = await req.json()
    const { clientId, projectId, amount, description, dueDate } = body ?? {}
    if (!clientId || !amount || !dueDate) {
      return NextResponse.json({ error: "Client, montant et échéance requis" }, { status: 400 })
    }
    const client = await db.user.findUnique({ where: { id: clientId } })
    if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 })

    const count = await db.invoice.count()
    const invoice = await db.invoice.create({
      data: {
        number: makeReference("FAC", count),
        clientId,
        projectId: projectId || null,
        amount: Number(amount),
        description: description ? String(description) : null,
        dueDate: new Date(dueDate),
        status: "SENT",
      },
      include: { project: { select: { id: true, title: true } } },
    })

    await notify(clientId, "Nouvelle facture", `Une facture de ${formatAmount(invoice.amount)} vous a été adressée.`, "PAYMENT", "/invoices")
    return NextResponse.json({ invoice })
  } catch (e) {
    return handleError(e)
  }
}

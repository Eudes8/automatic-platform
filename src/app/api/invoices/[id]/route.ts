import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser, notify } from "@/lib/auth"
import { handleError } from "@/lib/api"
import { formatAmount } from "@/lib/platform"

type Params = { params: Promise<{ id: string }> }

const ALLOWED = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await requireUser()
    const { id } = await params
    const invoice = await db.invoice.findUnique({ where: { id } })
    if (!invoice) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 })
    if (user.role !== "ADMIN" && invoice.clientId !== user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await req.json()
    const data: Record<string, unknown> = {}
    if (body.status && ALLOWED.includes(body.status)) {
      if (user.role !== "ADMIN" && body.status !== "PAID") {
        return NextResponse.json({ error: "Le client peut uniquement déclarer un paiement" }, { status: 403 })
      }
      data.status = body.status
      if (body.status === "PAID") data.paidAt = new Date()
    }
    if (user.role === "ADMIN") {
      if (body.amount !== undefined) data.amount = Number(body.amount)
      if (body.description !== undefined) data.description = String(body.description)
      if (body.dueDate) data.dueDate = new Date(body.dueDate)
    }

    const updated = await db.invoice.update({ where: { id }, data })

    if (data.status === "PAID") {
      // Avertir l'admin d'un paiement déclaré par le client
      if (user.role === "CLIENT") {
        const admins = await db.user.findMany({ where: { role: "ADMIN" } })
        await Promise.all(
          admins.map((a) =>
            notify(a.id, "Paiement déclaré", `${user.name} déclare avoir payé la facture ${updated.number} (${formatAmount(updated.amount)}).`, "PAYMENT")
          )
        )
      } else {
        await notify(
          invoice.clientId,
          "Facture payée ✅",
          `Votre paiement de la facture ${updated.number} (${formatAmount(updated.amount)}) a été confirmé. Merci !`,
          "PAYMENT"
        )
      }
    }

    return NextResponse.json({ invoice: updated })
  } catch (e) {
    return handleError(e)
  }
}

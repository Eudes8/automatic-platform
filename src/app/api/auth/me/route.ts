import { NextRequest, NextResponse } from "next/server"
import { requireUser, destroySession, getSessionUser } from "@/lib/auth"
import { handleError } from "@/lib/api"
import { db } from "@/lib/db"
import { verifyPassword, hashPassword } from "@/lib/auth"

// Session courante
export async function GET() {
  const user = await getSessionUser()
  return NextResponse.json({ user })
}

// Mise à jour du profil / mot de passe
export async function PATCH(req: NextRequest) {
  try {
    const current = await requireUser()
    const body = await req.json()

    const data: Record<string, unknown> = {}
    if (body.name) data.name = String(body.name).trim()
    if (body.companyName !== undefined) data.companyName = body.companyName ? String(body.companyName) : null
    if (body.phone !== undefined) data.phone = body.phone ? String(body.phone) : null

    // Changement de mot de passe
    if (body.newPassword) {
      if (typeof body.newPassword !== "string" || body.newPassword.length < 6) {
        return NextResponse.json({ error: "Le nouveau mot de passe doit contenir au moins 6 caractères" }, { status: 400 })
      }
      const full = await db.user.findUnique({ where: { id: current.id } })
      if (!full || !verifyPassword(String(body.currentPassword ?? ""), full.passwordHash)) {
        return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 403 })
      }
      data.passwordHash = hashPassword(String(body.newPassword))
    }

    const user = await db.user.update({ where: { id: current.id }, data })
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, companyName: user.companyName, phone: user.phone },
    })
  } catch (e) {
    return handleError(e)
  }
}

export async function DELETE() {
  try {
    const user = await requireUser()
    await db.user.delete({ where: { id: user.id } })
    await destroySession()
    return NextResponse.json({ ok: true })
  } catch {
    return handleError(new Error("delete account"))
  }
}

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashPassword, requireAdmin, audit } from "@/lib/auth"
import { handleError } from "@/lib/api"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin()
    const { id } = await params
    const body = await req.json()
    const data: Record<string, unknown> = {}
    if (body.name) data.name = String(body.name)
    if (body.role && ["ADMIN", "CLIENT"].includes(body.role)) data.role = body.role
    if (body.companyName !== undefined) data.companyName = body.companyName ? String(body.companyName) : null
    if (body.phone !== undefined) data.phone = body.phone ? String(body.phone) : null
    if (body.password) data.passwordHash = hashPassword(String(body.password))

    const user = await db.user.update({ where: { id }, data })
    await audit(admin.id, "UPDATE_USER", "User", id, JSON.stringify({ ...data, passwordHash: undefined }).slice(0, 200))
    return NextResponse.json({ user: { id: user.id, name: user.name, role: user.role } })
  } catch (e) {
    return handleError(e)
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin()
    const { id } = await params
    if (id === admin.id) return NextResponse.json({ error: "Impossible de supprimer votre propre compte" }, { status: 400 })
    await db.user.delete({ where: { id } })
    await audit(admin.id, "DELETE_USER", "User", id)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return handleError(e)
  }
}

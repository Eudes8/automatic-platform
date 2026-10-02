import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashPassword, requireAdmin, audit } from "@/lib/auth"
import { handleError } from "@/lib/api"

export async function GET() {
  try {
    await requireAdmin()
    const users = await db.user.findMany({
      select: {
        id: true, email: true, name: true, role: true, companyName: true, phone: true, createdAt: true,
        _count: { select: { projects: true, tickets: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ users })
  } catch (e) {
    return handleError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()
    const { email, password, name, role, companyName } = body ?? {}
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, mot de passe et nom requis" }, { status: 400 })
    }
    const normalized = String(email).toLowerCase().trim()
    const exists = await db.user.findUnique({ where: { email: normalized } })
    if (exists) return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 })

    const user = await db.user.create({
      data: {
        email: normalized,
        passwordHash: hashPassword(String(password)),
        name: String(name).trim(),
        role: role === "ADMIN" ? "ADMIN" : "CLIENT",
        companyName: companyName ? String(companyName) : null,
      },
    })
    await audit(admin.id, "CREATE_USER", "User", user.id, user.email)
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  } catch (e) {
    return handleError(e)
  }
}

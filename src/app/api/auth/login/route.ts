import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { createSession, verifyPassword } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body ?? {}
    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email: String(email).toLowerCase().trim() } })
    if (!user || !verifyPassword(String(password), user.passwordHash)) {
      return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 })
    }

    await createSession(user.id)
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, companyName: user.companyName },
    })
  } catch (e) {
    console.error("login error", e)
    return NextResponse.json({ error: "Erreur serveur lors de la connexion" }, { status: 500 })
  }
}

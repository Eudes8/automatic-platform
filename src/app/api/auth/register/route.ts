import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { createSession, hashPassword, notify } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name, companyName, phone } = body ?? {}

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, mot de passe et nom sont requis" }, { status: 400 })
    }
    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères" }, { status: 400 })
    }
    const normalized = String(email).toLowerCase().trim()
    const existing = await db.user.findUnique({ where: { email: normalized } })
    if (existing) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 })
    }

    const user = await db.user.create({
      data: {
        email: normalized,
        passwordHash: hashPassword(password),
        name: String(name).trim(),
        companyName: companyName ? String(companyName).trim() : null,
        phone: phone ? String(phone).trim() : null,
        role: "CLIENT",
      },
    })

    await createSession(user.id)
    await notify(
      user.id,
      "Bienvenue chez AUTOMATIC 🚀",
      "Votre compte a été créé avec succès. Lancez votre premier projet depuis le Project Builder.",
      "SUCCESS"
    )

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, companyName: user.companyName },
    })
  } catch (e) {
    console.error("register error", e)
    return NextResponse.json({ error: "Erreur serveur lors de l'inscription" }, { status: 500 })
  }
}

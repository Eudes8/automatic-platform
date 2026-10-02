import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { handleError } from "@/lib/api"

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    const body = await req.json().catch(() => ({}))
    const where = body?.id
      ? { id: String(body.id), userId: user.id }
      : { userId: user.id }
    await db.notification.updateMany({ where, data: { read: true } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return handleError(e)
  }
}

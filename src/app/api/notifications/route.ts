import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/auth"
import { handleError } from "@/lib/api"

export async function GET() {
  try {
    const user = await requireUser()
    const [notifications, unread] = await Promise.all([
      db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 }),
      db.notification.count({ where: { userId: user.id, read: false } }),
    ])
    return NextResponse.json({ notifications, unread })
  } catch (e) {
    return handleError(e)
  }
}

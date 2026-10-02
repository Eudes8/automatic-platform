import { cookies } from "next/headers"
import { randomBytes, scryptSync, timingSafeEqual } from "crypto"
import { db } from "@/lib/db"

const SESSION_COOKIE = "automatic_session"
const SESSION_DAYS = 30

// ─── Passwords (scrypt, no external dependency) ────────────────────────────

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false
  const candidate = scryptSync(password, salt, 64)
  const expected = Buffer.from(hash, "hex")
  return candidate.length === expected.length && timingSafeEqual(candidate, expected)
}

// ─── Sessions ──────────────────────────────────────────────────────────────

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await db.session.create({ data: { token, userId, expiresAt } })
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    expires: expiresAt,
  })
  return token
}

export type SafeUser = {
  id: string
  email: string
  name: string
  role: string
  companyName: string | null
  phone: string | null
  createdAt: Date
}

export async function getSessionUser(): Promise<SafeUser | null> {
  try {
    const store = await cookies()
    const token = store.get(SESSION_COOKIE)?.value
    if (!token) return null

    const session = await db.session.findUnique({
      where: { token },
      include: { user: true },
    })
    if (!session) return null
    if (session.expiresAt < new Date()) {
      await db.session.delete({ where: { id: session.id } }).catch(() => {})
      return null
    }
    const { user } = session
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyName: user.companyName,
      phone: user.phone,
      createdAt: user.createdAt,
    }
  } catch {
    return null
  }
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (token) {
    await db.session.deleteMany({ where: { token } }).catch(() => {})
  }
  store.delete(SESSION_COOKIE)
}

// ─── Guards ────────────────────────────────────────────────────────────────

export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function requireUser(): Promise<SafeUser> {
  const user = await getSessionUser()
  if (!user) throw new HttpError(401, "Non authentifié")
  return user
}

export async function requireAdmin(): Promise<SafeUser> {
  const user = await requireUser()
  if (user.role !== "ADMIN") throw new HttpError(403, "Accès réservé à l'administration")
  return user
}

// ─── Helpers ───────────────────────────────────────────────────────────────

export async function notify(
  userId: string,
  title: string,
  message: string,
  type: string = "INFO",
  link?: string
) {
  return db.notification.create({ data: { userId, title, message, type, link } })
}

export async function audit(adminId: string, action: string, entity?: string, entityId?: string, details?: string) {
  return db.auditLog.create({ data: { adminId, action, entity, entityId, details } })
}

// Generators for human readable references
export function makeReference(prefix: string, count: number): string {
  const year = new Date().getFullYear()
  return `${prefix}-${year}-${String(count + 1).padStart(4, "0")}`
}

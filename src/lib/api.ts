import { NextResponse } from "next/server"
import { HttpError } from "@/lib/auth"

export function handleError(e: unknown) {
  if (e instanceof HttpError) {
    return NextResponse.json({ error: e.message }, { status: e.status })
  }
  console.error("api error", e)
  return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
}

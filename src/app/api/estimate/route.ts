import { NextRequest, NextResponse } from "next/server"
import { estimate } from "@/lib/estimator"
import { handleError } from "@/lib/api"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { projectType, features, urgency } = body ?? {}
    const result = estimate(String(projectType ?? "web"), Array.isArray(features) ? features : [], Boolean(urgency))
    return NextResponse.json({ estimate: result })
  } catch (e) {
    return handleError(e)
  }
}

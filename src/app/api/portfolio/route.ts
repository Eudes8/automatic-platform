import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { handleError } from "@/lib/api"

export async function GET() {
  try {
    const items = await db.portfolioItem.findMany({ orderBy: [{ featured: "desc" }, { createdAt: "desc" }] })
    return NextResponse.json({ items })
  } catch (e) {
    return handleError(e)
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const body = await req.json()
    const { title, category, description, image, tech, url, featured } = body ?? {}
    if (!title || !category || !description || !image) {
      return NextResponse.json({ error: "Titre, catégorie, description et image requis" }, { status: 400 })
    }
    const item = await db.portfolioItem.create({
      data: {
        title: String(title),
        category: String(category),
        description: String(description),
        image: String(image),
        tech: JSON.stringify(Array.isArray(tech) ? tech : []),
        url: url ? String(url) : null,
        featured: Boolean(featured),
      },
    })
    return NextResponse.json({ item })
  } catch (e) {
    return handleError(e)
  }
}

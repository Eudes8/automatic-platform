import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/auth"
import { handleError } from "@/lib/api"

export async function GET() {
  try {
    await requireAdmin()

    const [totalProjects, activeProjects, totalClients, totalRevenue, pendingRevenue, openTickets, unreadMessages, recentProjects, statusCounts, monthlyRevenue, recentTickets] =
      await Promise.all([
        db.project.count(),
        db.project.count({ where: { status: { notIn: ["DONE", "ONBOARDING"] } } }),
        db.user.count({ where: { role: "CLIENT" } }),
        db.invoice.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
        db.invoice.aggregate({ where: { status: { in: ["SENT", "OVERDUE"] } }, _sum: { amount: true } }),
        db.ticket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
        db.message.count({ where: { read: false, sender: { role: "CLIENT" } } }),
        db.project.findMany({
          include: { client: { select: { name: true } } },
          orderBy: { updatedAt: "desc" },
          take: 6,
        }),
        db.project.groupBy({ by: ["status"], _count: { _all: true } }),
        db.invoice.findMany({ where: { status: "PAID" }, select: { amount: true, paidAt: true } }),
        db.ticket.findMany({
          include: { client: { select: { name: true } } },
          orderBy: { updatedAt: "desc" },
          take: 5,
        }),
      ])

    // Revenus mensuels (6 derniers mois)
    const months: { label: string; amount: number }[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleDateString("fr-FR", { month: "short" })
      const amount = monthlyRevenue
        .filter((inv) => inv.paidAt && inv.paidAt.getMonth() === d.getMonth() && inv.paidAt.getFullYear() === d.getFullYear())
        .reduce((s, inv) => s + inv.amount, 0)
      months.push({ label, amount })
    }

    return NextResponse.json({
      stats: {
        totalProjects,
        activeProjects,
        totalClients,
        totalRevenue: totalRevenue._sum.amount ?? 0,
        pendingRevenue: pendingRevenue._sum.amount ?? 0,
        openTickets,
        unreadMessages,
      },
      statusCounts: statusCounts.map((s) => ({ status: s.status, count: s._count._all })),
      monthlyRevenue: months,
      recentProjects,
      recentTickets,
    })
  } catch (e) {
    return handleError(e)
  }
}

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/utils/adminAuth";

export async function GET(request: NextRequest) {
    try {
        await requireAdmin();

        const [total, open, inProgress, closed, urgent] = await Promise.all([
            prisma.ticket.count(),
            prisma.ticket.count({ where: { status: "OPEN" } }),
            prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
            prisma.ticket.count({ where: { status: "CLOSED" } }),
            prisma.ticket.count({ where: { priority: "URGENT" } })
        ]);

        return NextResponse.json({
            total,
            open,
            inProgress,
            closed,
            urgent
        });
    } catch (error) {
        console.error("Failed to fetch ticket stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch ticket statistics" },
            { status: 500 }
        );
    }
}
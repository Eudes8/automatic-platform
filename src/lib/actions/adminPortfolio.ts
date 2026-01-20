"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/utils/adminAuth";

export async function getPortfolioItemsAdmin() {
    await requireAdmin();
    return await prisma.portfolioProject.findMany({
        orderBy: { createdAt: "desc" }
    });
}

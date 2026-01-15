"use server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/utils/adminAuth";

export async function getAllUsers(page: number = 1, limit: number = 20) {
    await requireAdmin();
    try {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                include: {
                    projects: true
                },
                orderBy: {
                    createdAt: "desc"
                },
                skip,
                take: limit
            }),
            prisma.user.count()
        ]);
        return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (error) {
        console.error("Failed to fetch users", error);
        return { users: [], total: 0, page, limit, totalPages: 0 };
    }
}

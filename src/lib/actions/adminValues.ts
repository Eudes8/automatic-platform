"use server";
import prisma from "@/lib/prisma";

export async function getAllUsers() {
    try {
        const users = await prisma.user.findMany({
            include: {
                projects: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        return users;
    } catch (error) {
        console.error("Failed to fetch users", error);
        return [];
    }
}

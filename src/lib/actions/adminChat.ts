"use server";

import prisma from "@/lib/prisma";

export async function getAllProjectsWithMessages() {
    // Fetch projects that have messages or just all projects with their messages
    return await prisma.project.findMany({
        where: {
            // Optional: filter only active projects?
        },
        include: {
            client: true,
            messages: {
                include: {
                    sender: true
                },
                orderBy: { createdAt: 'asc' },
                take: 100
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });
}

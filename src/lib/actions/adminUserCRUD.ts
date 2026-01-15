"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/utils/adminAuth";
import { logAdminAction } from "@/lib/utils/audit";

export async function createClientUser(formData: FormData) {
    const admin = await requireAdmin();
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    // In a real app we'd create auth user too, but here we just create database user record
    // Assumes user will "claim" account via magic link or admin triggers auth creation elsewhere

    try {
        await prisma.user.create({
            data: {
                email,
                name,
                role: "CLIENT"
            }
        });
        await logAdminAction("CREATE_USER", `Created user ${email} (${name})`);
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Failed to create user", error);
        return { success: false, error: "Failed to create user" };
    }
}

export async function deleteUser(userId: string) {
    const admin = await requireAdmin();
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        await prisma.user.delete({
            where: { id: userId }
        });
        await logAdminAction("DELETE_USER", `Deleted user ${user?.email || userId}`);
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete" };
    }
}

export async function updateUser(userId: string, formData: FormData) {
    const admin = await requireAdmin();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;

    try {
        const oldUser = await prisma.user.findUnique({ where: { id: userId } });
        await prisma.user.update({
            where: { id: userId },
            data: { name, email, role: role as any }
        });
        await logAdminAction("UPDATE_USER", `Updated user ${oldUser?.email} to ${email} (${role})`);
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Failed to update user", error);
        return { success: false, error: "Failed to update user" };
    }
}

export async function getAllUsers(page: number = 1, limit: number = 20) {
    await requireAdmin();
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
        prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.user.count()
    ]);
    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
}

"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createClientUser(formData: FormData) {
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
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Failed to create user", error);
        return { success: false, error: "Failed to create user" };
    }
}

export async function deleteUser(userId: string) {
    try {
        await prisma.user.delete({
            where: { id: userId }
        });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete" };
    }
}

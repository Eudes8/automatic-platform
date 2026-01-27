"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "./users";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) {
        return { success: false, error: "Non autorisé" };
    }

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const companyName = formData.get("companyName") as string;
    const industry = formData.get("industry") as string;

    try {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                name,
                phone,
                companyName,
                industry,
            }
        });

        revalidatePath("/dashboard/settings");
        return { success: true };
    } catch (error) {
        console.error("Failed to update profile:", error);
        return { success: false, error: "Erreur lors de la mise à jour" };
    }
}

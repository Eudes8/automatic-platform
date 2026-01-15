"use server";

import { getCurrentUser } from "../actions/users";

export async function requireAdmin() {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required");
    }
    return user;
}
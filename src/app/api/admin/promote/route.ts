
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const email = "automaticbmje@gmail.com";

    // Update or Create the user in Prisma with ADMIN role
    const user = await prisma.user.upsert({
        where: { email },
        update: { role: "ADMIN" },
        create: {
            email,
            name: "Super Admin",
            role: "ADMIN"
        }
    });

    return NextResponse.json({ success: true, user });
}

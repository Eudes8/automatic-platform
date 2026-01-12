import prisma from "@/lib/prisma";

export async function createAdminUser() {
    // Check if default admin exists, if not create one
    // In a real scenario, you usually wouldn't expose this as a public action readily.
    // Use this via a script or secured route.
    const adminEmail = "automaticbmje@gmail.com";
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existing) {
        await prisma.user.create({
            data: {
                email: adminEmail,
                name: "Super Admin",
                role: "ADMIN"
            }
        });
        console.log("Admin user created.");
    }
}

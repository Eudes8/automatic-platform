
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
    const email = "DUMATH111@GMAIL.COM";
    console.log(`Checking user: ${email}`);

    try {
        const user = await prisma.user.findFirst({
            where: {
                email: {
                    equals: email,
                    mode: 'insensitive'
                }
            },
            include: {
                projects: true
            }
        });

        if (!user) {
            console.log("User not found!");
            const allUsers = await prisma.user.findMany({ select: { email: true }, take: 20 });
            console.log("Some user emails in DB:", allUsers.map(u => u.email));
            return;
        }

        console.log("User found:", {
            id: user.id,
            email: user.email,
            role: user.role,
            projectCount: user.projects.length
        });

        if (user.projects.length > 0) {
            console.log("Projects:", user.projects.map(p => ({ id: p.id, title: p.title, status: p.status })));
        } else {
            const totalProjects = await prisma.project.count();
            console.log(`User has 0 projects. Total projects in DB: ${totalProjects}`);

            const allProjects = await prisma.project.findMany({
                select: { id: true, title: true, clientId: true },
                take: 10
            });
            console.log("Sample projects in DB:", allProjects);
        }
    } catch (err) {
        console.error("Database error:", err);
    }
}

check()
    .catch(console.error)
    .finally(() => {
        prisma.$disconnect();
        pool.end();
    });

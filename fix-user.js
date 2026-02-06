
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fix() {
    const email = "Dumath111@gmail.com";
    console.log(`Fixing user role for: ${email}`);

    try {
        const user = await prisma.user.update({
            where: { email: email },
            data: { role: 'CLIENT' }
        });

        console.log("Successfully updated user role to CLIENT:", user.id);
    } catch (err) {
        console.error("Update failed:", err);
    }
}

fix()
    .catch(console.error)
    .finally(() => {
        prisma.$disconnect();
        pool.end();
    });

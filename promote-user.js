import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prismaClientSingleton = () => {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
};

const prisma = prismaClientSingleton();

async function promoteUser() {
  try {
    const user = await prisma.user.upsert({
      where: { email: "automaticbmje@gmail.com" },
      update: { role: "ADMIN" },
      create: {
        email: "automaticbmje@gmail.com",
        name: "Super Admin",
        role: "ADMIN"
      }
    });

    console.log('User promoted to ADMIN:', user);
  } catch (error) {
    console.error('Error promoting user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

promoteUser();
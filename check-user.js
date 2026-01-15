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

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "automaticbmje@gmail.com" }
    });

    console.log('User in database:', user);
  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
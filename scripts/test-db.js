/* eslint-disable @typescript-eslint/no-require-imports */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking Prisma Client...');
    if (prisma.portfolioProject) {
        console.log('✅ prisma.portfolioProject exists');
    } else {
        console.error('❌ prisma.portfolioProject is missing');
    }

    console.log('Checking Database Schema...');
    try {
        // Try to cast to UserRole to see if the type exists in DB context (indirectly)
        // Or just check if we can query strictly
        await prisma.$queryRaw`SELECT 'ADMIN'::"UserRole"`;
        console.log('✅ UserRole type exists in database');
    } catch (e) {
        console.error('❌ UserRole type check failed:', e.message);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

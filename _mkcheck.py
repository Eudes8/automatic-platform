import io
s = """import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const p = await prisma.project.findUnique({ where: { id: "cmwc2x20e000108l5sym8bji9" }, select: { title: true, budget: true, contractSigned: true, contractUrl: true } });
console.log(p);
const files = await prisma.storedFile.findMany({ where: { projectId: "cmwc2x20e000108l5sym8bji9" }, select: { id: true, name: true, size: true, mimeType: true } });
console.log(files);
await prisma.$disconnect(); await pool.end();
"""
io.open("_check2.mjs","w",encoding="utf-8").write(s)

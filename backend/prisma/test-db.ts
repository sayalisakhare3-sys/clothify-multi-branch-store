
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function testDatabase() {
  try {
    await prisma.$connect();

    const branches = await prisma.branch.findMany();

    console.log("Database connection successful!");
    console.log("Branches:", branches);
  } catch (error) {
    console.error("Database test failed:");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
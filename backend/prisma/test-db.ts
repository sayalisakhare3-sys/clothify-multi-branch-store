import "dotenv/config";
import { db } from "./db";

async function testDatabase() {
  try {
    const branches = await db.orm.public.Branch.all();

    console.log("✅ Database connection successful!");
    console.log("Branches:", branches);
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error);
  } finally {
    await db.close();
  }
}

testDatabase();
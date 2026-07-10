import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "../../generated/prisma/client.ts";

const { Pool } = pg;

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    const error = new Error("DATABASE_URL is not configured");
    error.code = "DATABASE_URL_MISSING";
    throw error;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
  });
}

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__hayiPrismaClient ||
  new Proxy(
    {},
    {
      get(target, prop) {
        if (!target.client) {
          target.client = createPrismaClient();
        }

        const value = target.client[prop];

        return typeof value === "function"
          ? value.bind(target.client)
          : value;
      },
    }
  );

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__hayiPrismaClient = prisma;
}

export default prisma;

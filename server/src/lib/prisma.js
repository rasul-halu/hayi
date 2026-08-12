import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import pg from "pg";
import { PrismaClient } from "../../generated/prisma/client.ts";

const { Pool } = pg;
const TIMEWEB_CA_CERTIFICATE = new URL("../../certs/root.crt", import.meta.url);

function createDatabaseConfig() {
  const runtimeUrl = new URL(process.env.DATABASE_URL);
  const sslMode = runtimeUrl.searchParams.get("sslmode");
  runtimeUrl.searchParams.delete("sslmode");

  const shouldUseVerifiedSsl = [
    "require",
    "verify-ca",
    "verify-full",
  ].includes(sslMode);

  if (!shouldUseVerifiedSsl) {
    return {
      connectionString: runtimeUrl.toString(),
    };
  }

  if (!fs.existsSync(TIMEWEB_CA_CERTIFICATE)) {
    const error = new Error("Database CA certificate is not configured");
    error.code = "DATABASE_CA_MISSING";
    throw error;
  }

  const ca = fs.readFileSync(TIMEWEB_CA_CERTIFICATE, "utf8");

  return {
    connectionString: runtimeUrl.toString(),
    ssl: {
      ca,
      rejectUnauthorized: true,
    },
  };
}

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    const error = new Error("DATABASE_URL is not configured");
    error.code = "DATABASE_URL_MISSING";
    throw error;
  }

  const pool = new Pool(createDatabaseConfig());

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

import fs from "node:fs";
import dotenv from "dotenv";
import prisma from "../src/lib/prisma.js";
dotenv.config({ path: new URL("../.env", import.meta.url) });
try {
  const url = new URL(process.env.DATABASE_URL);
  console.log(JSON.stringify({ host: url.hostname, database: url.pathname.slice(1) }));
  console.log(JSON.stringify(await prisma.$queryRaw`SELECT name, installed_version FROM pg_available_extensions WHERE name = 'pg_trgm'`));
  console.log(JSON.stringify(await prisma.$queryRaw`SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY migration_name`));
  const snapshot = await prisma.$transaction(async tx => {
    const result = {};
    for (const model of ["course", "chapter", "lesson", "question", "dictionaryWord", "alphabetLetter"]) {
      const { createHash } = await import("node:crypto");
      const rows = await tx[model].findMany({ orderBy: { id: "asc" } });
      result[model] = { count: rows.length, digest: createHash("sha256").update(JSON.stringify(rows)).digest("hex") };
    }
    return result;
  }, { isolationLevel: "RepeatableRead", timeout: 60000 });
  console.log(JSON.stringify(snapshot));
  const target = new URL("../data/dictionaries/db-status.json", import.meta.url);
  if (process.argv.includes("--compare")) {
    const { default: assert } = await import("node:assert/strict");
    assert.deepEqual(snapshot, JSON.parse(fs.readFileSync(target)));
    console.log("Existing course, lessons, questions, dictionary words and alphabet are unchanged.");
  } else fs.writeFileSync(target, JSON.stringify(snapshot, null, 2));
} finally { await prisma.$disconnect(); }

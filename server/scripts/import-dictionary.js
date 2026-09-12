import fs from "node:fs";
import { createHash } from "node:crypto";
import dotenv from "dotenv";
import prisma from "../src/lib/prisma.js";
import { parseDictionary } from "../src/dictionary/parseRussianLezginDictionary.js";
import { validateDictionary } from "../src/dictionary/validateDictionary.js";
import { importDictionary } from "../src/dictionary/importDictionary.js";

dotenv.config({ path: new URL("../.env", import.meta.url) });
const args = process.argv.slice(2);
if (args.some(arg => !["--dry-run", "--apply"].includes(arg)) || args.length > 1) throw new Error("Use --dry-run (default) or --apply");
try {
  const input = JSON.parse(fs.readFileSync(new URL("../data/dictionaries/russian-lezgin.extracted.json", import.meta.url)));
  const digest = createHash("sha256").update(fs.readFileSync(new URL("../data/dictionaries/russian-lezgin.pdf", import.meta.url))).digest("hex");
  if (input.version !== 2 || input.sha256 !== digest || digest !== "4197d720c3f512292c6a10e5927c314654347d12a35707a94d2eea68de75881e") throw new Error("Unexpected or stale source; extract and review this edition first");
  const result = parseDictionary(input.pages);
  const validation = validateDictionary(result);
  console.log(JSON.stringify({ pages: input.pages.length, found: result.entries.length, critical: validation.critical, warning: validation.warning }));
  if (!validation.valid) throw new Error("CRITICAL validation errors prohibit import");
  const url = new URL(process.env.DATABASE_URL);
  console.log(JSON.stringify({ database: { host: url.hostname, port: url.port, name: url.pathname.slice(1) }, dryRun: !args.includes("--apply") }));
  const table = await prisma.$queryRaw`SELECT to_regclass('public."DictionaryEntry"')::text AS name`;
  if (!table[0].name) {
    if (args.includes("--apply")) throw new Error("Dictionary migration must be applied first");
    console.log(JSON.stringify({ created: result.entries.length, updated: 0, skipped: 0, migrationRequired: true }));
  } else {
    console.log(JSON.stringify(await importDictionary(prisma, result.entries.map(entry => ({ ...entry, sourceDigest: digest })), { dryRun: !args.includes("--apply") })));
  }
} catch (error) {
  console.error("Dictionary import failed:", error.code || error.name, error.message.replace(/postgres(?:ql)?:\/\/\S+/g, "[redacted]"));
  process.exitCode = 1;
} finally { await prisma.$disconnect(); }

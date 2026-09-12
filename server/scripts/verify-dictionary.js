import assert from "node:assert/strict";
import dotenv from "dotenv";
import express from "express";
import prisma from "../src/lib/prisma.js";
import router from "../src/routes/dictionary.routes.js";
dotenv.config({ path: new URL("../.env", import.meta.url) });
const app = express();
app.use("/api/dictionary", router);
const server = app.listen(0, "127.0.0.1");
await new Promise(resolve => server.once("listening", resolve));
const base = process.env.DICTIONARY_API_URL || `http://127.0.0.1:${server.address().port}/api`;
async function get(path) {
  const response = await fetch(`${base}/dictionary${path}`);
  assert.equal(response.status, 200, path);
  return response.json();
}
try {
  console.log(JSON.stringify({ api: base, count: await prisma.dictionaryEntry.count() }));
  for (const q of ["брат", "сестра", "стха", "вах", "дом", "идти", "ЗА"]) {
    const result = await get(`/search?q=${encodeURIComponent(q)}`);
    assert.ok(result.entries.length);
    if (["брат", "сестра", "дом", "идти", "ЗА"].includes(q)) assert.equal(result.entries[0].headword.toLowerCase(), q.toLowerCase());
    if (q === "стха") assert.ok(result.entries.some(entry => entry.headword === "БРАТ"));
    if (q === "вах") assert.ok(result.entries.some(entry => entry.headword === "СЕСТРА"));
    const { entry } = await get(`/entries/${result.entries[0].id}`);
    assert.ok(entry.rawBody);
    console.log(JSON.stringify({ q, first: result.entries.slice(0, 3).map(entry => entry.headword), hasMore: result.hasMore }));
  }
  const prefix = await get("/search?q=" + encodeURIComponent("братс"));
  assert.ok(prefix.entries[0].headword.startsWith("БРАТС"));
  const a = await get("/search?limit=2&page=1"), b = await get("/search?limit=2&page=2");
  assert.equal(a.entries.length, 2); assert.equal(b.entries.length, 2);
  assert.ok(!a.entries.some(entry => b.entries.some(other => other.id === entry.id)));
  const za = (await get("/search?q=" + encodeURIComponent("ЗА"))).entries.filter(entry => entry.headword === "ЗА");
  assert.deepEqual(za.map(entry => entry.homonymIndex), [1, 2]);
  const jury = (await get("/search?q=" + encodeURIComponent("ЖЮРИ"))).entries[0];
  assert.ok(!(await get(`/entries/${jury.id}`)).entry.rawBody.includes("за дверью"));
  const invalid = await fetch(`${base}/dictionary/search?limit=1000`);
  assert.equal(invalid.status, 400);
  console.log("HTTP exact/prefix/reverse/detail/pagination/homonym checks passed.");
} finally {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
  await prisma.$disconnect();
}

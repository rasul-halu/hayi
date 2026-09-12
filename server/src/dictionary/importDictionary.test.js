import test from "node:test";
import assert from "node:assert/strict";
import { importDictionary, planImport } from "./importDictionary.js";

test("batch import is idempotent and does not combine homonyms", async () => {
  const rows = [];
  let batches = 0;
  const db = { $transaction: fn => fn({
    $queryRaw: async () => [],
    dictionaryEntry: {
      findMany: async () => rows,
      createMany: async ({ data }) => { batches++; rows.push(...data); },
      count: async () => rows.length,
    },
  }) };
  const entries = Array.from({ length: 1001 }, (_, i) => ({ source: "test", sourceKey: String(i), headword: "А", homonymIndex: i, rawBody: "body" }));
  assert.equal((await importDictionary(db, entries)).created, 1001);
  assert.equal(rows.length, 0);
  assert.equal((await importDictionary(db, entries, { dryRun: false })).created, 1001);
  assert.equal(batches, 3);
  assert.equal((await importDictionary(db, entries, { dryRun: false })).skipped, 1001);
  assert.equal(rows.length, 1001);
});
test("changed existing source and duplicate input fail rather than overwrite", () => {
  assert.throws(() => planImport([{ sourceKey: "1", rawBody: "a" }], [{ sourceKey: "1", rawBody: "b" }]), /differs/);
  assert.throws(() => planImport([{ sourceKey: "1" }, { sourceKey: "1" }], []), /Duplicate/);
  assert.throws(() => planImport([], [{ sourceKey: "old" }]), /missing/);
});

import test from "node:test";
import assert from "node:assert/strict";
import { dictionarySearchQuery, searchDictionary, searchParameters } from "./searchDictionary.js";

test("search binds exact, prefix and reverse patterns without interpolating user input", () => {
  const q = dictionarySearchQuery({ q: "  БРАТ " });
  assert.deepEqual(q.values.slice(0, 3), ["брат", "брат%", "%брат%"]);
  assert.match(q.text, /"searchText" LIKE \$3/);
  assert.match(q.text, /THEN 0[\s\S]*THEN 1[\s\S]*THEN 2[\s\S]*THEN 3 ELSE 4/);
  assert.equal(dictionarySearchQuery({ q: "стха" }).values[2], "%стха%");
  assert.equal(dictionarySearchQuery({ q: "100%_\\" }).values[1], "100\\%\\_\\\\%");
});
test("pagination requests only one extra record and stable offsets", async () => {
  const db = { $queryRawUnsafe: async (text, ...values) => {
    assert.deepEqual(values.slice(3), [3, 2]);
    return [{ id: "3" }, { id: "4" }, { id: "5" }];
  } };
  assert.deepEqual(await searchDictionary(db, { q: "брат", page: 2, limit: 2 }), { entries: [{ id: "3" }, { id: "4" }], page: 2, limit: 2, hasMore: true });
});
test("invalid pagination and non-string query are rejected", () => {
  for (const params of [{ q: [] }, { limit: 51 }, { page: 0 }, { page: "2.5" }, { q: "x".repeat(121) }]) assert.throws(() => searchParameters(params));
});

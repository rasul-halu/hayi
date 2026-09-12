import { normalizeSearch } from "./parseRussianLezginDictionary.js";

export function searchParameters({ q = "", limit = "20", page = "1" } = {}) {
  if (typeof q !== "string" || q.length > 120 || !/^\d+$/.test(String(limit)) || !/^\d+$/.test(String(page))) throw new Error("Invalid dictionary search parameters");
  limit = Number(limit); page = Number(page);
  if (!Number.isInteger(limit) || limit < 1 || limit > 50 || !Number.isInteger(page) || page < 1 || page > 2000) throw new Error("Invalid dictionary pagination");
  return { q: normalizeSearch(q), limit, page };
}

export function dictionarySearchQuery(params) {
  const { q, limit, page } = searchParameters(params);
  const escaped = q.replace(/[\\%_]/g, "\\$&");
  return {
    text: `SELECT "id", "headword", "homonymIndex", left("rawBody", 240) AS excerpt
      FROM "DictionaryEntry"
      WHERE $1 = '' OR "headwordNormalized" LIKE $3 OR "searchText" LIKE $3
      ORDER BY CASE WHEN "headwordNormalized" = $1 THEN 0
        WHEN "headwordNormalized" LIKE $2 THEN 1
        WHEN "headwordNormalized" LIKE $3 THEN 2
        WHEN regexp_replace("searchText", '^[0-9]+[.] *', '') LIKE $2
          AND substring(regexp_replace("searchText", '^[0-9]+[.] *', ''), length($1) + 1, 1) IN ('', ' ', '.', ',', ';', ':', '(', ')') THEN 3 ELSE 4 END,
        "headwordNormalized", "homonymIndex" NULLS FIRST, "sourcePage", "id"
      LIMIT $4 OFFSET $5`,
    values: [q, escaped + "%", "%" + escaped + "%", limit + 1, (page - 1) * limit],
    limit, page,
  };
}

export async function searchDictionary(db, params) {
  const { text, values, limit, page } = dictionarySearchQuery(params);
  const rows = await db.$queryRawUnsafe(text, ...values);
  return { entries: rows.slice(0, limit), hasMore: rows.length > limit, page, limit };
}

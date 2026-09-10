import { createHash } from "node:crypto";

export const SOURCE = "gadzhiev-ru-lez-1950";
export const normalizeSearch = text => String(text).trim().replace(/\s+/gu, " ").toLowerCase();

export function parseDictionary(pages) {
  const entries = [];
  const warnings = [];
  let started = false;
  let current;
  const finish = () => {
    if (!current) return;
    const rawBody = current.lines.join("\n").trim();
    const { headword, homonymIndex, sourcePage } = current;
    entries.push({
      source: SOURCE,
      sourceKey: createHash("sha256").update(headword + ":" + (homonymIndex ?? "") + ":" + sourcePage + ":" + entries.length).digest("hex"),
      headword,
      headwordNormalized: normalizeSearch(headword),
      homonymIndex,
      rawBody,
      searchText: normalizeSearch(rawBody),
      sourcePage
    });
  };
  for (const page of pages) {
    for (const line of page.lines) {
      const text = line.text.trim();
      if (!started) {
        if (!/^А1\s+союз/u.test(text)) continue;
        started = true;
      }
      if (/^М\.?\s*Гаджиев\. Русско-лезгинский словарь/u.test(text) || /^[а-яё]$/u.test(text) || /^([А-ЯЁ])\1$/iu.test(text) || /^\d+$/u.test(text)) continue;
      const match = line.bold && text.match(/^([А-ЯЁ][А-ЯЁ-]*)(\d+)?(?=\s|:|$)\s*:?[ ]*(.*)$/u);
      if (match) {
        finish();
        current = { headword: match[1], homonymIndex: match[2] ? Number(match[2]) : null, sourcePage: page.page, lines: [match[3]] };
      } else if (current) {
        current.lines.push(text);
        // Mixed Latin letters/digits also occur in damaged PDF headings.
        // Preserve the line, but do not silently accept a merged article.
        if (line.bold && /^[А-ЯЁA-Z0-9-]{2,}/u.test(text)) {
          warnings.push({ page: page.page, text, precedingHeadword: current.headword });
        }
      }
    }
  }
  finish();
  if (!started) throw new Error("Dictionary start marker А1 союз not found");
  return { entries, warnings };
}

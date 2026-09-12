import { createHash } from "node:crypto";

export const SOURCE = "gadzhiev-ru-lez-1950";
export const normalizeSearch = text => String(text).trim().replace(/\s+/gu, " ").toLowerCase();

const isHeadingColor = color => {
  const r = (color >> 16) & 255, g = (color >> 8) & 255, b = color & 255;
  return r > 80 && r > g * 1.3 && r > b * 1.3;
};
const russianLookalikes = { A: "А", B: "В", C: "С", E: "Е", H: "Н", K: "К", M: "М", O: "О", P: "Р", T: "Т", X: "Х", "3": "З" };

export function readHeading(line) {
  if (!line.spans) {
    const match = line.bold && line.text.match(/^([А-ЯЁ][А-ЯЁ-]*)(\d+)?(?=\s|:|$)\s*:?[ ]*(.*)$/u);
    return match ? { headword: match[1], rawHeadword: match[1], homonymIndex: match[2] ? Number(match[2]) : null, body: match[3] } : null;
  }
  const spans = line.spans;
  let i = spans.findIndex(span => span.text.trim());
  if (i < 0 || !isHeadingColor(spans[i].color)) return null;
  let heading = "";
  while (i < spans.length && (isHeadingColor(spans[i].color) || !spans[i].text.trim())) heading += spans[i++].text;
  let number = "";
  // Only consume an actual superscript span, not the first numbered meaning.
  if (spans[i] && (spans[i].size < 10 || (spans[i].flags & 1)) && /^[1-9I¹²³⁴з][.]?$/u.test(spans[i].text.trim())) number = spans[i++].text.trim().replace(/\.$/, "");
  const rawHeadword = heading.trim();
  const coloredBody = heading.trim().match(/^(.+?[А-ЯЁ])(\s*[а-яё][а-яё ]*)$/u);
  let bodyPrefix = "";
  if (coloredBody) { heading = coloredBody[1]; bodyPrefix = coloredBody[2].trim() + " "; }
  const suffix = heading.trim().match(/^(.+?[А-ЯЁ])([I¹²³⁴1-4])$/u);
  if (suffix && !number) { heading = suffix[1]; number = suffix[2]; }
  const digits = { I: "1", "¹": "1", "²": "2", "³": "3", "⁴": "4", "з": "3" };
  number = digits[number] || number;
  return {
    rawHeadword, headword: heading.trim().replace(/[ABCEHKMOPTX3]/g, c => russianLookalikes[c]),
    homonymIndex: /^[1-9]\d?$/u.test(number) ? Number(number) : null,
    unresolvedNumber: number && !/^[1-9]\d?$/u.test(number) ? number : null,
    body: bodyPrefix + (number && !/^[1-9]\d?$/u.test(number) ? number + " " : "") + spans.slice(i).map(span => span.text).join("").trim(),
  };
}

export function parseDictionary(pages) {
  const entries = [];
  const warnings = [];
  let started = false;
  let current;
  const finish = () => {
    if (!current) return;
    const rawBody = current.lines.join("\n").trim();
    const { headword, rawHeadword, homonymIndex, sourcePage, sourceEndPage } = current;
    entries.push({
      source: SOURCE,
      sourceKey: createHash("sha256").update(headword + ":" + (homonymIndex ?? "") + ":" + sourcePage + ":" + entries.length).digest("hex"),
      headword,
      rawHeadword,
      headwordNormalized: normalizeSearch(headword),
      homonymIndex,
      rawBody,
      searchText: normalizeSearch(rawBody),
      sourcePage,
      sourceEndPage
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
      const heading = readHeading(line);
      if (heading) {
        finish();
        current = { ...heading, sourcePage: page.page, sourceEndPage: page.page, lines: [heading.body] };
        if (heading.unresolvedNumber) warnings.push({ kind: "unresolved-number", page: page.page, text });
      } else if (current) {
        current.lines.push(text);
        current.sourceEndPage = page.page;
        // Mixed Latin letters/digits also occur in damaged PDF headings.
        // Preserve the line, but do not silently accept a merged article.
        if (line.bold && /^[А-ЯЁA-Z0-9-]{2,}(?:\s|\d|[I.,])/u.test(text)) {
          warnings.push({ page: page.page, text, precedingHeadword: current.headword });
        }
      }
    }
  }
  finish();
  if (!started) throw new Error("Dictionary start marker А1 союз not found");
  return { entries, warnings };
}

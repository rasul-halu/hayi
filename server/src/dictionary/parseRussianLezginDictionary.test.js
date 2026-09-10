import test from "node:test";
import assert from "node:assert/strict";
import { parseDictionary, normalizeSearch } from "./parseRussianLezginDictionary.js";
import { validateDictionary } from "./validateDictionary.js";

const line = (text, bold = true) => ({ text, bold });
const parse = lines => parseDictionary([{ page: 9, lines: [line("Предисловие", false), line("А1 союз ва"), ...lines] }]);

test("skips introduction and extracts a simple article", () => {
  const { entries } = parse([line("БРАТ стха")]);
  assert.equal(entries.length, 2);
  assert.equal(entries[1].headword, "БРАТ");
  assert.equal(entries[1].rawBody, "стха");
});

test("preserves meanings, labels, phrases and multiline continuation", () => {
  const { entries } = parse([line("СЕСТРА 1. вах. 2. мед. сестра"), line("медицинская сестра сестра.", false)]);
  assert.equal(entries[1].rawBody, "1. вах. 2. мед. сестра\nмедицинская сестра сестра.");
});

test("preserves continuation across pages without running header", () => {
  const { entries } = parseDictionary([
    { page: 9, lines: [line("А1 союз ва"), line("АБОНЕМЕНТ первая строка")] },
    { page: 10, lines: [line("М.Гаджиев. Русско-лезгинский словарь"), line("вторая строка", false), line("АБОНЕНТ перевод")] },
  ]);
  assert.equal(entries[1].rawBody, "первая строка\nвторая строка");
});

test("numbered and unnumbered homonyms have separate repeatable source keys", () => {
  const lines = [line("КОСА1 киф"), line("КОСА2 дергес"), line("ЗАМОК къеле"), line("ЗАМОК тIапIар")];
  const first = parse(lines).entries;
  assert.deepEqual(first, parse(lines).entries);
  assert.equal(new Set(first.map(entry => entry.sourceKey)).size, first.length);
  assert.equal(first[1].homonymIndex, 1);
  assert.equal(first[2].homonymIndex, 2);
});

test("normalization preserves meaningful Lezgin characters", () => {
  assert.equal(normalizeSearch("  КIвал   уь  ъ  ь  "), "кiвал уь ъ ь");
  assert.notEqual(normalizeSearch("кIвал"), normalizeSearch("квал"));
});

test("ambiguous heading cannot pass validation or lose original text", () => {
  const result = parse([line("ЖЮРИ перевод"), line("3A1 предлог текст")]);
  assert.ok(result.entries[1].rawBody.includes("3A1"));
  const validation = validateDictionary(result);
  assert.equal(validation.valid, false);
  assert.ok(validation.issues.some(issue => issue.kind === "unrecognized-heading"));
});

test("truncated alphabet heading is reported", () => {
  const result = parse([line("ДА1 да"), line("А2 союз")]);
  assert.ok(validateDictionary(result).issues.some(issue => issue.kind === "alphabet-section-regression"));
});

test("missing start marker fails instead of importing introductory text", () => {
  assert.throws(() => parseDictionary([{ page: 1, lines: [line("СЛОВАРЬ текст")] }]), /start marker/);
});

import test from "node:test";
import assert from "node:assert/strict";
import { parseDictionary, normalizeSearch, readHeading } from "./parseRussianLezginDictionary.js";
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

const span = (text, color = 0, size = 12, flags = 0) => ({ text, color, size, flags });
const pdfLine = (...spans) => ({ text: spans.map(s => s.text).join(""), spans });
test("PDF color and superscript separate homonym from numbered senses", () => {
  const heading = readHeading(pdfLine(span("3A", 12603469), span("1", 0, 8, 1), span(" предлог 1. текст. 2. пример.")));
  assert.equal(heading.headword, "ЗА");
  assert.equal(heading.rawHeadword, "3A");
  assert.equal(heading.homonymIndex, 1);
  assert.equal(heading.body, "предлог 1. текст. 2. пример.");
});
test("ЖЮРИ does not absorb ЗА across page boundary", () => {
  const result = parseDictionary([
    { page: 200, lines: [line("А1 союз ва"), pdfLine(span("ЖЮРИ", 12603469), span(" ср нескл. жюри."))] },
    { page: 201, lines: [pdfLine(span("3A", 12603469), span("1", 0, 8), span(" предлог за дверью")), pdfLine(span("ЗА", 12603469), span("2.", 0, 8), span(" что за"))] },
  ]);
  assert.equal(result.entries[1].rawBody, "ср нескл. жюри.");
  assert.deepEqual(result.entries.slice(2).map(x => [x.headword, x.homonymIndex]), [["ЗА", 1], ["ЗА", 2]]);
});
test("colored grammatical label is retained in body, not headword", () => {
  const result = readHeading(pdfLine(span("ВЕРФЬ ж", 12603469), span(" перевод")));
  assert.equal(result.headword, "ВЕРФЬ");
  assert.equal(result.body, "ж перевод");
});

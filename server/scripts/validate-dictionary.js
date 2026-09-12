import fs from "node:fs";
import { parseDictionary } from "../src/dictionary/parseRussianLezginDictionary.js";
import { validateDictionary } from "../src/dictionary/validateDictionary.js";
const input = JSON.parse(fs.readFileSync(new URL("../data/dictionaries/russian-lezgin.extracted.json", import.meta.url)));
const result = parseDictionary(input.pages);
const sampleWords = ["БРАТ", "СЕСТРА", "ЗА", "ЖЮРИ", "ЗАМОК", "КОСА", "АБАЖУР", "АБРИКОС", "АВОСЬ", "ЯЩИК", "ДОКАЗЫВАТЬ", "ЛЮБОВНЫЙ", "Я", "А"];
// Reproducible stratified random sample: one entry from each twentieth of the book.
let seed = 1950;
const randomSamples = Array.from({ length: 20 }, (_, i) => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return result.entries[Math.floor((i + seed / 4294967296) * result.entries.length / 20)];
});
const samples = [...result.entries.filter(x => sampleWords.includes(x.headword)), ...randomSamples];
const validation = validateDictionary(result);
const report = { ...validation, sha256: input.sha256, pages: input.pages.length, articles: result.entries.length, warnings: result.warnings, empty: result.entries.filter(x=>!x.rawBody), longest: [...result.entries].sort((a,b)=>b.rawBody.length-a.rawBody.length).slice(0,5), samples };
fs.writeFileSync(new URL("../data/dictionaries/validation-report.json", import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ valid: report.valid, pages: report.pages, articles: report.articles, critical: report.critical, warning: report.warning, report: "server/data/dictionaries/validation-report.json" }, null, 2));
if (!validation.valid) process.exitCode = 1;

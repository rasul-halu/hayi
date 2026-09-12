export function validateDictionary({ entries, warnings }) {
  const issues = warnings.map(warning => ({ kind: "unrecognized-heading", ...warning, severity: warning.text?.startsWith("XV веку") ? "WARNING" : "CRITICAL" }));
  const seen = new Set();
  for (const entry of entries) {
    if (!entry.rawBody) issues.push({ severity: entry.headword === "ИЮЛЬСКИЙ" && entry.sourcePage === 274 ? "WARNING" : "CRITICAL", kind: "empty-body", headword: entry.headword, page: entry.sourcePage });
    if (seen.has(entry.sourceKey)) issues.push({ severity: "CRITICAL", kind: "duplicate-source-key", sourceKey: entry.sourceKey });
    if (/[^А-ЯЁ ,!?.:()-]/u.test(entry.headword)) issues.push({ severity: "WARNING", kind: "unusual-headword", headword: entry.headword, page: entry.sourcePage });
    if (entry.rawBody.length > 1500 || (entry.rawBody.length > 0 && entry.rawBody.length < 4)) issues.push({ severity: "WARNING", kind: "unusual-length", headword: entry.headword, page: entry.sourcePage, length: entry.rawBody.length });
    seen.add(entry.sourceKey);
  }
  // A return to a previous letter can indicate a truncated heading (e.g. ДА -> А).
  let previousLetter = "";
  for (const entry of entries) {
    const letter = entry.headword[0].replace("Ё", "Е");
    if (previousLetter && letter < previousLetter) {
      issues.push({ severity: "WARNING", kind: "alphabet-section-regression", headword: entry.headword, page: entry.sourcePage, previousLetter });
    }
    previousLetter = letter;
  }
  for (const [headword, fragments] of [
    ["БРАТ", ["стха", "двоюродный брат"]],
    ["СЕСТРА", ["1. вах", "2. мед.", "медицинская"]],
    ["ЗА", ["предлог", "за дверью"]],
    ["ЖЮРИ", ["жюри"]],
  ]) {
    const article = entries.find(entry => entry.headword === headword);
    if (!article || fragments.some(fragment => !article.rawBody.includes(fragment))) {
      issues.push({ severity: "CRITICAL", kind: "reference-article-failed", headword });
    }
  }
  const za = entries.filter(entry => entry.headword === "ЗА");
  if (!za.some(entry => entry.homonymIndex === 1) || !za.some(entry => entry.homonymIndex === 2) || entries.some(entry => entry.headword === "ЖЮРИ" && /за дверью|предлог/u.test(entry.rawBody))) issues.push({ severity: "CRITICAL", kind: "za-boundaries" });
  const critical = issues.filter(issue => issue.severity === "CRITICAL").length;
  return { valid: critical === 0, critical, warning: issues.length - critical, issues };
}

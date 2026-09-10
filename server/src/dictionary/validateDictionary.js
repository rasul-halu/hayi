export function validateDictionary({ entries, warnings }) {
  const issues = warnings.map(warning => ({ kind: "unrecognized-heading", ...warning }));
  const seen = new Set();
  for (const entry of entries) {
    if (!entry.rawBody) issues.push({ kind: "empty-body", headword: entry.headword, page: entry.sourcePage });
    if (seen.has(entry.sourceKey)) issues.push({ kind: "duplicate-source-key", sourceKey: entry.sourceKey });
    seen.add(entry.sourceKey);
  }
  // A return to a previous letter can indicate a truncated heading (e.g. ДА -> А).
  let previousLetter = "";
  for (const entry of entries) {
    const letter = entry.headword[0].replace("Ё", "Е");
    if (previousLetter && letter < previousLetter) {
      issues.push({ kind: "alphabet-section-regression", headword: entry.headword, page: entry.sourcePage, previousLetter });
    }
    previousLetter = letter;
  }
  for (const [headword, fragments] of [
    ["БРАТ", ["стха", "двоюродный брат"]],
    ["СЕСТРА", ["1. вах", "2. мед.", "медицинская"]],
  ]) {
    const article = entries.find(entry => entry.headword === headword);
    if (!article || fragments.some(fragment => !article.rawBody.includes(fragment))) {
      issues.push({ kind: "reference-article-failed", headword });
    }
  }
  return { valid: issues.length === 0, issues };
}

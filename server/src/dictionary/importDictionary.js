export function planImport(entries, existing) {
  const byKey = new Map(existing.map(entry => [entry.sourceKey, entry]));
  if (new Set(entries.map(entry => entry.sourceKey)).size !== entries.length) throw new Error("Duplicate input source keys");
  const create = [];
  for (const entry of entries) {
    const previous = byKey.get(entry.sourceKey);
    if (!previous) create.push(entry);
    else if (Object.keys(entry).some(key => previous[key] !== entry[key])) {
      throw new Error(`Existing dictionary entry differs at page ${entry.sourcePage}; explicit dataset review required`);
    }
    byKey.delete(entry.sourceKey);
  }
  if (byKey.size) throw new Error("Existing source contains entries missing from this extraction");
  return { create, created: create.length, updated: 0, skipped: entries.length - create.length };
}

export async function importDictionary(db, entries, { dryRun = true } = {}) {
  if (!entries.length) throw new Error("Empty dictionary input");
  return db.$transaction(async tx => {
    // Serialize this dataset's importers; no other tables are written.
    if (!dryRun) await tx.$queryRaw`SELECT pg_advisory_xact_lock(1950, 34258)::text`;
    const existing = await tx.dictionaryEntry.findMany({ where: { source: entries[0].source } });
    const { create, ...summary } = planImport(entries, existing);
    if (!dryRun) {
      for (let offset = 0; offset < create.length; offset += 500) {
        await tx.dictionaryEntry.createMany({ data: create.slice(offset, offset + 500) });
      }
      const count = await tx.dictionaryEntry.count({ where: { source: entries[0].source } });
      if (count !== entries.length) throw new Error("Post-import count mismatch");
    }
    return summary;
  }, { timeout: 180000 });
}

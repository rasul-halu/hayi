# Russian-Lezgin dictionary source validation

Place the supplied PDF at `server/data/dictionaries/russian-lezgin.pdf`.
The PDF and generated extraction/report files are intentionally ignored by git.

From the repository root:

```powershell
python -m pip install --target server/.dictionary-tools PyMuPDF==1.26.4
npm.cmd --prefix server run dictionary:extract
npm.cmd --prefix server run test:dictionary
npm.cmd --prefix server run dictionary:validate
```

Extraction uses the PDF text layer, not OCR. The parser starts at the first
`А1 союз` article on physical page 9. Article bodies retain line breaks, labels,
meanings and examples. Homonyms remain separate, including unnumbered homonyms.
Keys are deterministic for this exact extraction and source order; they are not
intended to identify revised editions or a differently extracted source.

## Validation and import

The metadata-based parser uses heading color and superscript spans. The original
heading remains in rawHeadword; normalization of Russian heading lookalikes never
transliterates Lezgin text. Validation reports CRITICAL and WARNING separately.
Any CRITICAL error prohibits import. Reviewed source anomalies remain warnings.

For a new environment, after validation, tests and build:

```powershell
npm.cmd --prefix server run dictionary:import -- --dry-run
npm.cmd --prefix server run prisma:migrate:deploy
npm.cmd --prefix server run prisma:generate
npm.cmd --prefix server run dictionary:import -- --apply
```

The importer reads the existing DATABASE_URL without printing credentials. It
defaults to dry-run, checks the source SHA-256, serializes imports with an advisory
lock, and writes batches of 500 in one transaction. Identical entries are skipped;
conflicting existing articles abort instead of being overwritten. It never calls
the ordinary Prisma/course seed or deletes data. The unique source/sourceKey
identifies article occurrences, preserving even unnumbered homonyms.

Migration `20260910000000_add_dictionary_entries` adds only DictionaryEntry and its
indexes, using the available PostgreSQL pg_trgm extension for substring search.

**Production has already been imported: 34,258 articles.** Repeat import was
verified: created 0, updated 0, skipped 34,258. Do not rerun import just to deploy
the backend/frontend code.

## API and frontend

- GET /api/dictionary/search?q=...&page=1&limit=20 returns excerpts and hasMore.
- GET /api/dictionary/entries/:id returns the complete article and PDF page.
- Existing GET /api/dictionary still serves the original vocabulary list.

Maximum limit: 50. Ranking: exact Russian heading, prefix, contains, then body.
Within body matches, an initial whole-word equivalent precedes examples. Query
parameters are bound and LIKE wildcard characters are escaped. Reverse search is
article-text search, not a separately authored Lezgin-Russian dictionary.

Frontend /dictionary has Reference / Lesson Words tabs and uses apiClient. Set
REACT_APP_API_URL to the deployed backend's /api URL before building. DB import
does not deploy the new API or frontend; those require separate deployment.

## Read-only verification

```powershell
node server/scripts/verify-dictionary.js
```

By default this starts an ephemeral local HTTP router using the configured DB,
checks exact/prefix/reverse/detail/pagination/homonyms, then closes it. To verify
an already deployed API, set DICTIONARY_API_URL=https://your-api/api. No records
are imported or changed. A localhost test is not a public deployment check.

# Source review: structural validation passed

Source SHA-256:
`4197d720c3f512292c6a10e5927c314654347d12a35707a94d2eea68de75881e`

975 physical pages have a usable text layer. Articles start on physical page 9.
The first parser pass produced 33,910 candidates and 360 review signals.
The metadata-based parser recognizes **34,258 articles**, with **0 CRITICAL** and
**23 WARNING** signals. Production import created 34,258 rows; repeat import
created/updated zero rows. This validates structure, not the historical source's
linguistic accuracy.

## Reviewed samples

| Headword | Page | Preserved content |
| --- | --- | --- |
| А | 9 | Three numbered homonyms; conjunction, particle, interjection |
| АБАЖУР | 9 | Simple translation and explanation |
| АБРИКОС | 10 | Two numbered senses |
| АВОСЬ | 11 | Stylistic labels, example, fixed expression |
| БРАТ | 55 | `1. стха. 2. якъадаш.` and expressions including `двоюродный брат` |
| ДОКАЗЫВАТЬ | 176 | Grammatical label and cross-reference |
| ЗАМОК | 222 | Two separate unnumbered entries, not deduplicated by headword |
| КОСА | 312 | Three separately numbered homonyms |
| ЛЮБОВНЫЙ | 345 | Several equivalents |
| СЕСТРА | 770 | `1. вах.` and distinct `2. мед. сестра`, medical examples |
| Я | 971 | Pronoun forms, examples and expression |
| ЯЩИК | 975 | Translation and fixed expression |

These checks confirm preservation of these examples, not correctness of all
article boundaries.

## Resolved boundaries and source warnings

- The colored heading `3A` with superscript 1 now starts ЗА, homonym 1.
  ЗА 2 is separate too. ЖЮРИ no longer absorbs either article.
- Physical page 154 **visually displays** `А` with superscript `2` in the ДА
  section. This was checked on a rendered PDF page, not inferred only from text.
  Do not silently replace this original heading. The following ДА entry also has
  a superscript rendered as a Cyrillic letter in the text layer.
- Heading/meaning numbers such as `КРОШКА11.` are now separated by superscript
  span metadata rather than treating both digits as a homonym number.
- ИЮЛЬСКИЙ on page 274 has no body in the actual PDF (visually checked). It is
  preserved and flagged WARNING, not invented or silently discarded.
- `XV веку` is an example continuation, not a heading (WARNING).

## Additional stratified random review

The deterministic seed 1950 samples twenty equal sections of the dataset.
Reviewed: БРИТЬЁ (56), ВАГОН (64), ВРАЩЕНИЕ (102), ДУХОВКА (188), ЗАШВЫРНУТЬ (241),
ИСТОЛОЧЬ (272), КУШАТЬ (328), ЛОГИКА (340), НАСТАИВАТЬ (399), ОБОЮДНЫЙ (446),
ОТЛИЧИТЕЛЬНЫЙ (489), ПЕЙЗАЖ (517), ПОЛИНЯЛЫЙ (588), ПРОИЗВОДСТВЕННЫЙ (658),
ПРОФИЛЬТРОВАТЬ (674), РЕТИРОВАТЬСЯ (733), СЛАЖЕННЫЙ (786), ТРИБУН (869),
УСТАВЛЯТЬ (902), ЭПИГРАММА (967). Numbered senses, references, labels and multiline
explanations are preserved. The longest article is РУКА (2,827 characters), not
merged headings. All warning details remain in generated validation-report.json.

## Final verification (2026-09-12)

- Read-only production count: 34,258. No repeat import during this verification.
- HTTP router against production DB: all seven queries passed, as did exact,
  prefix, reverse, details, homonyms, invalid parameters and pagination checks.
- брат and сестра rank their exact entries first; стха ranks БРАТ first.
  вах returns СЕСТРА on page 1, after Russian heading matches such as ВАХМИСТР.
- Backend: 38 tests passed. Frontend: 42 existing tests plus the new vocabulary
  compatibility test passed (43 total). Production build succeeded when run
  separately; a simultaneous build/test attempt hit host memory exhaustion.
- Built frontend checked in headless Edge at 360x800, 390x844 and 430x932:
  search/detail/old vocabulary all usable, no horizontal overflow. Browser
  network responses confirmed actual apiClient search, detail and legacy requests.
- Public deployment NOT verified: production API/frontend URLs were not provided.
  The local HTTP test is not a claim that new code is already publicly deployed.
- No commit or push. Previous content checksum comparison remains confirmed;
  this continuation did not write courses, lessons, users, progress or hearts.

## Changed files for the complete integration

```text
server/package.json
server/prisma/schema.prisma
server/prisma/migrations/20260910000000_add_dictionary_entries/migration.sql
server/generated/prisma/browser.ts
server/generated/prisma/client.ts
server/generated/prisma/commonInputTypes.ts
server/generated/prisma/internal/class.ts
server/generated/prisma/internal/prismaNamespace.ts
server/generated/prisma/internal/prismaNamespaceBrowser.ts
server/generated/prisma/models.ts
server/generated/prisma/models/DictionaryEntry.ts
server/scripts/extract-dictionary.py
server/scripts/validate-dictionary.js
server/scripts/import-dictionary.js
server/scripts/dictionary-db-status.js
server/scripts/verify-dictionary.js
server/src/dictionary/parseRussianLezginDictionary.js
server/src/dictionary/parseRussianLezginDictionary.test.js
server/src/dictionary/validateDictionary.js
server/src/dictionary/importDictionary.js
server/src/dictionary/importDictionary.test.js
server/src/dictionary/searchDictionary.js
server/src/dictionary/searchDictionary.test.js
server/src/controllers/referenceDictionary.controller.js
server/src/routes/dictionary.routes.js
src/api/apiClient.js
src/pages/dictionary/Vocabulary.jsx
src/pages/dictionary/Vocabulary.test.jsx
src/components/dictionary/ReferenceDictionary.jsx
src/components/dictionary/ReferenceDictionary.css
src/components/dictionary/ReferenceDictionary.test.jsx
server/data/dictionaries/README.md
server/data/dictionaries/VALIDATION.md
```

PDF, extraction JSON, generated reports and local browser-check artifacts remain
ignored by git and excluded from the frontend bundle.

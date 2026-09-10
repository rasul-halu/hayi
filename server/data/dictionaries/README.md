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

## Current status: validation blocked

This is source preparation, **not a production importer**. No database connection
is made by these commands. No schema, API or frontend changes are included yet.

`dictionary:validate` writes `validation-report.json` and exits nonzero if any
unrecognized heading, alphabet-section regression or reference-article failure is
found. The report contains original lines, physical PDF page numbers, and samples.
Some PDF headings contain mixed Latin letters/digits, omitted letters, or fused
homonym/meaning numbers. These require comparison against the PDF before accepting
article boundaries. Do not interpret the candidate count as a validated article count.

No production import command is available until boundaries have been verified.
Never use the ordinary Prisma/course seed to import this dataset.

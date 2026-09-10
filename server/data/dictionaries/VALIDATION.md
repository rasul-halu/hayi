# Source review: not approved for import

Source SHA-256:
`4197d720c3f512292c6a10e5927c314654347d12a35707a94d2eea68de75881e`

975 physical pages have a usable text layer. Articles start on physical page 9.
The first parser pass produces 33,910 **candidates**, not a validated dataset.
The current validator reports 360 review signals: 346 possible missed headings,
13 alphabet-section regressions, and one empty article body. These signals can
include parser false positives; they are not a count of confirmed PDF errors.

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

## Blocking examples

- A heading extracted as `3A1` is currently appended to ЖЮРИ. The parser must
  recognize the source's typography, not require pure Cyrillic heading strings.
- Physical page 154 **visually displays** `А` with superscript `2` in the ДА
  section. This was checked on a rendered PDF page, not inferred only from text.
  Do not silently replace this original heading. The following ДА entry also has
  a superscript rendered as a Cyrillic letter in the text layer.
- Heading/meaning numbers can be joined, e.g. `КРОШКА11.`. Superscript span
  information is needed to distinguish a homonym number from sense `1.`.

The extractor currently records text and boldness. A next parser iteration should
retain heading color and superscript span geometry: the reviewed PDF page uses
colored headings and small superscripts. Full validation must then be repeated
before implementing or running a production importer. No database writes have
been made by these source preparation scripts.

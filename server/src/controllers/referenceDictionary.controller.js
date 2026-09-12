import prisma from "../lib/prisma.js";
import { searchDictionary, searchParameters } from "../dictionary/searchDictionary.js";

function unavailable(res, error) {
  console.error("Reference dictionary unavailable", { name: error.name, code: error.code });
  return res.status(503).json({ error: "Словарь временно недоступен" });
}

export async function searchReferenceDictionary(req, res) {
  let params;
  try { params = searchParameters(req.query); }
  catch { return res.status(400).json({ error: "Некорректные параметры поиска" }); }
  try { return res.json(await searchDictionary(prisma, params)); }
  catch (error) { return unavailable(res, error); }
}

export async function getReferenceEntry(req, res) {
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(req.params.id)) return res.status(400).json({ error: "Некорректный идентификатор статьи" });
  try {
    const entry = await prisma.dictionaryEntry.findUnique({
      where: { id: req.params.id },
      select: { id: true, headword: true, homonymIndex: true, rawBody: true, sourcePage: true, sourceEndPage: true },
    });
    return entry ? res.json({ entry }) : res.status(404).json({ error: "Статья не найдена" });
  } catch (error) { return unavailable(res, error); }
}

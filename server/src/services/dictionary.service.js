import prisma from "../lib/prisma.js";

const DICTIONARY_ORDER_BY = [
  {
    category: "asc",
  },
  {
    order: "asc",
  },
  {
    createdAt: "asc",
  },
];

export function formatDictionaryWord(word) {
  return {
    id: word.id,
    lezgian: word.lezgian,
    russian: word.russian,
    transcription: word.transcription,
    exampleLezgian: word.exampleLezgian,
    exampleRussian: word.exampleRussian,
    audioUrl: word.audioUrl,
    imageUrl: word.imageUrl,
    category: word.category,
    order: word.order,
    isPublished: word.isPublished,
    createdAt: word.createdAt,
    updatedAt: word.updatedAt,
  };
}

export async function listAdminDictionaryWords() {
  const words = await prisma.dictionaryWord.findMany({
    orderBy: DICTIONARY_ORDER_BY,
  });

  return words.map(formatDictionaryWord);
}

export async function listPublishedDictionaryWords() {
  const words = await prisma.dictionaryWord.findMany({
    where: {
      isPublished: true,
    },
    orderBy: DICTIONARY_ORDER_BY,
  });

  return words.map(formatDictionaryWord);
}

export async function getDictionaryWordById(wordId) {
  const word = await prisma.dictionaryWord.findUnique({
    where: {
      id: wordId,
    },
  });

  return word ? formatDictionaryWord(word) : null;
}

export async function createDictionaryWord(data) {
  const word = await prisma.dictionaryWord.create({
    data,
  });

  return formatDictionaryWord(word);
}

export async function updateDictionaryWord(wordId, data) {
  const word = await prisma.dictionaryWord.update({
    where: {
      id: wordId,
    },
    data,
  });

  return formatDictionaryWord(word);
}

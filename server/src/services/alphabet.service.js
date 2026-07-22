import prisma from "../lib/prisma.js";

const ALPHABET_ORDER_BY = [
  { order: "asc" },
  { createdAt: "asc" },
];

export function formatAlphabetLetter(letter) {
  return {
    id: letter.id,
    letter: letter.letter,
    displayLetter: letter.displayLetter,
    name: letter.name,
    description: letter.description,
    example: letter.example,
    exampleMeaning: letter.exampleMeaning,
    audioUrl: letter.audioUrl,
    imageUrl: letter.imageUrl,
    order: letter.order,
    isPublished: letter.isPublished,
    createdAt: letter.createdAt,
    updatedAt: letter.updatedAt,
  };
}

export async function listPublishedAlphabetLetters() {
  const letters = await prisma.alphabetLetter.findMany({
    where: { isPublished: true },
    orderBy: ALPHABET_ORDER_BY,
  });

  return letters.map(formatAlphabetLetter);
}

export async function listAdminAlphabetLetters() {
  const letters = await prisma.alphabetLetter.findMany({
    orderBy: ALPHABET_ORDER_BY,
  });

  return letters.map(formatAlphabetLetter);
}

export async function createAlphabetLetter(data) {
  const letter = await prisma.alphabetLetter.create({ data });
  return formatAlphabetLetter(letter);
}

export async function updateAlphabetLetter(letterId, data) {
  const letter = await prisma.alphabetLetter.update({
    where: { id: letterId },
    data,
  });

  return formatAlphabetLetter(letter);
}

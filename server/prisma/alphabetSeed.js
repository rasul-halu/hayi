import { alphabetLetters } from "../../src/data/alphabetData.js";

export const alphabetSeedCount = alphabetLetters.length;

export async function seedAlphabet(prisma) {
  for (const [index, sourceLetter] of alphabetLetters.entries()) {
    await prisma.alphabetLetter.upsert({
      where: {
        letter: sourceLetter.letter,
      },
      create: {
        id: sourceLetter.id,
        letter: sourceLetter.letter,
        displayLetter: sourceLetter.letter,
        name: sourceLetter.name || sourceLetter.letter,
        audioUrl: sourceLetter.audio || null,
        order: index + 1,
        isPublished: true,
      },
      update: {},
    });
  }
}

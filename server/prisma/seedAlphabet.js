import "dotenv/config";

import prisma from "../src/lib/prisma.js";
import { alphabetSeedCount, seedAlphabet } from "./alphabetSeed.js";

try {
  await seedAlphabet(prisma);
  console.log(`Seeded alphabet letters: ${alphabetSeedCount}`);
} finally {
  await prisma.$disconnect();
}

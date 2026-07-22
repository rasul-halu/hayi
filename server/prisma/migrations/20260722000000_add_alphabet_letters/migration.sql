CREATE TABLE "AlphabetLetter" (
    "id" TEXT NOT NULL,
    "letter" TEXT NOT NULL,
    "displayLetter" TEXT,
    "name" TEXT,
    "description" TEXT,
    "example" TEXT,
    "exampleMeaning" TEXT,
    "audioUrl" TEXT,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlphabetLetter_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AlphabetLetter_letter_key" ON "AlphabetLetter"("letter");
CREATE INDEX "AlphabetLetter_isPublished_order_idx" ON "AlphabetLetter"("isPublished", "order");

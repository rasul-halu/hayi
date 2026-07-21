CREATE TABLE "DictionaryWord" (
    "id" TEXT NOT NULL,
    "lezgian" TEXT NOT NULL,
    "russian" TEXT NOT NULL,
    "transcription" TEXT,
    "exampleLezgian" TEXT,
    "exampleRussian" TEXT,
    "audioUrl" TEXT,
    "imageUrl" TEXT,
    "category" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DictionaryWord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DictionaryWord_isPublished_idx" ON "DictionaryWord"("isPublished");
CREATE INDEX "DictionaryWord_category_order_idx" ON "DictionaryWord"("category", "order");

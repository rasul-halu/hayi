BEGIN;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE TABLE "DictionaryEntry" (
  "id" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "sourceKey" TEXT NOT NULL,
  "sourceDigest" TEXT NOT NULL,
  "headword" TEXT NOT NULL,
  "rawHeadword" TEXT NOT NULL,
  "headwordNormalized" TEXT NOT NULL,
  "homonymIndex" INTEGER,
  "rawBody" TEXT NOT NULL,
  "searchText" TEXT NOT NULL,
  "sourcePage" INTEGER NOT NULL,
  "sourceEndPage" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DictionaryEntry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DictionaryEntry_source_sourceKey_key" ON "DictionaryEntry"("source", "sourceKey");
CREATE INDEX "DictionaryEntry_headwordNormalized_idx" ON "DictionaryEntry"("headwordNormalized");
CREATE INDEX "DictionaryEntry_headword_trgm" ON "DictionaryEntry" USING GIN ("headwordNormalized" gin_trgm_ops);
CREATE INDEX "DictionaryEntry_body_trgm" ON "DictionaryEntry" USING GIN ("searchText" gin_trgm_ops);
COMMIT;

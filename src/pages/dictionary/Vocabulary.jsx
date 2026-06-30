import { useMemo, useState } from "react";
import { BookOpen } from "lucide-react";

import WordCard from "../../components/dictionary/WordCard";
import BottomNav from "../../components/layout/BottomNav";
import AppIcon from "../../components/ui/AppIcon";
import { getVocabulary } from "../../data/courseHelpers";

function getSearchText(word) {
  return [
    word.russian,
    word.lezgi,
    word.translation,
    word.word,
    word.notes
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function Vocabulary() {
  const [search, setSearch] = useState("");
  const vocabulary = getVocabulary();
  const normalizedSearch = search.trim().toLowerCase();

  const filteredWords = useMemo(() => {
    if (!normalizedSearch) {
      return vocabulary;
    }

    return vocabulary.filter(word =>
      getSearchText(word).includes(normalizedSearch)
    );
  }, [normalizedSearch, vocabulary]);

  return (
    <div
      style={{
        padding: 20,
        paddingBottom: 100
      }}
    >
      <h1
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10
        }}
      >
        <AppIcon icon={BookOpen} size={30} color="#58CC02" />
        Словарь
      </h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск..."
        style={{
          width: "100%",
          padding: 14,
          marginTop: 20,
          borderRadius: 12,
          border: "none"
        }}
      />

      <div
        style={{
          marginTop: 20
        }}
      >
        {filteredWords.length > 0 ? (
          filteredWords.map(word => (
            <WordCard
              key={word.id}
              word={word}
            />
          ))
        ) : (
          <p
            style={{
              color: "#D9D9D9"
            }}
          >
            Ничего не найдено
          </p>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

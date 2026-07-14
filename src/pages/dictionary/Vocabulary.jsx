import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import WordCard from "../../components/dictionary/WordCard";
import BottomNav from "../../components/layout/BottomNav";
import AppCard from "../../components/ui/AppCard";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";
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
    <PageContainer
      style={{
        background: "#F4F7F2",
        color: "#2D2D2D"
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 18,
          background: "#E9F8DD",
          color: "#58CC02",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 5px 0 #CFE2C4",
          marginBottom: 14
        }}
      >
        <AppIcon icon={BookOpen} size={30} />
      </div>

      <SectionTitle
        title="Словарь"
        subtitle="Ищи слова по-русски или по-лезгински"
      />

      <AppCard
        style={{
          marginTop: 16,
          background: "#FFFFFF",
          color: "#2D2D2D",
          border: "2px solid #E6E6E6",
          boxShadow: "0 6px 0 #D9D9D9",
          padding: 14
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#F7F8F5",
            border: "2px solid #E6E6E6",
            borderRadius: 16,
            padding: "0 14px"
          }}
        >
          <AppIcon icon={Search} size={20} color="#8A8A8A" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск..."
            style={{
              width: "100%",
              minHeight: 52,
              border: "none",
              outline: "none",
              background: "transparent",
              color: "#2D2D2D",
              fontSize: 16,
              fontWeight: 800
            }}
          />
        </label>
      </AppCard>

      <div style={{ marginTop: 18 }}>
        {filteredWords.length > 0 ? (
          filteredWords.map(word => (
            <WordCard key={word.id} word={word} />
          ))
        ) : (
          <AppCard
            style={{
              background: "#FFFFFF",
              color: "#2D2D2D",
              border: "2px solid #E6E6E6",
              boxShadow: "0 6px 0 #D9D9D9",
              textAlign: "center",
              fontWeight: 900
            }}
          >
            Ничего не найдено
          </AppCard>
        )}
      </div>

      <BottomNav />
    </PageContainer>
  );
}

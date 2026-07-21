import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, RefreshCw, Search } from "lucide-react";
import { getPublicDictionary } from "../../api/apiClient";
import WordCard from "../../components/dictionary/WordCard";
import BottomNav from "../../components/layout/BottomNav";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";
import { getVocabulary } from "../../data/courseHelpers";

function getSearchText(word) {
  return [
    word.russian,
    word.lezgian,
    word.lezgi,
    word.translation,
    word.word,
    word.transcription,
    word.category,
    word.notes
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function Vocabulary() {
  const [search, setSearch] = useState("");
  const [words, setWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [usedFallback, setUsedFallback] = useState(false);
  const normalizedSearch = search.trim().toLowerCase();

  const loadDictionary = useCallback(async () => {
    setIsLoading(true);
    setError("");
    setUsedFallback(false);

    try {
      const data = await getPublicDictionary();
      setWords(data.words || []);
    } catch (loadError) {
      if (process.env.NODE_ENV === "development") {
        setWords(getVocabulary());
        setUsedFallback(true);
      } else {
        setWords([]);
        setError("Не удалось загрузить словарь");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDictionary();
  }, [loadDictionary]);

  const filteredWords = useMemo(() => {
    if (!normalizedSearch) {
      return words;
    }

    return words.filter(word =>
      getSearchText(word).includes(normalizedSearch)
    );
  }, [normalizedSearch, words]);

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

      {usedFallback ? (
        <AppCard
          style={{
            marginTop: 14,
            background: "#FFF7D6",
            color: "#7A5A00",
            border: "2px solid #FFE59A",
            boxShadow: "0 5px 0 #E0B900",
            fontWeight: 900
          }}
        >
          Используется локальный словарь для разработки
        </AppCard>
      ) : null}

      <div style={{ marginTop: 18 }}>
        {isLoading ? (
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
            Загружаем словарь...
          </AppCard>
        ) : null}

        {!isLoading && error ? (
          <AppCard
            style={{
              background: "#FFFFFF",
              color: "#2D2D2D",
              border: "2px solid #E6E6E6",
              boxShadow: "0 6px 0 #D9D9D9",
              textAlign: "center"
            }}
          >
            <div style={{ fontWeight: 900, marginBottom: 12 }}>
              {error}
            </div>
            <AppButton onClick={loadDictionary} variant="secondary">
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8
                }}
              >
                <AppIcon icon={RefreshCw} size={18} />
                Повторить
              </span>
            </AppButton>
          </AppCard>
        ) : null}

        {!isLoading && !error && words.length === 0 ? (
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
            Словарь пока пуст
          </AppCard>
        ) : null}

        {!isLoading && !error && words.length > 0 && filteredWords.length === 0 ? (
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
        ) : null}

        {!isLoading && !error && filteredWords.map(word => (
          <WordCard key={word.id} word={word} />
        ))}
      </div>

      <BottomNav />
    </PageContainer>
  );
}

import { RefreshCw, Type } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getPublicAlphabet } from "../../api/apiClient";
import AudioPlayButton from "../../components/audio/AudioPlayButton";
import BottomNav from "../../components/layout/BottomNav";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";
import { useUser } from "../../context/UserContext";
import { alphabetLetters as developmentAlphabet } from "../../data/alphabetData";

function getDevelopmentFallback() {
  return developmentAlphabet.map((letter, index) => ({
    ...letter,
    displayLetter: letter.letter,
    audioUrl: letter.audio,
    order: index + 1,
    isPublished: true
  }));
}

export default function Alphabet() {
  const { user } = useUser();
  const [letters, setLetters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAlphabet = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await getPublicAlphabet();
      setLetters(data.letters || []);
    } catch {
      if (process.env.NODE_ENV === "development") {
        setLetters(getDevelopmentFallback());
        setError("Backend недоступен. Показан локальный список для разработки.");
      } else {
        setLetters([]);
        setError("Не удалось загрузить алфавит");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAlphabet();
  }, [loadAlphabet]);

  return (
    <PageContainer
      style={{
        background: "#F4F7F2",
        color: "#2D2D2D",
        maxWidth: 480,
        paddingBottom: 112
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
        <AppIcon icon={Type} size={30} />
      </div>

      <SectionTitle
        title="Алфавит"
        subtitle="Нажми на кнопку звука, чтобы услышать произношение."
      />

      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 18 }}>
          {Array.from({ length: 9 }, (_, index) => (
            <div
              key={index}
              style={{ minHeight: 104, borderRadius: 20, background: "#E7EBE4" }}
            />
          ))}
        </div>
      ) : null}

      {error ? (
        <AppCard style={{ marginTop: 18, textAlign: "center" }}>
          <div style={{ fontWeight: 900 }}>{error}</div>
          {letters.length === 0 ? (
            <div style={{ marginTop: 12 }}>
              <AppButton onClick={loadAlphabet} variant="secondary">
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <AppIcon icon={RefreshCw} size={18} />
                  Повторить
                </span>
              </AppButton>
            </div>
          ) : null}
        </AppCard>
      ) : null}

      {!isLoading && !error && letters.length === 0 ? (
        <AppCard style={{ marginTop: 18, textAlign: "center", fontWeight: 900 }}>
          Алфавит пока не заполнен
        </AppCard>
      ) : null}

      {!isLoading && letters.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(92px, 1fr))",
            gap: 12,
            marginTop: 18
          }}
        >
          {letters.map(letter => (
            <div
              key={letter.id}
              style={{
                minHeight: 112,
                padding: "14px 8px 12px",
                borderRadius: 20,
                border: "2px solid #E6E6E6",
                background: "#FFFFFF",
                color: "#4B4B4B",
                boxShadow: "0 5px 0 #D9D9D9",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                textAlign: "center"
              }}
            >
              <div>
                <div style={{ fontSize: 30, lineHeight: 1, fontWeight: 900 }}>
                  {letter.displayLetter || letter.letter}
                </div>
                {letter.name && letter.name !== letter.displayLetter ? (
                  <div style={{ marginTop: 5, color: "#777", fontSize: 12, fontWeight: 800 }}>
                    {letter.name}
                  </div>
                ) : null}
              </div>

              {letter.audioUrl ? (
                <AudioPlayButton
                  src={letter.audioUrl}
                  size={38}
                  label={`Слушать букву ${letter.name || letter.letter}`}
                  disabled={user?.soundEnabled === false}
                  variant="soft"
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <BottomNav />
    </PageContainer>
  );
}

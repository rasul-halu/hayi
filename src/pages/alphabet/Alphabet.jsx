import { useEffect, useState } from "react";
import { Type, Volume2 } from "lucide-react";
import BottomNav from "../../components/layout/BottomNav";
import AppCard from "../../components/ui/AppCard";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";
import { useUser } from "../../context/UserContext";
import { alphabetLetters } from "../../data/alphabetData";
import { playAudioFile } from "../../utils/soundEffects";

const ACTIVE_TIMEOUT = 650;

export default function Alphabet() {
  const { user } = useUser();
  const [activeLetterId, setActiveLetterId] = useState(null);

  useEffect(() => {
    if (!activeLetterId) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setActiveLetterId(null);
    }, ACTIVE_TIMEOUT);

    return () => clearTimeout(timeoutId);
  }, [activeLetterId]);

  const activeLetter =
    alphabetLetters.find(letter =>
      letter.id === activeLetterId
    );

  const handleLetterClick = (letter) => {
    setActiveLetterId(letter.id);
    playAudioFile(letter.audio, user.soundEnabled);
  };

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
        subtitle="Нажми на букву, чтобы услышать произношение."
      />

      <AppCard
        style={{
          minHeight: 54,
          marginTop: 16,
          padding: "12px 14px",
          borderRadius: 18,
          background: activeLetter ? "#E9F8DD" : "#FFFFFF",
          color: activeLetter ? "#46A400" : "#6F746B",
          border: `2px solid ${activeLetter ? "#BFE8A7" : "#E6E6E6"}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontWeight: 900,
          boxShadow: activeLetter ? "0 5px 0 #BFE8A7" : "0 5px 0 #D9D9D9"
        }}
      >
        <AppIcon
          icon={Volume2}
          size={21}
          color={activeLetter ? "#46A400" : "#8A8A8A"}
        />
        {activeLetter
          ? `Слушаем: ${activeLetter.letter}`
          : "Выбери букву"}
      </AppCard>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(72px, 1fr))",
          gap: 12,
          marginTop: 18
        }}
      >
        {alphabetLetters.map(letter => {
          const active = activeLetterId === letter.id;

          return (
            <button
              key={letter.id}
              type="button"
              onClick={() => handleLetterClick(letter)}
              style={{
                minHeight: 76,
                padding: "12px 8px",
                borderRadius: 20,
                border: active ? "3px solid #46A400" : "2px solid #E6E6E6",
                background: active ? "#D7FFB8" : "#FFFFFF",
                color: "#4B4B4B",
                boxShadow: active ? "0 5px 0 #46A400" : "0 5px 0 #D9D9D9",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                cursor: "pointer",
                transition:
                  "background 160ms ease, border-color 160ms ease, box-shadow 160ms ease"
              }}
              aria-label={`Слушать букву ${letter.name}`}
            >
              <span
                style={{
                  fontSize: 30,
                  lineHeight: 1,
                  fontWeight: 900
                }}
              >
                {letter.letter}
              </span>

              <span
                style={{
                  color: "#777",
                  fontSize: 12,
                  fontWeight: 800
                }}
              >
                {letter.name}
              </span>
            </button>
          );
        })}
      </div>

      <BottomNav />
    </PageContainer>
  );
}

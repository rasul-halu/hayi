import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import BottomNav from "../../components/layout/BottomNav";
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
        maxWidth: 480,
        paddingBottom: 112
      }}
    >
      <SectionTitle
        title="Алфавит"
        subtitle="Нажми на букву, чтобы услышать произношение."
      />

      <div
        style={{
          minHeight: 42,
          marginTop: 16,
          padding: "10px 12px",
          borderRadius: 16,
          background: activeLetter
            ? "#E9F8DD"
            : "#5A5A5A",
          color: activeLetter
            ? "#46A400"
            : "#D9D9D9",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontWeight: "900",
          boxShadow: activeLetter
            ? "0 4px 0 #46A400"
            : "0 4px 0 rgba(0,0,0,0.18)"
        }}
      >
        <AppIcon
          icon={Volume2}
          size={20}
          color={activeLetter ? "#46A400" : "#BDBDBD"}
        />
        {activeLetter
          ? `Слушаем: ${activeLetter.letter}`
          : "Выбери букву"}
      </div>

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
                border: active
                  ? "3px solid #46A400"
                  : "2px solid #E6E6E6",
                background: active
                  ? "#D7FFB8"
                  : "#FFFFFF",
                color: "#4B4B4B",
                boxShadow: active
                  ? "0 5px 0 #46A400"
                  : "0 5px 0 #D9D9D9",
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
                  fontWeight: "900"
                }}
              >
                {letter.letter}
              </span>

              <span
                style={{
                  color: "#777",
                  fontSize: 12,
                  fontWeight: "800"
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

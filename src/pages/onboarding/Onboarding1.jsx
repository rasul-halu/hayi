import {
  CheckCircle2,
  Play
} from "lucide-react";
import OnboardingShell from "../../components/onboarding/OnboardingShell";
import AppIcon from "../../components/ui/AppIcon";
import mascot from "../../assets/mascot/main-mascot.png";

const words = [
  {
    lezgi: "Салам",
    russian: "Привет"
  },
  {
    lezgi: "Чухсагъул",
    russian: "Спасибо"
  },
  {
    lezgi: "Сагърай",
    russian: "До свидания"
  }
];

function LessonPreview() {
  return (
    <div
      style={{
        width: "100%",
        display: "grid",
        gap: 14
      }}
    >
      <img
        src={mascot}
        alt="Маскот Хайи"
        style={{
          width: 142,
          height: 142,
          objectFit: "contain",
          margin: "0 auto"
        }}
      />

      <div
        style={{
          display: "grid",
          gap: 10
        }}
      >
        {words.map((word, index) => (
          <div
            key={word.lezgi}
            style={{
              padding: "12px 14px",
              borderRadius: 18,
              background: index === 0 ? "#E9F8DD" : "#F7F8F5",
              border: index === 0 ? "2px solid #58CC02" : "2px solid #E6E6E6",
              boxShadow: index === 0 ? "0 4px 0 #46A400" : "0 4px 0 #D9D9D9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              fontWeight: 900
            }}
          >
            <span
              style={{
                minWidth: 0,
                display: "grid",
                gap: 2
              }}
            >
              <span
                style={{
                  fontSize: word.lezgi.length > 8 ? 17 : 19,
                  lineHeight: 1.15,
                  overflowWrap: "anywhere"
                }}
              >
                {word.lezgi}
              </span>
              <span
                style={{
                  color: "#777",
                  fontSize: 12,
                  fontWeight: 800
                }}
              >
                {word.russian}
              </span>
            </span>

            <AppIcon
              icon={index === 0 ? CheckCircle2 : Play}
              size={20}
              color={index === 0 ? "#46A400" : "#BDBDBD"}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Onboarding1() {
  return (
    <OnboardingShell
      activeIndex={0}
      title="Учи язык маленькими шагами"
      text="Проходи короткие уроки каждый день и постепенно запоминай слова и фразы."
      visual={<LessonPreview />}
      nextPath="/onboarding-2"
      primaryLabel="Далее"
    />
  );
}

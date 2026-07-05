import {
  CheckCircle2,
  Play
} from "lucide-react";
import OnboardingShell from "../../components/onboarding/OnboardingShell";
import AppIcon from "../../components/ui/AppIcon";
import mascot from "../../assets/mascot/main-mascot.png";

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
          width: 150,
          height: 150,
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
        {["Салам", "Рахмат", "Хайыр"].map((word, index) => (
          <div
            key={word}
            style={{
              padding: "12px 14px",
              borderRadius: 18,
              background: index === 0 ? "#D7FFB8" : "#F7F7F7",
              border: index === 0
                ? "2px solid #58CC02"
                : "2px solid #E6E6E6",
              boxShadow: index === 0
                ? "0 4px 0 #46A400"
                : "0 4px 0 #D9D9D9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontWeight: "900"
            }}
          >
            {word}
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

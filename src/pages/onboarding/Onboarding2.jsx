import {
  Blocks,
  Headphones,
  Languages,
  MessageSquareText
} from "lucide-react";
import OnboardingShell from "../../components/onboarding/OnboardingShell";
import AppIcon from "../../components/ui/AppIcon";

const items = [
  {
    icon: Headphones,
    title: "Звуки",
    color: "#2F80ED"
  },
  {
    icon: Languages,
    title: "Слова",
    color: "#8B5CF6"
  },
  {
    icon: Blocks,
    title: "Пары",
    color: "#FFD43B"
  },
  {
    icon: MessageSquareText,
    title: "Фразы",
    color: "#FF9600"
  }
];

function PracticePreview() {
  return (
    <div
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 14
      }}
    >
      {items.map(item => (
        <div
          key={item.title}
          style={{
            minHeight: 104,
            borderRadius: 22,
            background: "#F7F8F5",
            border: "2px solid #E6E6E6",
            boxShadow: "0 5px 0 #D9D9D9",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontWeight: 900
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <AppIcon icon={item.icon} size={27} color={item.color} />
          </div>
          {item.title}
        </div>
      ))}
    </div>
  );
}

export default function Onboarding2() {
  return (
    <OnboardingShell
      activeIndex={1}
      title="Тренируй слова, звуки и предложения"
      text="Слушай произношение, собирай фразы и повторяй ошибки."
      visual={<PracticePreview />}
      nextPath="/onboarding-3"
      primaryLabel="Далее"
    />
  );
}

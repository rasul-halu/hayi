import {
  Check,
  Flame,
  Lock,
  Star,
  Trophy
} from "lucide-react";
import OnboardingShell from "../../components/onboarding/OnboardingShell";
import AppIcon from "../../components/ui/AppIcon";

function ProgressPreview() {
  return (
    <div
      style={{
        width: "100%",
        display: "grid",
        gap: 18
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10
        }}
      >
        <Badge icon={Flame} value="7" label="серия" color="#FF9600" />
        <Badge icon={Star} value="120" label="XP" color="#FFD43B" />
        <Badge icon={Trophy} value="5" label="уроков" color="#58CC02" />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          padding: "8px 4px"
        }}
      >
        <LessonCircle icon={Check} active color="#58CC02" />
        <Connector />
        <LessonCircle icon={Check} active color="#58CC02" />
        <Connector />
        <LessonCircle icon={Flame} active color="#FFD43B" dark />
        <Connector muted />
        <LessonCircle icon={Lock} color="#BDBDBD" />
      </div>
    </div>
  );
}

function Badge({
  icon,
  value,
  label,
  color
}) {
  return (
    <div
      style={{
        padding: "12px 8px",
        borderRadius: 18,
        background: "#F7F8F5",
        border: "2px solid #E6E6E6",
        boxShadow: "0 4px 0 #D9D9D9",
        display: "grid",
        justifyItems: "center",
        gap: 5,
        fontWeight: 900
      }}
    >
      <AppIcon icon={icon} size={24} color={color} />
      <span>{value}</span>
      <span
        style={{
          color: "#777",
          fontSize: 11
        }}
      >
        {label}
      </span>
    </div>
  );
}

function LessonCircle({
  icon,
  active = false,
  color,
  dark = false
}) {
  return (
    <div
      style={{
        width: 54,
        height: 54,
        borderRadius: "50%",
        background: active ? color : "#EFEFEF",
        color: dark ? "#4B4B4B" : active ? "#FFFFFF" : "#777",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: active ? "0 5px 0 rgba(0,0,0,0.18)" : "0 5px 0 #D9D9D9"
      }}
    >
      <AppIcon icon={icon} size={24} />
    </div>
  );
}

function Connector({
  muted = false
}) {
  return (
    <div
      style={{
        flex: 1,
        height: 5,
        borderRadius: 999,
        background: muted ? "#E6E6E6" : "#58CC02"
      }}
    />
  );
}

export default function Onboarding3() {
  return (
    <OnboardingShell
      activeIndex={2}
      title="Сохраняй серию и открывай уроки"
      text="Зарабатывай XP, береги сердца и двигайся по пути обучения."
      visual={<ProgressPreview />}
      nextPath="/login"
      primaryLabel="Начать обучение"
      showSkip={false}
    />
  );
}

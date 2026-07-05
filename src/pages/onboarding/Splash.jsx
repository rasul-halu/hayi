import {
  Flame,
  Heart,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import AppIcon from "../../components/ui/AppIcon";
import mascot from "../../assets/mascot/main-mascot.png";

function MiniStat({
  icon,
  label,
  color
}) {
  return (
    <div
      style={{
        minWidth: 0,
        padding: "10px 12px",
        borderRadius: 18,
        background: "#FFFFFF",
        color: "#4B4B4B",
        border: "2px solid #E6E6E6",
        boxShadow: "0 5px 0 #D9D9D9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        fontSize: 13,
        fontWeight: "900",
        whiteSpace: "nowrap"
      }}
    >
      <AppIcon icon={icon} size={17} color={color} />
      {label}
    </div>
  );
}

export default function Splash() {
  const navigate = useNavigate();

  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        maxWidth: 480,
        margin: "0 auto",
        padding: "24px 18px 28px",
        background: "#4B4B4B",
        color: "#FFFFFF",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          textAlign: "center",
          paddingTop: 20
        }}
      >
        <div
          style={{
            width: 250,
            height: 250,
            margin: "0 auto 18px",
            borderRadius: 36,
            background: "#FFFFFF",
            border: "2px solid #E6E6E6",
            boxShadow: "0 10px 0 #D9D9D9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
          }}
        >
          <img
            src={mascot}
            alt="Маскот Хайи"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding: 12,
              boxSizing: "border-box"
            }}
          />
        </div>

        <h1
          style={{
            margin: 0,
            color: "#58CC02",
            fontSize: 56,
            lineHeight: 1,
            fontWeight: "900",
            letterSpacing: 0
          }}
        >
          Хайи
        </h1>

        <p
          style={{
            margin: "12px auto 0",
            maxWidth: 330,
            color: "#FFFFFF",
            fontSize: 22,
            lineHeight: 1.2,
            fontWeight: "900"
          }}
        >
          Изучай лезгинский легко
        </p>

        <p
          style={{
            margin: "10px auto 0",
            maxWidth: 330,
            color: "#D9D9D9",
            fontSize: 15,
            lineHeight: 1.45,
            fontWeight: "700"
          }}
        >
          Короткие уроки, серия дней и игровые задания
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: 18
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8
          }}
        >
          <MiniStat icon={Flame} label="серия" color="#FF9600" />
          <MiniStat icon={Star} label="XP" color="#FFD43B" />
          <MiniStat icon={Heart} label="сердца" color="#FF4D4D" />
        </div>

        <AppButton
          onClick={() => navigate("/onboarding-1")}
          style={{
            minHeight: 62,
            borderRadius: 22,
            fontSize: 19
          }}
        >
          Начать
        </AppButton>
      </div>
    </main>
  );
}

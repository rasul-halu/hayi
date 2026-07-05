import { useState } from "react";
import {
  Check,
  Circle,
  Flame
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";
import streakMascot from "../../assets/mascot/streak-mascot.png";
import { useUser } from "../../context/UserContext";

function getWeekDays(todayLessonCompleted) {
  return Array.from({ length: 7 }, (_, index) => {
    if (index < 6) {
      return {
        label: index + 1,
        icon: Check,
        color: "#58CC02"
      };
    }

    return {
      label: 7,
      icon: todayLessonCompleted
        ? Flame
        : Circle,
      color: todayLessonCompleted
        ? "#FF9600"
        : "#BDBDBD"
    };
  });
}

export default function DailyStreak() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [mascotFailed, setMascotFailed] = useState(false);

  const weekDays =
    getWeekDays(user.todayLessonCompleted);

  return (
    <PageContainer
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      }}
    >
      <AppCard
        style={{
          textAlign: "center",
          padding: 26
        }}
      >
        <div
          style={{
            width: 190,
            height: 190,
            margin: "0 auto 18px",
            borderRadius: "50%",
            background: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            boxShadow: "0 8px 0 #D9D9D9"
          }}
        >
          {!mascotFailed ? (
            <img
              src={streakMascot}
              alt="Маскот серии"
              onError={() => setMascotFailed(true)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain"
              }}
            />
          ) : (
            <AppIcon icon={Flame} size={78} color="#FF9600" />
          )}
        </div>

        <h1
          style={{
            margin: 0,
            color: "#58CC02",
            fontSize: 34,
            fontWeight: "900"
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10
            }}
          >
            <AppIcon icon={Flame} size={34} color="#FF9600" />
            {user.streak} дней подряд
          </span>
        </h1>

        <p
          style={{
            margin: "10px 0 0",
            color: "#D9D9D9",
            fontWeight: "800"
          }}
        >
          Лучшая серия: {user.longestStreak}
        </p>
      </AppCard>

      <AppCard
        style={{
          marginTop: 18
        }}
      >
        <SectionTitle
          title="Сегодня"
          subtitle={
            user.todayLessonCompleted
              ? "Сегодняшний урок выполнен"
              : "Пройди урок сегодня, чтобы сохранить серию"
          }
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 8,
            marginTop: 18
          }}
        >
          {weekDays.map(day => (
            <div
              key={day.label}
              style={{
                minHeight: 52,
                borderRadius: 14,
                background: "#FFFFFF",
                color: "#4B4B4B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: "900",
                boxShadow: "0 4px 0 #D9D9D9"
              }}
            >
              <AppIcon
                icon={day.icon}
                size={22}
                color={day.color}
              />
            </div>
          ))}
        </div>
      </AppCard>

      <AppButton
        onClick={() => navigate("/home")}
        style={{
          marginTop: 24
        }}
      >
        Продолжить
      </AppButton>
    </PageContainer>
  );
}

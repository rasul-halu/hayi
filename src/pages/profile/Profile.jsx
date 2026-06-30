import {
  BookOpenCheck,
  Flame,
  Heart,
  Medal,
  Star,
  Trophy
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav";
import StatItem from "../../components/profile/StatItem";
import AppButton from "../../components/ui/AppButton";
import AppIcon from "../../components/ui/AppIcon";
import { useUser } from "../../context/UserContext";

export default function Profile() {
  const { user } = useUser();
  const navigate = useNavigate();
  const completedLessonCount =
    Array.isArray(user.completedLessonIds)
      ? user.completedLessonIds.length
      : 0;

  return (
    <div
      style={{
        padding: 20,
        paddingBottom: 100
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center"
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "#666",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          avatar
        </div>
      </div>

      <h2
        style={{
          textAlign: "center",
          marginTop: 20
        }}
      >
        {user.username}
      </h2>

      <div
        style={{
          marginTop: 30
        }}
      >
        <StatItem
          icon={<AppIcon icon={Star} size={22} color="#FFD43B" />}
          value={`${user.xp} XP`}
          label="Получено опыта"
        />

        <StatItem
          icon={<AppIcon icon={Heart} size={22} color="#FF4D4D" />}
          value={user.hearts}
          label="Сердец"
        />

        <StatItem
          icon={<AppIcon icon={Flame} size={22} color="#FF9600" />}
          value={user.streak}
          label="Дней подряд"
        />

        <StatItem
          icon={<AppIcon icon={Trophy} size={22} color="#FFD43B" />}
          value={user.longestStreak}
          label="Лучшая серия"
        />

        <StatItem
          icon={<AppIcon icon={BookOpenCheck} size={22} color="#58CC02" />}
          value={completedLessonCount}
          label="Уроков завершено"
        />
      </div>

      <h2
        style={{
          marginTop: 30
        }}
      >
        Достижения
      </h2>

      <div
        style={{
          background: "#5A5A5A",
          borderRadius: 18,
          padding: 20,
          marginTop: 12,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 12
        }}
      >
        <AppIcon icon={Medal} size={26} color="#FFD43B" />
        <span>Открывай награды за уроки, XP и серию.</span>
      </div>

      <AppButton
        onClick={() => navigate("/achievements")}
        style={{
          marginTop: 12
        }}
      >
        Смотреть достижения
      </AppButton>

      <button
        style={{
          width: "100%",
          marginTop: 30,
          padding: 16,
          background: "#FF4D4D",
          border: "none",
          borderRadius: 18,
          color: "#fff",
          fontWeight: "bold"
        }}
      >
        Выйти
      </button>

      <BottomNav />
    </div>
  );
}

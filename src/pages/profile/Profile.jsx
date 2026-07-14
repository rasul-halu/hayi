import {
  BookOpenCheck,
  Flame,
  Heart,
  Medal,
  Settings,
  Star,
  Trophy,
  UserRound,
  Volume2,
  VolumeX
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import StatPill from "../../components/ui/StatPill";
import { useUser } from "../../context/UserContext";
import { getUserInitials } from "../../utils/userAvatar";

export default function Profile() {
  const { user, toggleSound } = useUser();
  const navigate = useNavigate();
  const completedLessonCount = Array.isArray(user.completedLessonIds)
    ? user.completedLessonIds.length
    : 0;
  const achievementCount = Array.isArray(user.unlockedAchievementIds)
    ? user.unlockedAchievementIds.length
    : 0;
  const initials = getUserInitials(user);
  const displayName =
    user.displayName ||
    user.firstName ||
    user.username ||
    "Гость";

  return (
    <PageContainer
      style={{
        background: "#F4F7F2",
        color: "#2D2D2D"
      }}
    >
      <AppCard
        style={{
          background: "linear-gradient(135deg, #FFFFFF 0%, #E9F8DD 100%)",
          color: "#2D2D2D",
          border: "2px solid #DDEED4",
          boxShadow: "0 7px 0 #CFE2C4",
          textAlign: "center"
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: 118,
              height: 118,
              borderRadius: 30,
              background: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              color: "#4B4B4B",
              fontSize: 42,
              fontWeight: 900,
              boxShadow: "0 7px 0 #D9D9D9"
            }}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            ) : initials ? (
              initials
            ) : (
              <AppIcon icon={UserRound} size={44} />
            )}
          </div>
        </div>

        <h1
          style={{
            margin: "18px 0 4px",
            fontSize: 30,
            fontWeight: 900
          }}
        >
          {displayName}
        </h1>
        {user.username ? (
          <p
            style={{
              margin: 0,
              color: "#6F746B",
              fontWeight: 800
            }}
          >
            @{user.username}
          </p>
        ) : null}
      </AppCard>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 10,
          marginTop: 16
        }}
      >
        <StatPill
          icon={<AppIcon icon={Star} size={18} color="#FFD43B" />}
          value={`${user.xp} XP`}
          label="опыт"
        />
        <StatPill
          icon={<AppIcon icon={Heart} size={18} color="#FF4D4D" />}
          value={user.hearts}
          label="сердца"
        />
        <StatPill
          icon={<AppIcon icon={Flame} size={18} color="#FF9600" />}
          value={user.streak}
          label="серия"
        />
        <StatPill
          icon={<AppIcon icon={Trophy} size={18} color="#FFD43B" />}
          value={user.longestStreak}
          label="лучшая"
        />
        <StatPill
          icon={<AppIcon icon={BookOpenCheck} size={18} color="#58CC02" />}
          value={completedLessonCount}
          label="уроки"
        />
        <StatPill
          icon={<AppIcon icon={Medal} size={18} color="#8B5CF6" />}
          value={achievementCount}
          label="награды"
        />
      </div>

      <AppCard
        style={{
          marginTop: 18,
          background: "#FFFFFF",
          color: "#2D2D2D",
          border: "2px solid #E6E6E6",
          boxShadow: "0 6px 0 #D9D9D9"
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <AppIcon icon={Settings} size={22} color="#58CC02" />
          Настройки
        </h2>

        <button
          type="button"
          onClick={toggleSound}
          style={{
            width: "100%",
            marginTop: 14,
            padding: 16,
            borderRadius: 18,
            border: "2px solid #E6E6E6",
            background: "#F8FAF6",
            color: "#2D2D2D",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            boxShadow: "0 4px 0 #D9D9D9",
            fontWeight: 900,
            cursor: "pointer"
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10
            }}
          >
            <AppIcon
              icon={user.soundEnabled ? Volume2 : VolumeX}
              size={22}
              color={user.soundEnabled ? "#58CC02" : "#BDBDBD"}
            />
            Звуки
          </span>

          <span
            style={{
              minWidth: 76,
              padding: "6px 10px",
              borderRadius: 999,
              background: user.soundEnabled ? "#E9F8DD" : "#E7E7E7",
              color: user.soundEnabled ? "#46A400" : "#777",
              fontSize: 13,
              textAlign: "center"
            }}
          >
            {user.soundEnabled ? "Вкл" : "Выкл"}
          </span>
        </button>
      </AppCard>

      <AppCard
        style={{
          marginTop: 18,
          background: "#FFFFFF",
          color: "#2D2D2D",
          border: "2px solid #E6E6E6",
          boxShadow: "0 6px 0 #D9D9D9"
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 900,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <AppIcon icon={Medal} size={24} color="#FFD43B" />
          Достижения
        </h2>
        <p
          style={{
            margin: "8px 0 14px",
            color: "#6F746B",
            fontWeight: 800,
            lineHeight: 1.4
          }}
        >
          Открывай награды за уроки, XP и серию.
        </p>
        <AppButton onClick={() => navigate("/achievements")}>
          Смотреть достижения
        </AppButton>
      </AppCard>

      {user.role === "ADMIN" ? (
        <AppButton
          onClick={() => navigate("/admin")}
          variant="yellow"
          style={{ marginTop: 18 }}
        >
          Админка
        </AppButton>
      ) : null}

      <button
        type="button"
        style={{
          width: "100%",
          marginTop: 18,
          padding: 16,
          background: "#FFFFFF",
          border: "2px solid #FFD0D0",
          borderRadius: 18,
          color: "#D93B3B",
          fontWeight: 900,
          boxShadow: "0 5px 0 #F0B8B8"
        }}
      >
        Выйти
      </button>

      <BottomNav />
    </PageContainer>
  );
}

import { Medal, RefreshCw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import AchievementCard from "../../components/achievements/AchievementCard";
import BottomNav from "../../components/layout/BottomNav";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";
import {
  getAchievements,
  hasTelegramAuthData
} from "../../api/apiClient";
import { achievements as mockAchievements } from "../../data/mockAchievements";
import { useUser } from "../../context/UserContext";
import { playAchievementSound } from "../../utils/soundEffects";

function hydrateDemoAchievement(achievement, user) {
  const completedLessonCount =
    Array.isArray(user.completedLessonIds)
      ? user.completedLessonIds.length
      : 0;

  if (achievement.id === "first-lesson") {
    return {
      ...achievement,
      progress: Math.min(completedLessonCount, 1),
      unlocked: completedLessonCount >= 1
    };
  }

  if (achievement.id === "three-day-streak") {
    return {
      ...achievement,
      progress: Math.min(user.streak || 0, 3),
      unlocked: (user.streak || 0) >= 3
    };
  }

  if (achievement.id === "hundred-xp") {
    return {
      ...achievement,
      progress: Math.min(user.xp || 0, 100),
      unlocked: (user.xp || 0) >= 100
    };
  }

  if (achievement.id === "five-lessons") {
    return {
      ...achievement,
      progress: Math.min(completedLessonCount, 5),
      unlocked: completedLessonCount >= 5
    };
  }

  return achievement;
}

export default function Achievements() {
  const {
    syncStatsFromServer,
    user
  } = useUser();
  const isTelegramMode = hasTelegramAuthData();
  const [achievements, setAchievements] = useState([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState([]);
  const [isLoading, setIsLoading] = useState(isTelegramMode);
  const [error, setError] = useState("");
  const demoUser = useMemo(() => ({
    completedLessonIds: user.completedLessonIds,
    streak: user.streak,
    xp: user.xp
  }), [
    user.completedLessonIds,
    user.streak,
    user.xp
  ]);

  const loadAchievements = useCallback(async () => {
    if (!isTelegramMode) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await getAchievements();
      setAchievements(data.achievements || []);
      setNewlyUnlocked(data.newlyUnlocked || []);
      syncStatsFromServer(data.stats);

      if (data.newlyUnlocked?.length > 0) {
        playAchievementSound(user.soundEnabled);
      }
    } catch (loadError) {
      setError("Не удалось загрузить достижения");

      if (process.env.NODE_ENV === "development") {
        console.warn("Achievements loading failed:", loadError.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    isTelegramMode,
    syncStatsFromServer,
    user.soundEnabled
  ]);

  useEffect(() => {
    void loadAchievements();
  }, [loadAchievements]);

  useEffect(() => {
    if (isTelegramMode) {
      return;
    }

    setAchievements(
      mockAchievements.map(achievement =>
        hydrateDemoAchievement(achievement, demoUser)
      )
    );
  }, [
    demoUser,
    isTelegramMode
  ]);

  const firstUnlocked = newlyUnlocked[0];
  const extraUnlockedCount = Math.max(newlyUnlocked.length - 1, 0);

  return (
    <PageContainer
      style={{
        background: "#F4F7F2",
        color: "#2D2D2D"
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 18,
          background: "#FFF1D6",
          color: "#D6A600",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 5px 0 #E9D4A9",
          marginBottom: 14
        }}
      >
        <AppIcon icon={Medal} size={30} />
      </div>

      <SectionTitle
        title="Достижения"
        subtitle={
          isTelegramMode
            ? "Награды за прогресс, серию и активность"
            : "Награды по твоему локальному прогрессу"
        }
      />

      {!isTelegramMode ? (
        <AppCard
          style={{
            marginTop: 18,
            background: "#FFFFFF",
            color: "#2D2D2D",
            border: "2px solid #E6E6E6",
            boxShadow: "0 6px 0 #D9D9D9",
            fontWeight: 900
          }}
        >
          Прогресс считается на этом устройстве.
        </AppCard>
      ) : null}

      {firstUnlocked ? (
        <AppCard
          style={{
            marginTop: 18,
            background: "#E9F8DD",
            color: "#4B4B4B",
            borderColor: "#58CC02",
            boxShadow: "0 6px 0 #46A400"
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <AppIcon icon={Sparkles} size={24} color="#58CC02" />
            <div>
              <div style={{ fontWeight: 900 }}>Новое достижение!</div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#555"
                }}
              >
                {firstUnlocked.title}
                {firstUnlocked.xpReward ? ` · +${firstUnlocked.xpReward} XP` : ""}
                {extraUnlockedCount > 0 ? ` · и ещё ${extraUnlockedCount}` : ""}
              </div>
            </div>
          </div>
        </AppCard>
      ) : null}

      {isLoading ? (
        <AppCard
          style={{
            marginTop: 18,
            background: "#FFFFFF",
            color: "#2D2D2D",
            border: "2px solid #E6E6E6",
            textAlign: "center",
            fontWeight: 900
          }}
        >
          Загружаем достижения...
        </AppCard>
      ) : null}

      {error ? (
        <AppCard
          style={{
            marginTop: 18,
            background: "#FFFFFF",
            color: "#2D2D2D",
            border: "2px solid #E6E6E6",
            textAlign: "center"
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 12 }}>
            {error}
          </div>

          <AppButton onClick={loadAchievements} variant="secondary">
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8
              }}
            >
              <AppIcon icon={RefreshCw} size={18} />
              Повторить
            </span>
          </AppButton>
        </AppCard>
      ) : null}

      {!isLoading && !error && achievements.length === 0 ? (
        <AppCard
          style={{
            marginTop: 18,
            background: "#FFFFFF",
            color: "#2D2D2D",
            border: "2px solid #E6E6E6",
            textAlign: "center",
            fontWeight: 900
          }}
        >
          Достижения пока недоступны
        </AppCard>
      ) : null}

      <div style={{ marginTop: 18 }}>
        {achievements.map(achievement => (
          <AchievementCard
            key={achievement.key || achievement.id}
            achievement={achievement}
          />
        ))}
      </div>

      <BottomNav />
    </PageContainer>
  );
}

import { Medal } from "lucide-react";
import AchievementCard from "../../components/achievements/AchievementCard";
import BottomNav from "../../components/layout/BottomNav";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";
import { achievements } from "../../data/mockAchievements";
import { useUser } from "../../context/UserContext";

function hydrateAchievement(achievement, user) {
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
  const { user } = useUser();

  const hydratedAchievements =
    achievements.map(achievement =>
      hydrateAchievement(achievement, user)
    );

  return (
    <PageContainer>
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 16,
          background: "#FFD43B",
          color: "#4B4B4B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 5px 0 #E0B900",
          marginBottom: 14
        }}
      >
        <AppIcon icon={Medal} size={30} />
      </div>

      <SectionTitle
        title="Достижения"
        subtitle="Награды за прогресс, серию и активность"
      />

      <div
        style={{
          marginTop: 18
        }}
      >
        {hydratedAchievements.map(achievement => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
          />
        ))}
      </div>

      <BottomNav />
    </PageContainer>
  );
}

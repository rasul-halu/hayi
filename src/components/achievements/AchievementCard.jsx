import { useEffect, useState } from "react";
import {
  Lock,
  Trophy
} from "lucide-react";
import AppCard from "../ui/AppCard";
import AppIcon from "../ui/AppIcon";

export default function AchievementCard({
  achievement
}) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [achievement.image]);

  const showImage = achievement.image && !imageFailed;
  const target = achievement.target || achievement.maxProgress || 0;
  const progress = achievement.progress || 0;
  const progressPercent =
    target > 0
      ? Math.min((progress / target) * 100, 100)
      : 0;

  return (
    <AppCard
      style={{
        marginBottom: 14,
        background: achievement.unlocked ? "#FFFFFF" : "#F2F2F2",
        color: "#4B4B4B",
        border: `2px solid ${achievement.unlocked ? "#E6E6E6" : "#DADADA"}`,
        boxShadow: achievement.unlocked ? "0 5px 0 #D9D9D9" : "0 5px 0 #CFCFCF"
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 14,
          alignItems: "center"
        }}
      >
        <div
          style={{
            width: 84,
            height: 84,
            flexShrink: 0,
            borderRadius: 18,
            background: achievement.unlocked ? "#E9F8DD" : "#E6E6E6",
            border: "2px solid #D9D9D9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            fontSize: 34,
            fontWeight: 900
          }}
        >
          {showImage ? (
            <img
              src={achievement.image}
              alt={achievement.title}
              onError={() => setImageFailed(true)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: 8,
                boxSizing: "border-box"
              }}
            />
          ) : (
            <AppIcon
              icon={achievement.unlocked ? Trophy : Lock}
              size={34}
              color={achievement.unlocked ? "#58CC02" : "#777"}
            />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              alignItems: "center"
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 900
              }}
            >
              {achievement.title}
            </h3>

            <span
              style={{
                color: achievement.unlocked ? "#46A400" : "#777",
                fontSize: 12,
                fontWeight: 900,
                whiteSpace: "nowrap"
              }}
            >
              {achievement.unlocked ? "Открыто" : "Закрыто"}
            </span>
          </div>

          <p
            style={{
              margin: "6px 0 0",
              color: "#777",
              fontSize: 14,
              lineHeight: 1.35,
              fontWeight: 700
            }}
          >
            {achievement.description}
          </p>

          {achievement.xpReward ? (
            <div
              style={{
                marginTop: 8,
                color: "#58CC02",
                fontSize: 13,
                fontWeight: 900
              }}
            >
              +{achievement.xpReward} XP
            </div>
          ) : null}

          <div style={{ marginTop: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "#4B4B4B",
                fontSize: 12,
                fontWeight: 900
              }}
            >
              <span>Прогресс</span>
              <span>{progress}/{target}</span>
            </div>

            <div
              style={{
                height: 10,
                marginTop: 6,
                borderRadius: 999,
                background: "#D9D9D9",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: achievement.unlocked ? "#58CC02" : "#FFD43B"
                }}
              />
            </div>
          </div>

          {achievement.unlocked && achievement.unlockedAt ? (
            <div
              style={{
                marginTop: 8,
                color: "#777",
                fontSize: 12,
                fontWeight: 800
              }}
            >
              {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          ) : null}
        </div>
      </div>
    </AppCard>
  );
}

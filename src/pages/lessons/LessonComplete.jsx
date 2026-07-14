import { useEffect, useRef } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  Sparkles,
  Star
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { getLessonById } from "../../data/courseHelpers";
import { useUser } from "../../context/UserContext";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import { playLessonCompleteSound } from "../../utils/soundEffects";

const DEFAULT_XP_REWARD = 10;

export default function LessonComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const didComplete = useRef(false);
  const { user, completeLessonWithSync } = useUser();
  const queryLessonId = new URLSearchParams(location.search).get("lessonId");
  const lessonId = location.state?.lessonId || queryLessonId;
  const lesson = getLessonById(lessonId);
  const xpReward =
    location.state?.xpReward ??
    lesson?.xpReward ??
    DEFAULT_XP_REWARD;

  useEffect(() => {
    if (!lessonId || didComplete.current) {
      return;
    }

    didComplete.current = true;
    void completeLessonWithSync(lessonId, xpReward);
    playLessonCompleteSound(user.soundEnabled);
  }, [
    completeLessonWithSync,
    lessonId,
    user.soundEnabled,
    xpReward
  ]);

  return (
    <PageContainer
      style={{
        background: "#F4F7F2",
        color: "#2D2D2D",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        textAlign: "center"
      }}
    >
      <AppCard
        style={{
          overflow: "hidden",
          padding: 24,
          background:
            "linear-gradient(135deg, #FFFFFF 0%, #E9F8DD 58%, #FFF1C8 100%)",
          color: "#2D2D2D",
          border: "2px solid #DDEED4",
          boxShadow: "0 8px 0 #CFE2C4"
        }}
      >
        <div
          style={{
            width: 156,
            height: 156,
            margin: "0 auto 20px",
            borderRadius: 36,
            background: "#FFFFFF",
            color: "#4B4B4B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 0 #D9D9D9"
          }}
        >
          <AppIcon
            icon={CheckCircle2}
            size={82}
            color="#58CC02"
            strokeWidth={2.2}
          />
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 999,
            background: "#E9F8DD",
            color: "#46A400",
            fontWeight: 900,
            marginBottom: 12
          }}
        >
          <AppIcon icon={Sparkles} size={16} />
          Урок завершён
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 34,
            fontWeight: 900,
            lineHeight: 1.05
          }}
        >
          Отличная работа!
        </h1>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 10
          }}
        >
          <div
            style={{
              padding: 14,
              borderRadius: 18,
              background: "#FFD43B",
              color: "#4B4B4B",
              fontWeight: 900,
              boxShadow: "0 5px 0 #E0B900"
            }}
          >
            <AppIcon
              icon={Star}
              size={22}
              color="#4B4B4B"
              style={{ margin: "0 auto 6px" }}
            />
            +{xpReward} XP
          </div>

          <div
            style={{
              padding: 14,
              borderRadius: 18,
              background: "#FFF1D6",
              color: "#9A5600",
              fontWeight: 900,
              boxShadow: "0 5px 0 #E9D4A9"
            }}
          >
            <AppIcon
              icon={Flame}
              size={22}
              color="#FF9600"
              style={{ margin: "0 auto 6px" }}
            />
            Серия {user.streak || 0}
          </div>
        </div>

        <p
          style={{
            margin: "18px 0 0",
            color: "#66705F",
            lineHeight: 1.45,
            fontWeight: 800
          }}
        >
          Прогресс сохранён. Если урок уже был пройден раньше, XP повторно не начисляется.
        </p>
      </AppCard>

      <AppButton
        onClick={() => navigate("/home")}
        style={{ marginTop: 24 }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}
        >
          Продолжить
          <AppIcon icon={ArrowRight} size={20} />
        </span>
      </AppButton>
    </PageContainer>
  );
}

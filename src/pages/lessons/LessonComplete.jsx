import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Flame, Star } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { getLessonById } from "../../data/courseHelpers";
import { useUser } from "../../context/UserContext";
import AppButton from "../../components/ui/AppButton";
import AppIcon from "../../components/ui/AppIcon";
import { playLessonCompleteSound } from "../../utils/soundEffects";
import { hasTelegramAuthData } from "../../api/apiClient";
import mascot from "../../assets/mascot/main-mascot.png";
import "./LessonComplete.css";

const DEFAULT_XP_REWARD = 10;

export default function LessonComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const didComplete = useRef(false);
  const { user, completeLessonWithSync } = useUser();
  const queryLessonId = new URLSearchParams(location.search).get("lessonId");
  const lessonId = location.state?.lessonId || queryLessonId;
  const lesson = getLessonById(lessonId);
  const xpReward = location.state?.xpReward ?? lesson?.xpReward ?? DEFAULT_XP_REWARD;
  const wasCompleted = useRef(
    (user.completedLessonIds || []).some(id => String(id) === String(lessonId))
  );
  const [result, setResult] = useState(null);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    if (!lessonId || didComplete.current) return;

    didComplete.current = true;
    const isTelegram = hasTelegramAuthData();
    void completeLessonWithSync(lessonId, xpReward).then(data => {
      if (data) {
        setResult({ xpAwarded: data.xpAwarded, alreadyCompleted: data.alreadyCompleted });
      } else if (!isTelegram) {
        setResult({
          xpAwarded: wasCompleted.current ? 0 : xpReward,
          alreadyCompleted: wasCompleted.current
        });
      } else {
        setSaveFailed(true);
      }
    }).catch(() => setSaveFailed(true));
    playLessonCompleteSound(user.soundEnabled);
  }, [completeLessonWithSync, lessonId, user.soundEnabled, xpReward]);

  const contextText = saveFailed
    ? "Не удалось подтвердить сохранение прогресса."
    : !result
      ? "Сохраняем прогресс..."
      : result.alreadyCompleted
        ? "Урок пройден повторно — XP не начисляется."
        : "Прогресс сохранён.";

  return (
    <main className="lesson-complete">
      <div className="lesson-complete__content">
        <img className="lesson-complete__mascot" src={mascot} alt="Маскот Хайи" />
        <p className="lesson-complete__label">
          <AppIcon icon={CheckCircle2} size={17} />
          Урок завершён
        </p>
        <h1 className="lesson-complete__title">Отличная работа!</h1>
        <div className="lesson-complete__stats" aria-live="polite">
          <div className="lesson-complete__stat">
            <AppIcon icon={Star} size={22} color="#B88715" />
            <span>{result ? `${result.xpAwarded > 0 ? "+" : ""}${result.xpAwarded}` : "—"} XP</span>
          </div>
          <div className="lesson-complete__stat">
            <AppIcon icon={Flame} size={22} color="#E68718" />
            <span>{user.streak > 0 ? `Серия ${user.streak}` : "Начни серию"}</span>
          </div>
        </div>
        <p className="lesson-complete__context" role="status">{contextText}</p>
        <AppButton onClick={() => navigate("/home")}>
          <span className="lesson-complete__continue">
            Продолжить <AppIcon icon={ArrowRight} size={20} />
          </span>
        </AppButton>
      </div>
    </main>
  );
}

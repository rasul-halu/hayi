import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Flame,
  Sparkles,
  Trophy
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../../components/layout/BottomNav";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import streakMascot from "../../assets/mascot/streak-mascot.png";
import { useUser } from "../../context/UserContext";
import {
  formatMonthTitle,
  getActivityDaySet,
  getCurrentMonthDays,
  isSameDay,
  toDateKey
} from "../../utils/streakCalendar";
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  getDayWord,
  isActivityToday,
  normalizeActivityDateKeys,
  pluralizeDays
} from "../../utils/streakUtils";

const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const STREAK_GOALS = [3, 7, 14, 30];

function getNextGoal(streak) {
  return STREAK_GOALS.find(goal => streak < goal) ||
    STREAK_GOALS[STREAK_GOALS.length - 1];
}

function StatTile({
  icon,
  label,
  value,
  accent = "#58CC02"
}) {
  return (
    <div
      style={{
        minWidth: 0,
        flex: 1,
        background: "#FFFFFF",
        border: "2px solid #E6E6E6",
        borderRadius: 18,
        padding: "12px 10px",
        boxShadow: "0 5px 0 #D9D9D9",
        textAlign: "center"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 6,
          color: accent
        }}
      >
        {icon}
      </div>
      <div
        style={{
          color: "#2D2D2D",
          fontSize: 20,
          fontWeight: 900
        }}
      >
        {value}
      </div>
      <div
        style={{
          color: "#777",
          fontSize: 12,
          fontWeight: 800,
          marginTop: 2
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function DailyStreak() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [mascotFailed, setMascotFailed] = useState(false);
  const today = useMemo(() => new Date(), []);
  const activityDateKeys = useMemo(
    () => normalizeActivityDateKeys(user.activityDateKeys || []),
    [user.activityDateKeys]
  );
  const derivedCurrentStreak = useMemo(
    () => calculateCurrentStreak(activityDateKeys, today),
    [activityDateKeys, today]
  );
  const derivedLongestStreak = useMemo(
    () => calculateLongestStreak(activityDateKeys),
    [activityDateKeys]
  );
  const streak = activityDateKeys.length > 0
    ? derivedCurrentStreak
    : Math.max(0, Number(user.streak) || 0);
  const longestStreak = Math.max(
    streak,
    derivedLongestStreak,
    Number(user.longestStreak) || 0
  );
  const todayCompleted =
    isActivityToday(activityDateKeys, today) ||
    Boolean(user.todayLessonCompleted) ||
    isSameDay(user.lastLessonCompletedDate, today);

  const monthCells = useMemo(
    () => getCurrentMonthDays(today),
    [today]
  );

  const activityDays = useMemo(
    () => getActivityDaySet(activityDateKeys),
    [activityDateKeys]
  );

  const nextGoal = getNextGoal(streak);
  const remainingDays = Math.max(0, nextGoal - streak);
  const goalProgress = Math.min(
    100,
    Math.round((streak / nextGoal) * 100)
  );

  if (process.env.NODE_ENV === "development") {
    console.debug("Streak diagnostics", {
      activityDates: activityDateKeys,
      currentStreak: streak,
      longestStreak,
      todayCompleted
    });
  }

  return (
    <PageContainer
      style={{
        background: "#F4F7F2",
        color: "#2D2D2D",
        paddingBottom: 118
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 18
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Назад"
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            border: "2px solid #E3E6DF",
            background: "#FFFFFF",
            color: "#4B4B4B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 0 #D9D9D9",
            cursor: "pointer"
          }}
        >
          <AppIcon icon={ArrowLeft} size={22} />
        </button>

        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 30,
              fontWeight: 900
            }}
          >
            Серия
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              color: "#6F746B",
              fontWeight: 800
            }}
          >
            Учись каждый день и поддерживай огонь
          </p>
        </div>
      </header>

      <AppCard
        style={{
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #FFF0CC 0%, #FFFFFF 55%, #E9F8DD 100%)",
          border: "2px solid #FFE1A6",
          color: "#2D2D2D",
          padding: 22,
          boxShadow: "0 8px 0 #E9D4A9"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18
          }}
        >
          <div
            style={{
              width: 116,
              height: 116,
              borderRadius: 28,
              background: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
              boxShadow: "0 6px 0 rgba(255,150,0,0.22)"
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
              <AppIcon icon={Flame} size={62} color="#FF9600" />
            )}
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 999,
                background: "rgba(255,150,0,0.14)",
                color: "#D66E00",
                fontWeight: 900,
                fontSize: 13
              }}
            >
              <AppIcon icon={Sparkles} size={16} />
              Твоя текущая серия
            </div>

            <h2
              style={{
                margin: "12px 0 4px",
                fontSize: 34,
                lineHeight: 1,
                fontWeight: 900
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10
                }}
              >
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "#FF9600",
                    color: "#FFFFFF",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 0 #D66E00",
                    flexShrink: 0
                  }}
                >
                  <AppIcon icon={Flame} size={23} />
                </span>
                {pluralizeDays(streak)}
              </span>
            </h2>

            <p
              style={{
                margin: 0,
                color: "#5F665A",
                fontWeight: 800,
                lineHeight: 1.35
              }}
            >
              {streak === 0
                ? "Начни серию сегодня"
                : "Огонь держится. Не дай ему погаснуть."}
            </p>
          </div>
        </div>
      </AppCard>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 16
        }}
      >
        <StatTile
          icon={<AppIcon icon={Flame} size={22} color="#FF9600" />}
          label="Текущая"
          value={streak}
          accent="#FF9600"
        />
        <StatTile
          icon={<AppIcon icon={Trophy} size={22} color="#FFD43B" />}
          label="Лучшая"
          value={longestStreak}
          accent="#D6A600"
        />
        <StatTile
          icon={
            <AppIcon
              icon={CheckCircle2}
              size={22}
              color={todayCompleted ? "#58CC02" : "#BDBDBD"}
            />
          }
          label="Сегодня"
          value={todayCompleted ? "Да" : "Нет"}
          accent={todayCompleted ? "#58CC02" : "#BDBDBD"}
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 900
              }}
            >
              {formatMonthTitle(today)}
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                color: "#777",
                fontWeight: 800
              }}
            >
              Дни активности отмечены огнём
            </p>
          </div>
          <AppIcon icon={CalendarDays} size={28} color="#58CC02" />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 7,
            marginTop: 18
          }}
        >
          {WEEK_DAYS.map(day => (
            <div
              key={day}
              style={{
                color: "#8A8A8A",
                fontSize: 12,
                fontWeight: 900,
                textAlign: "center"
              }}
            >
              {day}
            </div>
          ))}

          {monthCells.map(cell => {
            if (cell.type === "empty") {
              return <div key={cell.key} aria-hidden="true" />;
            }

            const isTodayCell = isSameDay(cell.date, today);
            const isFuture = cell.date > today;
            const isActivityDay = activityDays.has(toDateKey(cell.date));
            let background = "#F7F8F5";
            let borderColor = "#ECEFE8";
            let color = "#4B4B4B";

            if (isActivityDay) {
              background = "#FFF1D6";
              borderColor = "#FFB84D";
              color = "#9A5600";
            }

            if (isTodayCell) {
              background = todayCompleted ? "#E9F8DD" : "#FFFFFF";
              borderColor = todayCompleted ? "#58CC02" : "#FF9600";
              color = todayCompleted ? "#46A400" : "#D66E00";
            }

            if (isFuture) {
              background = "#F0F1EE";
              borderColor = "#E4E5E1";
              color = "#A0A0A0";
            }

            return (
              <div
                key={cell.key}
                title={isTodayCell ? "Сегодня" : undefined}
                style={{
                  aspectRatio: "1 / 1",
                  borderRadius: 14,
                  border: `2px solid ${borderColor}`,
                  background,
                  color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 900,
                  position: "relative",
                  boxShadow: isTodayCell
                    ? "0 4px 0 rgba(0,0,0,0.08)"
                    : "none"
                }}
              >
                {cell.day}
                {isActivityDay ? (
                  <span
                    style={{
                      position: "absolute",
                      right: 4,
                      bottom: 2,
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: "#FF9600",
                      color: "#FFFFFF",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <AppIcon icon={Flame} size={9} strokeWidth={3} />
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </AppCard>

      <AppCard
        style={{
          marginTop: 18,
          background: todayCompleted ? "#E9F8DD" : "#FFF7E8",
          color: "#2D2D2D",
          border: `2px solid ${todayCompleted ? "#BFE8A7" : "#FFD9A0"}`,
          boxShadow: `0 6px 0 ${todayCompleted ? "#BFE8A7" : "#E9C58D"}`
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 21,
            fontWeight: 900
          }}
        >
          {todayCompleted
            ? "Отлично! Огонь на сегодня сохранён."
            : "Пройди один урок сегодня, чтобы сохранить серию."}
        </h2>
        <p
          style={{
            margin: "8px 0 16px",
            color: "#646A5F",
            fontWeight: 800,
            lineHeight: 1.4
          }}
        >
          Серия обновляется только после завершения урока, а не при открытии приложения.
        </p>
        <AppButton onClick={() => navigate("/home")}>
          Перейти к урокам
        </AppButton>
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 21,
                fontWeight: 900
              }}
            >
              До следующей цели
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                color: "#777",
                fontWeight: 800
              }}
            >
              {remainingDays === 0
                ? `Серия ${pluralizeDays(nextGoal)} достигнута`
                : `Ещё ${remainingDays} ${getDayWord(remainingDays)} до серии ${nextGoal}`}
            </p>
          </div>
          <AppIcon icon={Trophy} size={28} color="#FFD43B" />
        </div>

        <div
          style={{
            marginTop: 16,
            height: 14,
            borderRadius: 999,
            background: "#E8ECE4",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              width: `${goalProgress}%`,
              height: "100%",
              borderRadius: 999,
              background: "linear-gradient(90deg, #FF9600, #58CC02)",
              transition: "width 220ms ease"
            }}
          />
        </div>
      </AppCard>

      <BottomNav />
    </PageContainer>
  );
}

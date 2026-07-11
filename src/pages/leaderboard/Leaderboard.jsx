import {
  Flame,
  Medal,
  RefreshCw,
  Trophy,
  UserRound
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import BottomNav from "../../components/layout/BottomNav";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";
import {
  getLeaderboard,
  hasTelegramAuthData
} from "../../api/apiClient";
import { leaderboardUsers } from "../../data/mockLeaderboard";
import { useUser } from "../../context/UserContext";

const PERIOD_OPTIONS = [
  {
    value: "daily",
    label: "Сегодня",
    subtitle: "XP, заработанный сегодня"
  },
  {
    value: "weekly",
    label: "Неделя",
    subtitle: "XP с начала недели"
  },
  {
    value: "global",
    label: "За всё время",
    subtitle: "Общий XP за всё время"
  }
];

function getRankColor(rank) {
  if (rank === 1) {
    return "#FFD43B";
  }

  if (rank === 2) {
    return "#BDBDBD";
  }

  if (rank === 3) {
    return "#CD7F32";
  }

  return null;
}

function getInitials(entry) {
  const name =
    entry.displayName ||
    entry.username ||
    "У";

  return name.trim().slice(0, 2).toUpperCase();
}

function normalizeDemoEntry(entry) {
  return {
    rank: entry.rank,
    id: String(entry.id),
    displayName: entry.username,
    username: null,
    avatarUrl: null,
    avatar: entry.avatar,
    xp: entry.xpToday,
    streak: 0,
    isCurrentUser: false
  };
}

function Avatar({ entry }) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: "#4B4B4B",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "900",
        overflow: "hidden",
        flexShrink: 0
      }}
    >
      {entry.avatarUrl ? (
        <img
          src={entry.avatarUrl}
          alt={entry.displayName}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
      ) : entry.avatar ? (
        entry.avatar
      ) : entry.displayName || entry.username ? (
        getInitials(entry)
      ) : (
        <AppIcon icon={UserRound} size={22} />
      )}
    </div>
  );
}

function LeaderboardRow({ entry }) {
  const hasRank = Number.isInteger(entry.rank);
  const isTopThree = hasRank && entry.rank <= 3;

  return (
    <AppCard
      style={{
        marginBottom: 12,
        padding: 14,
        background: entry.isCurrentUser
          ? "#E9F8DD"
          : "#FFFFFF",
        color: "#4B4B4B",
        boxShadow: entry.isCurrentUser
          ? "0 5px 0 #46A400"
          : "0 5px 0 #D9D9D9",
        borderColor: entry.isCurrentUser
          ? "#58CC02"
          : "#E6E6E6"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12
        }}
      >
        <div
          style={{
            width: 34,
            textAlign: "center",
            fontSize: isTopThree ? 24 : 16,
            fontWeight: "900"
          }}
        >
          {isTopThree ? (
            <AppIcon
              icon={Medal}
              size={25}
              color={getRankColor(entry.rank)}
            />
          ) : hasRank ? (
            entry.rank
          ) : (
            "—"
          )}
        </div>

        <Avatar entry={entry} />

        <div
          style={{
            flex: 1,
            minWidth: 0
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 0
            }}
          >
            <div
              style={{
                fontWeight: "900",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {entry.displayName}
            </div>

            {entry.isCurrentUser ? (
              <span
                style={{
                  padding: "3px 7px",
                  borderRadius: 999,
                  background: "#58CC02",
                  color: "#FFFFFF",
                  fontSize: 11,
                  fontWeight: "900",
                  flexShrink: 0
                }}
              >
                Вы
              </span>
            ) : null}
          </div>

          <div
            style={{
              marginTop: 3,
              color: "#777",
              fontSize: 13,
              fontWeight: "800",
              display: "flex",
              alignItems: "center",
              gap: 10
            }}
          >
            <span>{entry.xp} XP</span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4
              }}
            >
              <AppIcon icon={Flame} size={14} color="#FF9600" />
              {entry.streak || 0}
            </span>
          </div>
        </div>
      </div>
    </AppCard>
  );
}

export default function Leaderboard() {
  const { user } = useUser();
  const isTelegramMode = hasTelegramAuthData();
  const isDevelopment = process.env.NODE_ENV === "development";
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(isTelegramMode);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("weekly");

  const activePeriod =
    PERIOD_OPTIONS.find(option => option.value === period) ||
    PERIOD_OPTIONS[1];

  const demoLeaderboard = useMemo(() => {
    const currentEntry = {
      id: "current-user",
      displayName: user.displayName || user.username || "Вы",
      username: null,
      avatarUrl: user.avatarUrl,
      xp: Number(user.xp) || 0,
      streak: Number(user.streak) || 0,
      isCurrentUser: true
    };

    return [
      ...leaderboardUsers.map(normalizeDemoEntry),
      currentEntry
    ]
      .sort((left, right) => right.xp - left.xp)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
  }, [
    user.avatarUrl,
    user.displayName,
    user.streak,
    user.username,
    user.xp
  ]);

  const loadLeaderboard = useCallback(async () => {
    if (!isTelegramMode) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await getLeaderboard({
        limit: 50,
        period
      });
      setLeaderboard(data.leaderboard || []);
      setCurrentUser(data.currentUser || null);
      setTotalUsers(data.totalUsers || 0);
    } catch (loadError) {
      setError("Не удалось загрузить рейтинг");

      if (process.env.NODE_ENV === "development") {
        console.warn(
          "Leaderboard loading failed:",
          loadError.message
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [isTelegramMode, period]);

  useEffect(() => {
    void loadLeaderboard();
  }, [loadLeaderboard]);

  const visibleLeaderboard =
    isTelegramMode
      ? leaderboard
      : isDevelopment
        ? demoLeaderboard
        : [];

  const visibleCurrentUser =
    isTelegramMode
      ? currentUser
      : isDevelopment
        ? demoLeaderboard.find(entry => entry.isCurrentUser)
        : null;

  const shouldShowCurrentUserCard =
    visibleCurrentUser &&
    !visibleLeaderboard.some(
      entry => entry.id === visibleCurrentUser.id
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
        <AppIcon icon={Trophy} size={30} />
      </div>

      <SectionTitle
        title="Рейтинг"
        subtitle={
          isTelegramMode
            ? `${activePeriod.subtitle}${totalUsers ? ` · ${totalUsers} участников` : ""}`
            : isDevelopment
              ? "Демо-рейтинг для разработки"
              : "Рейтинг станет доступен после запуска через Telegram"
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 8,
          marginBottom: 18
        }}
      >
        {PERIOD_OPTIONS.map(option => {
          const isActive = option.value === period;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              disabled={isLoading && isActive}
              style={{
                minHeight: 44,
                padding: "9px 8px",
                borderRadius: 14,
                border: `2px solid ${isActive ? "#46A400" : "#E6E6E6"}`,
                background: isActive ? "#58CC02" : "#FFFFFF",
                color: isActive ? "#FFFFFF" : "#4B4B4B",
                boxShadow: isActive
                  ? "0 4px 0 #46A400"
                  : "0 4px 0 #D9D9D9",
                fontSize: 13,
                fontWeight: "900",
                cursor: "pointer"
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <AppCard
          style={{
            marginBottom: 18,
            color: "#4B4B4B",
            textAlign: "center",
            fontWeight: "900"
          }}
        >
          Загружаем рейтинг...
        </AppCard>
      ) : null}

      {error ? (
        <AppCard
          style={{
            marginBottom: 18,
            color: "#4B4B4B",
            textAlign: "center"
          }}
        >
          <div
            style={{
              fontWeight: "900",
              marginBottom: 12
            }}
          >
            {error}
          </div>

          <AppButton
            onClick={loadLeaderboard}
            variant="secondary"
          >
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

      {!isTelegramMode && isDevelopment ? (
        <AppCard
          style={{
            marginBottom: 18,
            background: "#FFD43B",
            color: "#4B4B4B",
            boxShadow: "0 6px 0 #E0B900",
            fontWeight: "900"
          }}
        >
          Демо-рейтинг
        </AppCard>
      ) : null}

      {!isLoading && !error && visibleLeaderboard.length === 0 ? (
        <AppCard
          style={{
            color: "#4B4B4B",
            textAlign: "center",
            fontWeight: "900"
          }}
        >
          {isTelegramMode
            ? "Пока в рейтинге никого нет"
            : "Открой Хайи через Telegram, чтобы участвовать в рейтинге."}
        </AppCard>
      ) : null}

      {shouldShowCurrentUserCard ? (
        <div
          style={{
            marginBottom: 18
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: "900",
              marginBottom: 10,
              color: "#D9D9D9"
            }}
          >
            Ваша позиция
          </div>

          <LeaderboardRow entry={visibleCurrentUser} />
        </div>
      ) : null}

      <div>
        {visibleLeaderboard.map(entry => (
          <LeaderboardRow
            key={entry.id}
            entry={entry}
          />
        ))}
      </div>

      <BottomNav />
    </PageContainer>
  );
}

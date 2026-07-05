import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from "react";
import { getNextLessonId } from "../data/courseHelpers";

const UserContext = createContext();

const MAX_HEARTS = 5;
const HEART_REWARD_STREAK = 3;

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getDateOffsetKey(daysOffset) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().slice(0, 10);
}

const DEFAULT_USER = {
  username: "Гость",
  avatarUrl: "",
  xp: 120,
  streak: 0,
  longestStreak: 0,
  lastLessonCompletedDate: null,
  todayLessonCompleted: false,
  completedLessons: 0,
  unlockedLessons: 1,
  completedLessonIds: [],
  unlockedLessonIds: [1],
  hearts: MAX_HEARTS,
  lastHeartRefillDate: getTodayKey(),
  correctAnswerStreak: 0,
  soundEnabled: true
};

function toNumber(value, fallback) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : fallback;
}

function clamp(value, min, max) {
  return Math.min(
    Math.max(value, min),
    max
  );
}

function normalizeHearts(value) {
  return clamp(
    toNumber(value, DEFAULT_USER.hearts),
    0,
    MAX_HEARTS
  );
}

function createSequentialIds(count) {
  return Array.from(
    { length: Math.max(count, 0) },
    (_, index) => index + 1
  );
}

function normalizeIdList(value, fallback = []) {
  const source = Array.isArray(value)
    ? value
    : fallback;

  const ids = source
    .map(id => Number(id))
    .filter(id =>
      Number.isInteger(id) &&
      id > 0
    );

  return [...new Set(ids)];
}

function normalizeDate(value) {
  return typeof value === "string" && value.length > 0
    ? value
    : null;
}

function normalizeUser(savedUser = {}) {
  const initialUser = {
    ...DEFAULT_USER,
    ...savedUser
  };

  const completedLessons = toNumber(
    initialUser.completedLessons,
    DEFAULT_USER.completedLessons
  );

  const unlockedLessons = toNumber(
    initialUser.unlockedLessons,
    DEFAULT_USER.unlockedLessons
  );

  const completedLessonIds = normalizeIdList(
    savedUser.completedLessonIds,
    createSequentialIds(completedLessons)
  );

  const unlockedLessonIds = normalizeIdList(
    savedUser.unlockedLessonIds,
    createSequentialIds(unlockedLessons)
  );

  const safeUnlockedLessonIds =
    unlockedLessonIds.length > 0
      ? unlockedLessonIds
      : DEFAULT_USER.unlockedLessonIds;

  const today = getTodayKey();
  const lastLessonCompletedDate =
    normalizeDate(initialUser.lastLessonCompletedDate);
  const shouldRefillHearts =
    initialUser.lastHeartRefillDate !== today;

  const streak = toNumber(
    initialUser.streak,
    DEFAULT_USER.streak
  );

  const longestStreak = toNumber(
    initialUser.longestStreak,
    Math.max(DEFAULT_USER.longestStreak, streak)
  );

  return {
    ...initialUser,
    xp: toNumber(initialUser.xp, DEFAULT_USER.xp),
    hearts: shouldRefillHearts
      ? MAX_HEARTS
      : normalizeHearts(initialUser.hearts),
    streak,
    longestStreak: Math.max(longestStreak, streak),
    lastLessonCompletedDate,
    todayLessonCompleted:
      lastLessonCompletedDate === today,
    completedLessonIds,
    unlockedLessonIds: safeUnlockedLessonIds,
    completedLessons: completedLessonIds.length,
    unlockedLessons: safeUnlockedLessonIds.length,
    lastHeartRefillDate: today,
    correctAnswerStreak: toNumber(
      initialUser.correctAnswerStreak,
      DEFAULT_USER.correctAnswerStreak
    ),
    soundEnabled:
      typeof initialUser.soundEnabled === "boolean"
        ? initialUser.soundEnabled
        : DEFAULT_USER.soundEnabled
  };
}

export function UserProvider({ children }) {

  const [user, setUser] = useState(() => {

    const savedUser =
      localStorage.getItem("haiyi-user");

    if (!savedUser) {
      return normalizeUser();
    }

    try {
      return normalizeUser(JSON.parse(savedUser));
    } catch {
      return normalizeUser();
    }
  });

  const login = (username, avatarUrl = "") => {

    setUser(prev => ({
      ...prev,
      username: username || DEFAULT_USER.username,
      avatarUrl: avatarUrl || prev.avatarUrl || ""
    }));
  };

  const loginWithTelegramUser = (telegramUser) => {
    const username =
      telegramUser?.first_name ||
      telegramUser?.username ||
      DEFAULT_USER.username;

    login(username, telegramUser?.photo_url || "");
  };

  const addXP = (amount) => {

    setUser(prev => ({
      ...prev,
      xp:
        toNumber(prev.xp, DEFAULT_USER.xp) +
        toNumber(amount, 0)
    }));
  };

  const completeLessonById = useCallback((
    lessonId,
    xpReward = 10
  ) => {
    const numericLessonId = Number(lessonId);

    if (
      !Number.isInteger(numericLessonId) ||
      numericLessonId <= 0
    ) {
      return;
    }

    setUser(prev => {
      const completedLessonIds = normalizeIdList(
        prev.completedLessonIds
      );

      const unlockedLessonIds = normalizeIdList(
        prev.unlockedLessonIds,
        DEFAULT_USER.unlockedLessonIds
      );

      if (completedLessonIds.includes(numericLessonId)) {
        return {
          ...prev,
          xp: toNumber(prev.xp, DEFAULT_USER.xp),
          hearts: normalizeHearts(prev.hearts),
          streak: toNumber(
            prev.streak,
            DEFAULT_USER.streak
          ),
          longestStreak: toNumber(
            prev.longestStreak,
            DEFAULT_USER.longestStreak
          ),
          completedLessonIds,
          unlockedLessonIds,
          completedLessons: completedLessonIds.length,
          unlockedLessons: unlockedLessonIds.length
        };
      }

      const nextLessonId =
        getNextLessonId(numericLessonId);

      const nextCompletedLessonIds = [
        ...completedLessonIds,
        numericLessonId
      ];

      const nextUnlockedLessonIds =
        nextLessonId
          ? [
              ...new Set([
                ...unlockedLessonIds,
                nextLessonId
              ])
            ]
          : unlockedLessonIds;

      return {
        ...prev,
        xp:
          toNumber(prev.xp, DEFAULT_USER.xp) +
          toNumber(xpReward, 0),
        hearts: normalizeHearts(prev.hearts),
        streak: toNumber(
          prev.streak,
          DEFAULT_USER.streak
        ),
        longestStreak: toNumber(
          prev.longestStreak,
          DEFAULT_USER.longestStreak
        ),
        completedLessonIds:
          nextCompletedLessonIds,
        unlockedLessonIds:
          nextUnlockedLessonIds,
        completedLessons:
          nextCompletedLessonIds.length,
        unlockedLessons:
          nextUnlockedLessonIds.length
      };
    });
  }, []);

  const markLessonCompletedToday = useCallback(() => {
    setUser(prev => {
      const today = getTodayKey();
      const yesterday = getDateOffsetKey(-1);
      const lastLessonCompletedDate =
        normalizeDate(prev.lastLessonCompletedDate);
      const currentStreak = toNumber(
        prev.streak,
        DEFAULT_USER.streak
      );
      const currentLongestStreak = toNumber(
        prev.longestStreak,
        DEFAULT_USER.longestStreak
      );

      if (lastLessonCompletedDate === today) {
        return {
          ...prev,
          streak: currentStreak,
          longestStreak:
            Math.max(currentLongestStreak, currentStreak),
          todayLessonCompleted: true
        };
      }

      const nextStreak =
        lastLessonCompletedDate === yesterday
          ? currentStreak + 1
          : 1;

      return {
        ...prev,
        streak: nextStreak,
        longestStreak:
          Math.max(currentLongestStreak, nextStreak),
        todayLessonCompleted: true,
        lastLessonCompletedDate: today
      };
    });
  }, []);

  const completeLesson = () => {

    setUser(prev => ({
      ...prev,
      completedLessons:
        toNumber(
          prev.completedLessons,
          DEFAULT_USER.completedLessons
        ) + 1
    }));
  };

  const unlockNextLesson = useCallback(() => {

    setUser(prev => ({
      ...prev,

      unlockedLessons:
        toNumber(
          prev.unlockedLessons,
          DEFAULT_USER.unlockedLessons
        ) + 1
    }));
  }, []);

  const loseHeart = () => {

    setUser(prev => ({
      ...prev,
      hearts:
        clamp(
          normalizeHearts(prev.hearts) - 1,
          0,
          MAX_HEARTS
        )
    }));
  };

  const resetHearts = () => {

    setUser(prev => ({
      ...prev,
      hearts: MAX_HEARTS,
      lastHeartRefillDate: getTodayKey()
    }));
  };

  const restoreOneHeart = () => {

    setUser(prev => ({
      ...prev,
      hearts:
        clamp(
          normalizeHearts(prev.hearts) + 1,
          0,
          MAX_HEARTS
        )
    }));
  };

  const registerCorrectAnswer = () => {

    setUser(prev => {
      const nextCorrectAnswerStreak =
        toNumber(prev.correctAnswerStreak, 0) + 1;

      if (nextCorrectAnswerStreak < HEART_REWARD_STREAK) {
        return {
          ...prev,
          correctAnswerStreak:
            nextCorrectAnswerStreak,
          hearts: normalizeHearts(prev.hearts)
        };
      }

      return {
        ...prev,
        correctAnswerStreak: 0,
        hearts:
          clamp(
            normalizeHearts(prev.hearts) + 1,
            0,
            MAX_HEARTS
          )
      };
    });
  };

  const resetCorrectAnswerStreak = () => {

    setUser(prev => ({
      ...prev,
      correctAnswerStreak: 0
    }));
  };

  const toggleSound = () => {

    setUser(prev => ({
      ...prev,
      soundEnabled:
        typeof prev.soundEnabled === "boolean"
          ? !prev.soundEnabled
          : false
    }));
  };

  useEffect(() => {

    localStorage.setItem(
      "haiyi-user",
      JSON.stringify(user)
    );

  }, [user]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        login,
        loginWithTelegramUser,
        addXP,
        completeLesson,
        completeLessonById,
        markLessonCompletedToday,
        unlockNextLesson,
        loseHeart,
        resetHearts,
        restoreOneHeart,
        registerCorrectAnswer,
        resetCorrectAnswerStreak,
        toggleSound,
        maxHearts: MAX_HEARTS
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

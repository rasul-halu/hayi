import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from "react";
import {
  authenticateWithTelegram,
  completeLessonOnServer,
  getProgress,
  getUserStats,
  hasTelegramAuthData,
  recordCorrectAnswer,
  recordWrongAnswer
} from "../api/apiClient";
import { getNextLessonId } from "../data/courseHelpers";
import { getTelegramInitData } from "../utils/telegram";
import { mapBackendUserToAppUser } from "../utils/userMapping";

const UserContext = createContext();

const MAX_HEARTS = 5;
const HEART_REWARD_STREAK = 3;
const LEGACY_USER_KEY = "haiyi-user";
const GUEST_USER_KEY = "hayi-guest-user";
const TELEGRAM_USER_KEY = "hayi-telegram-user";

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
  displayName: "Гость",
  firstName: "",
  lastName: null,
  telegramUsername: null,
  backendUserId: null,
  telegramId: null,
  avatarUrl: "",
  isGuest: true,
  authProvider: "guest",
  xp: 120,
  streak: 0,
  longestStreak: 0,
  totalCorrectAnswers: 0,
  totalWrongAnswers: 0,
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

function isGuestDisplayName(value) {
  return value === "Гость" ||
    value === "Р“РѕСЃС‚СЊ";
}

function getTelegramSafeName(value) {
  return value && !isGuestDisplayName(value)
    ? value
    : "Ученик";
}

function readStoredUser(key) {
  const savedUser = localStorage.getItem(key);

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch {
    return null;
  }
}

function getInitialUser() {
  if (hasTelegramAuthData()) {
    const telegramUser =
      readStoredUser(TELEGRAM_USER_KEY);

    const legacyUser =
      readStoredUser(LEGACY_USER_KEY);

    const cachedTelegramUser =
      telegramUser ||
      (
        legacyUser?.authProvider === "telegram"
          ? legacyUser
          : null
      );

    return normalizeUser({
      ...(cachedTelegramUser || {}),
      username:
        getTelegramSafeName(
          cachedTelegramUser?.username ||
          cachedTelegramUser?.displayName
        ),
      displayName:
        getTelegramSafeName(
          cachedTelegramUser?.displayName ||
          cachedTelegramUser?.username
        ),
      isGuest: false,
      authProvider: "telegram"
    });
  }

  const guestUser =
    readStoredUser(GUEST_USER_KEY) ||
    readStoredUser(LEGACY_USER_KEY);

  return normalizeUser({
    ...(guestUser || {}),
    isGuest: true,
    authProvider: "guest"
  });
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
    username:
      initialUser.authProvider === "telegram"
        ? getTelegramSafeName(
            initialUser.username ||
            initialUser.displayName
          )
        : initialUser.username ||
          initialUser.displayName ||
          DEFAULT_USER.username,
    displayName:
      initialUser.authProvider === "telegram"
        ? getTelegramSafeName(
            initialUser.displayName ||
            initialUser.username
          )
        : initialUser.displayName ||
          initialUser.username ||
          DEFAULT_USER.displayName,
    firstName:
      typeof initialUser.firstName === "string"
        ? initialUser.firstName
        : DEFAULT_USER.firstName,
    lastName:
      typeof initialUser.lastName === "string"
        ? initialUser.lastName
        : null,
    telegramUsername:
      typeof initialUser.telegramUsername === "string"
        ? initialUser.telegramUsername
        : null,
    backendUserId:
      initialUser.backendUserId !== undefined &&
      initialUser.backendUserId !== null
        ? String(initialUser.backendUserId)
        : null,
    telegramId:
      initialUser.telegramId !== undefined &&
      initialUser.telegramId !== null
        ? String(initialUser.telegramId)
        : null,
    avatarUrl:
      typeof initialUser.avatarUrl === "string"
        ? initialUser.avatarUrl
        : "",
    isGuest:
      typeof initialUser.isGuest === "boolean"
        ? initialUser.isGuest
        : initialUser.authProvider !== "telegram",
    authProvider:
      initialUser.authProvider === "telegram"
        ? "telegram"
        : "guest",
    xp: toNumber(initialUser.xp, DEFAULT_USER.xp),
    hearts: shouldRefillHearts
      ? MAX_HEARTS
      : normalizeHearts(initialUser.hearts),
    streak,
    longestStreak: Math.max(longestStreak, streak),
    totalCorrectAnswers: toNumber(
      initialUser.totalCorrectAnswers,
      DEFAULT_USER.totalCorrectAnswers
    ),
    totalWrongAnswers: toNumber(
      initialUser.totalWrongAnswers,
      DEFAULT_USER.totalWrongAnswers
    ),
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

  const telegramAuthAttemptedRef = useRef(false);
  const [authStatus, setAuthStatus] = useState(
    () => hasTelegramAuthData()
      ? "loading"
      : "guest"
  );
  const [authError, setAuthError] = useState("");
  const [user, setUser] = useState(getInitialUser);

  const login = (username, avatarUrl = "") => {

    setUser(prev => ({
      ...prev,
      username: username || DEFAULT_USER.username,
      displayName: username || DEFAULT_USER.displayName,
      avatarUrl: avatarUrl || prev.avatarUrl || "",
      isGuest: true,
      authProvider: "guest"
    }));
    setAuthStatus("guest");
    setAuthError("");
  };

  const syncStatsFromServer = useCallback((stats) => {
    if (!stats) {
      return;
    }

    setUser(prev => ({
      ...prev,
      xp: toNumber(stats.xp, prev.xp),
      hearts: clamp(
        toNumber(stats.hearts, prev.hearts),
        0,
        toNumber(stats.maxHearts, MAX_HEARTS)
      ),
      streak: toNumber(stats.streak, prev.streak),
      longestStreak: toNumber(
        stats.longestStreak,
        prev.longestStreak
      ),
      totalCorrectAnswers: toNumber(
        stats.totalCorrectAnswers,
        prev.totalCorrectAnswers || 0
      ),
      totalWrongAnswers: toNumber(
        stats.totalWrongAnswers,
        prev.totalWrongAnswers || 0
      ),
      lastLessonCompletedDate:
        typeof stats.lastLessonCompletedDate === "string"
          ? stats.lastLessonCompletedDate
          : prev.lastLessonCompletedDate,
      lastHeartRefillDate: getTodayKey()
    }));
  }, []);

  const loadStatsFromServer = useCallback(async () => {
    if (!hasTelegramAuthData()) {
      return null;
    }

    const data = await getUserStats();
    syncStatsFromServer(data.stats);

    return data.stats;
  }, [syncStatsFromServer]);

  const loadProgressFromServer = useCallback(async () => {
    if (!hasTelegramAuthData()) {
      return null;
    }

    const data = await getProgress();
    const completedLessonIds = (data.progress || [])
      .filter(item => item.completed)
      .map(item => Number(item.lessonId))
      .filter(item =>
        Number.isInteger(item) &&
        item > 0
      );

    if (completedLessonIds.length > 0) {
      setUser(prev => {
        const nextCompletedLessonIds = [
          ...new Set([
            ...normalizeIdList(prev.completedLessonIds),
            ...completedLessonIds
          ])
        ];

        return {
          ...prev,
          completedLessonIds: nextCompletedLessonIds,
          completedLessons: nextCompletedLessonIds.length
        };
      });
    }

    return data.progress;
  }, []);

  const loginWithTelegramUser = useCallback((telegramUser) => {
    const appUser =
      mapBackendUserToAppUser(telegramUser);

    setUser(prev => ({
      ...prev,
      ...appUser,
      avatarUrl: appUser.avatarUrl || prev.avatarUrl || ""
    }));
    setAuthStatus("authenticated");
    setAuthError("");

    syncStatsFromServer(telegramUser);
  }, [syncStatsFromServer]);

  const authenticateTelegramUser = useCallback(async () => {
    const initData = getTelegramInitData();

    if (!initData) {
      setAuthStatus("guest");
      return null;
    }

    setAuthStatus("loading");
    setAuthError("");

    try {
      const data = await authenticateWithTelegram(initData);

      if (!data.authenticated || !data.user) {
        throw new Error("Telegram authentication failed");
      }

      loginWithTelegramUser(data.user);

      try {
        await Promise.all([
          loadStatsFromServer(),
          loadProgressFromServer()
        ]);
      } catch (syncError) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Telegram user sync failed:",
            syncError.message
          );
        }
      }

      setAuthStatus("authenticated");
      return data.user;
    } catch (error) {
      setAuthStatus("error");
      setAuthError(
        error.message ||
        "Telegram authentication failed"
      );
      throw error;
    }
  }, [
    loadProgressFromServer,
    loadStatsFromServer,
    loginWithTelegramUser
  ]);

  useEffect(() => {
    if (!hasTelegramAuthData()) {
      setAuthStatus("guest");
      return;
    }

    if (telegramAuthAttemptedRef.current) {
      return;
    }

    telegramAuthAttemptedRef.current = true;
    void authenticateTelegramUser().catch(() => {});
  }, [authenticateTelegramUser]);

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

  const cacheCompletedLessonById = useCallback((lessonId) => {
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
        completedLessonIds: nextCompletedLessonIds,
        unlockedLessonIds: nextUnlockedLessonIds,
        completedLessons: nextCompletedLessonIds.length,
        unlockedLessons: nextUnlockedLessonIds.length
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

  const handleCorrectAnswer = useCallback(async () => {
    if (!hasTelegramAuthData()) {
      registerCorrectAnswer();
      return;
    }

    try {
      const data = await recordCorrectAnswer();
      syncStatsFromServer(data.stats);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "Server correct answer save failed:",
          error.message
        );
      }
    }
  }, [syncStatsFromServer]);

  const resetCorrectAnswerStreak = () => {

    setUser(prev => ({
      ...prev,
      correctAnswerStreak: 0
    }));
  };

  const handleWrongAnswer = useCallback(async () => {
    if (!hasTelegramAuthData()) {
      resetCorrectAnswerStreak();
      loseHeart();
      return;
    }

    setUser(prev => ({
      ...prev,
      correctAnswerStreak: 0
    }));

    try {
      const data = await recordWrongAnswer();
      syncStatsFromServer(data.stats);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "Server wrong answer save failed:",
          error.message
        );
      }

      loseHeart();
    }
  }, [syncStatsFromServer]);

  const completeLessonWithSync = useCallback(async (
    lessonId,
    xpReward = 10
  ) => {
    if (!hasTelegramAuthData()) {
      completeLessonById(lessonId, xpReward);
      markLessonCompletedToday();
      return null;
    }

    try {
      const data = await completeLessonOnServer({
        lessonId: String(lessonId)
      });

      cacheCompletedLessonById(lessonId);
      syncStatsFromServer(data.stats);

      return data;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "Server lesson complete failed:",
          error.message
        );
      }

      completeLessonById(lessonId, xpReward);
      markLessonCompletedToday();

      return null;
    }
  }, [
    cacheCompletedLessonById,
    completeLessonById,
    markLessonCompletedToday,
    syncStatsFromServer
  ]);

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
    const storageKey =
      user.authProvider === "telegram"
        ? TELEGRAM_USER_KEY
        : GUEST_USER_KEY;

    localStorage.setItem(
      storageKey,
      JSON.stringify(user)
    );
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        authStatus,
        authError,
        login,
        loginWithTelegramUser,
        authenticateTelegramUser,
        syncStatsFromServer,
        loadStatsFromServer,
        loadProgressFromServer,
        addXP,
        completeLesson,
        completeLessonById,
        completeLessonWithSync,
        markLessonCompletedToday,
        unlockNextLesson,
        loseHeart,
        resetHearts,
        restoreOneHeart,
        registerCorrectAnswer,
        handleCorrectAnswer,
        handleWrongAnswer,
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

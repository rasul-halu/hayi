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
  getUserHearts,
  getUserStats,
  hasTelegramAuthData,
  recordCorrectAnswer,
  recordWrongAnswer
} from "../api/apiClient";
import { getNextLessonId } from "../data/courseHelpers";
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  getTodayDateKey,
  isActivityToday,
  normalizeActivityDateKeys
} from "../utils/streakUtils";
import { getTelegramInitData } from "../utils/telegram";
import { mapBackendUserToAppUser } from "../utils/userMapping";

const UserContext = createContext();

const MAX_HEARTS = 5;
const HEART_RESTORE_INTERVAL_MS = 60 * 60 * 1000;
const HEART_REWARD_STREAK = 3;
const LEGACY_USER_KEY = "haiyi-user";
const GUEST_USER_KEY = "hayi-guest-user";
const TELEGRAM_USER_KEY = "hayi-telegram-user";

function getTodayKey() {
  return getTodayDateKey();
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
  role: "GUEST",
  isGuest: true,
  authProvider: "guest",
  xp: 120,
  streak: 0,
  longestStreak: 0,
  bestStreak: 0,
  totalCorrectAnswers: 0,
  totalWrongAnswers: 0,
  lastLessonCompletedDate: null,
  todayLessonCompleted: false,
  activityDateKeys: [],
  activeDates: [],
  completedLessons: 0,
  unlockedLessons: 1,
  completedLessonIds: [],
  unlockedLessonIds: [1],
  hearts: MAX_HEARTS,
  maxHearts: MAX_HEARTS,
  nextHeartAt: null,
  lastHeartRefillAt: new Date().toISOString(),
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

function normalizeHearts(value, maxHearts = MAX_HEARTS) {
  return clamp(
    toNumber(value, DEFAULT_USER.hearts),
    0,
    maxHearts
  );
}

function normalizeMaxHearts(value) {
  return clamp(
    toNumber(value, MAX_HEARTS),
    1,
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
    .map(normalizeLessonId)
    .filter(id => id !== undefined);

  return [...new Set(ids)];
}

function normalizeLessonId(id) {
  const numericId = Number(id);

  if (Number.isInteger(numericId) && numericId > 0) {
    return numericId;
  }

  if (typeof id === "string" && id.trim().length > 0) {
    return id.trim();
  }

  return undefined;
}

function normalizeDate(value) {
  return typeof value === "string" && value.length > 0
    ? value
    : null;
}

function normalizeDateTime(value) {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  const date = new Date(value);

  return Number.isFinite(date.getTime())
    ? date.toISOString()
    : null;
}

function getGuestHeartState(user, now = new Date()) {
  const maxHearts = normalizeMaxHearts(user.maxHearts);
  const hearts = normalizeHearts(user.hearts, maxHearts);
  const lastHeartRefillAt =
    normalizeDateTime(user.lastHeartRefillAt) ||
    normalizeDateTime(user.heartsUpdatedAt) ||
    now.toISOString();

  if (hearts >= maxHearts) {
    return {
      hearts: maxHearts,
      maxHearts,
      nextHeartAt: null,
      secondsUntilNextHeart: 0,
      lastHeartRefillAt: now.toISOString()
    };
  }

  const anchor = new Date(lastHeartRefillAt);
  const elapsedMs = Math.max(
    0,
    now.getTime() - anchor.getTime()
  );
  const restoredCount = Math.floor(
    elapsedMs / HEART_RESTORE_INTERVAL_MS
  );
  const appliedRestores = Math.min(
    restoredCount,
    maxHearts - hearts
  );
  const nextHearts = Math.min(
    hearts + appliedRestores,
    maxHearts
  );

  if (nextHearts >= maxHearts) {
    return {
      hearts: maxHearts,
      maxHearts,
      nextHeartAt: null,
      secondsUntilNextHeart: 0,
      lastHeartRefillAt: now.toISOString()
    };
  }

  const nextLastHeartRefillAt =
    appliedRestores > 0
      ? new Date(
          anchor.getTime() +
          appliedRestores * HEART_RESTORE_INTERVAL_MS
        )
      : anchor;
  const nextHeartAt = new Date(
    nextLastHeartRefillAt.getTime() +
    HEART_RESTORE_INTERVAL_MS
  );

  return {
    hearts: nextHearts,
    maxHearts,
    nextHeartAt: nextHeartAt.toISOString(),
    secondsUntilNextHeart: Math.max(
      0,
      Math.ceil((nextHeartAt.getTime() - now.getTime()) / 1000)
    ),
    lastHeartRefillAt: nextLastHeartRefillAt.toISOString()
  };
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
  const activityDateKeys = normalizeActivityDateKeys(
    Array.isArray(savedUser.activityDateKeys) &&
    savedUser.activityDateKeys.length > 0
      ? savedUser.activityDateKeys
      : Array.isArray(savedUser.activeDates) &&
        savedUser.activeDates.length > 0
        ? savedUser.activeDates
      : lastLessonCompletedDate
        ? [lastLessonCompletedDate]
        : []
  );
  const currentStreak = calculateCurrentStreak(activityDateKeys);
  const maxHearts = normalizeMaxHearts(initialUser.maxHearts);
  const heartState = getGuestHeartState({
    hearts: initialUser.hearts,
    maxHearts,
    lastHeartRefillAt: initialUser.lastHeartRefillAt,
    heartsUpdatedAt: initialUser.heartsUpdatedAt
  });

  const streak = currentStreak;

  const longestStreak = toNumber(
    initialUser.longestStreak ?? initialUser.bestStreak,
    Math.max(
      DEFAULT_USER.longestStreak,
      calculateLongestStreak(activityDateKeys),
      streak
    )
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
    role:
      typeof initialUser.role === "string"
        ? initialUser.role
        : initialUser.authProvider === "telegram"
        ? "USER"
        : "GUEST",
    authProvider:
      initialUser.authProvider === "telegram"
        ? "telegram"
        : "guest",
    xp: toNumber(initialUser.xp, DEFAULT_USER.xp),
    hearts: heartState.hearts,
    maxHearts: heartState.maxHearts,
    nextHeartAt: heartState.nextHeartAt,
    streak,
    longestStreak: Math.max(longestStreak, streak),
    bestStreak: Math.max(longestStreak, streak),
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
      isActivityToday(activityDateKeys),
    activityDateKeys,
    activeDates: activityDateKeys,
    completedLessonIds,
    unlockedLessonIds: safeUnlockedLessonIds,
    completedLessons: completedLessonIds.length,
    unlockedLessons: safeUnlockedLessonIds.length,
    lastHeartRefillAt: heartState.lastHeartRefillAt,
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
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const login = (username, avatarUrl = "") => {

    setUser(prev => ({
      ...prev,
      username: username || DEFAULT_USER.username,
      displayName: username || DEFAULT_USER.displayName,
      avatarUrl: avatarUrl || prev.avatarUrl || "",
      role: "GUEST",
      isGuest: true,
      authProvider: "guest"
    }));
    setAuthStatus("guest");
    setAuthError("");
  };

  const applyHeartState = useCallback((heartState) => {
    if (!heartState) {
      return null;
    }

    const maxHearts = normalizeMaxHearts(heartState.maxHearts);
    const nextState = {
      hearts: normalizeHearts(heartState.hearts, maxHearts),
      maxHearts,
      nextHeartAt:
        normalizeDateTime(heartState.nextHeartAt) || null,
      secondsUntilNextHeart:
        toNumber(heartState.secondsUntilNextHeart, 0)
    };

    setUser(prev => ({
      ...prev,
      ...nextState,
      lastHeartRefillAt:
        normalizeDateTime(heartState.lastHeartRefillAt) ||
        prev.lastHeartRefillAt ||
        new Date().toISOString()
    }));

    return nextState;
  }, []);

  const refreshHearts = useCallback(async () => {
    if (hasTelegramAuthData()) {
      try {
        const heartState = await getUserHearts();
        return applyHeartState(heartState);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Server hearts refresh failed:",
            error.message
          );
        }

        return null;
      }
    }

    let nextState = null;

    setUser(prev => {
      nextState = getGuestHeartState(prev);

      return {
        ...prev,
        ...nextState
      };
    });

    return nextState;
  }, [applyHeartState]);

  const syncStatsFromServer = useCallback((stats) => {
    if (!stats) {
      return;
    }

    setUser(prev => {
      const activityDateKeys = normalizeActivityDateKeys([
        ...(Array.isArray(prev.activityDateKeys)
          ? prev.activityDateKeys
          : []),
        ...(Array.isArray(prev.activeDates)
          ? prev.activeDates
          : []),
        ...(Array.isArray(stats.activityDateKeys)
          ? stats.activityDateKeys
          : []),
        ...(Array.isArray(stats.activeDates)
          ? stats.activeDates
          : []),
        stats.lastLessonCompletedDate ||
          prev.lastLessonCompletedDate
      ]);
      const currentStreak = calculateCurrentStreak(activityDateKeys);
      const longestStreak = Math.max(
        currentStreak,
        calculateLongestStreak(activityDateKeys),
        toNumber(stats.longestStreak, 0),
        toNumber(stats.bestStreak, 0),
        toNumber(prev.longestStreak, 0),
        toNumber(prev.bestStreak, 0)
      );
      const maxHearts = normalizeMaxHearts(stats.maxHearts);

      return {
        ...prev,
        xp: toNumber(stats.xp, prev.xp),
        hearts: normalizeHearts(
          stats.hearts,
          maxHearts
        ),
        maxHearts,
        nextHeartAt:
          normalizeDateTime(stats.nextHeartAt) || null,
        secondsUntilNextHeart:
          toNumber(stats.secondsUntilNextHeart, 0),
        streak: currentStreak,
        longestStreak,
        bestStreak: longestStreak,
        todayLessonCompleted:
          typeof stats.todayLessonCompleted === "boolean"
            ? stats.todayLessonCompleted ||
              isActivityToday(activityDateKeys)
            : isActivityToday(activityDateKeys),
        activityDateKeys,
        activeDates: activityDateKeys,
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
        lastHeartRefillAt:
          normalizeDateTime(stats.lastHeartRefillAt) ||
          prev.lastHeartRefillAt,
        lastHeartRefillDate: getTodayKey()
      };
    });
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

  useEffect(() => {
    void refreshHearts();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void refreshHearts();
      }
    };

    const handleFocus = () => {
      void refreshHearts();
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshHearts]);

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
    const safeLessonId = normalizeLessonId(lessonId);

    if (safeLessonId === undefined) {
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

      if (completedLessonIds.includes(safeLessonId)) {
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
        typeof safeLessonId === "number"
          ? getNextLessonId(safeLessonId)
          : undefined;

      const nextCompletedLessonIds = [
        ...completedLessonIds,
        safeLessonId
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
    const safeLessonId = normalizeLessonId(lessonId);

    if (safeLessonId === undefined) {
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

      if (completedLessonIds.includes(safeLessonId)) {
        return {
          ...prev,
          completedLessonIds,
          unlockedLessonIds,
          completedLessons: completedLessonIds.length,
          unlockedLessons: unlockedLessonIds.length
        };
      }

      const nextLessonId =
        typeof safeLessonId === "number"
          ? getNextLessonId(safeLessonId)
          : undefined;
      const nextCompletedLessonIds = [
        ...completedLessonIds,
        safeLessonId
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
      const today = getTodayDateKey();
      const activityDateKeys = normalizeActivityDateKeys([
        ...(Array.isArray(prev.activityDateKeys)
          ? prev.activityDateKeys
          : []),
        today
      ]);
      const nextStreak = calculateCurrentStreak(activityDateKeys);
      const currentLongestStreak = toNumber(
        prev.longestStreak,
        DEFAULT_USER.longestStreak
      );

      return {
        ...prev,
        streak: nextStreak,
        longestStreak:
          Math.max(
            currentLongestStreak,
            toNumber(prev.bestStreak, 0),
            calculateLongestStreak(activityDateKeys),
            nextStreak
          ),
        bestStreak:
          Math.max(
            currentLongestStreak,
            toNumber(prev.bestStreak, 0),
            calculateLongestStreak(activityDateKeys),
            nextStreak
          ),
        todayLessonCompleted: true,
        lastLessonCompletedDate: today,
        activityDateKeys,
        activeDates: activityDateKeys
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

    setUser(prev => {
      const maxHearts = normalizeMaxHearts(prev.maxHearts);
      const currentHearts = normalizeHearts(
        prev.hearts,
        maxHearts
      );
      const nextHearts = clamp(
        currentHearts - 1,
        0,
        maxHearts
      );
      const now = new Date();
      const shouldStartTimer =
        currentHearts >= maxHearts &&
        nextHearts < maxHearts;
      const lastHeartRefillAt =
        shouldStartTimer
          ? now.toISOString()
          : prev.lastHeartRefillAt ||
            now.toISOString();
      const nextHeartAt =
        nextHearts >= maxHearts
          ? null
          : new Date(
              new Date(lastHeartRefillAt).getTime() +
              HEART_RESTORE_INTERVAL_MS
            ).toISOString();

      return {
        ...prev,
        hearts: nextHearts,
        maxHearts,
        nextHeartAt,
        lastHeartRefillAt
      };
    });
  };

  const resetHearts = () => {

    setUser(prev => ({
      ...prev,
      hearts: MAX_HEARTS,
      maxHearts: MAX_HEARTS,
      nextHeartAt: null,
      lastHeartRefillAt: new Date().toISOString(),
      lastHeartRefillDate: getTodayKey()
    }));
  };

  const restoreHeart = useCallback((amount = 1) => {
    const safeAmount = Math.max(0, toNumber(amount, 1));
    const currentUser = userRef.current || DEFAULT_USER;
    const maxHearts = normalizeMaxHearts(currentUser.maxHearts);
    const currentHearts = normalizeHearts(
      currentUser.hearts,
      maxHearts
    );

    if (safeAmount <= 0 || currentHearts >= maxHearts) {
      return false;
    }

    setUser(prev => {
      const nextMaxHearts = normalizeMaxHearts(prev.maxHearts);
      const nextHearts = Math.min(
        nextMaxHearts,
        normalizeHearts(prev.hearts, nextMaxHearts) + safeAmount
      );

      return {
        ...prev,
        hearts: nextHearts,
        maxHearts: nextMaxHearts,
        nextHeartAt:
          nextHearts >= nextMaxHearts
            ? null
            : prev.nextHeartAt,
        lastHeartRefillAt:
          nextHearts >= nextMaxHearts
            ? new Date().toISOString()
            : prev.lastHeartRefillAt
      };
    });

    return true;
  }, []);

  const restoreOneHeart = () => restoreHeart(1);

  const registerCorrectAnswer = useCallback(() => {
    let heartWasRestored = false;

    setUser(prev => {
      const maxHearts = normalizeMaxHearts(prev.maxHearts);
      const currentHearts = normalizeHearts(
        prev.hearts,
        maxHearts
      );
      const nextCorrectAnswerStreak =
        toNumber(prev.correctAnswerStreak, 0) + 1;

      if (nextCorrectAnswerStreak < HEART_REWARD_STREAK) {
        return {
          ...prev,
          correctAnswerStreak:
            nextCorrectAnswerStreak,
          hearts: currentHearts,
          maxHearts
        };
      }

      const nextHearts = Math.min(
        maxHearts,
        currentHearts + 1
      );
      heartWasRestored = nextHearts > currentHearts;

      return {
        ...prev,
        correctAnswerStreak: 0,
        hearts: nextHearts,
        maxHearts,
        nextHeartAt:
          nextHearts >= maxHearts
            ? null
            : prev.nextHeartAt,
        lastHeartRefillAt:
          nextHearts >= maxHearts
            ? new Date().toISOString()
            : prev.lastHeartRefillAt
      };
    });

    return heartWasRestored;
  }, []);

  const handleCorrectAnswer = useCallback(async () => {
    if (!hasTelegramAuthData()) {
      return registerCorrectAnswer();
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

    return registerCorrectAnswer();
  }, [
    registerCorrectAnswer,
    syncStatsFromServer
  ]);

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
      markLessonCompletedToday();

      return data;
    } catch (error) {
      if (error.status === 402) {
        await refreshHearts();
        return null;
      }

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
    refreshHearts,
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
    localStorage.setItem(
      LEGACY_USER_KEY,
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
        applyHeartState,
        syncStatsFromServer,
        loadStatsFromServer,
        loadProgressFromServer,
        refreshHearts,
        addXP,
        completeLesson,
        completeLessonById,
        completeLessonWithSync,
        markLessonCompletedToday,
        unlockNextLesson,
        loseHeart,
        resetHearts,
        restoreHeart,
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

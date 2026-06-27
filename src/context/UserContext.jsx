import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from "react";
import { getNextLessonId } from "../data/courseHelpers";

const UserContext = createContext();

const DEFAULT_USER = {
  username: "Гость",
  xp: 120,
  streak: 7,
  completedLessons: 0,
  unlockedLessons: 1,
  completedLessonIds: [],
  unlockedLessonIds: [1],
  hearts: 5
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
    DEFAULT_USER.hearts
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

  return {
    ...initialUser,
    xp: toNumber(initialUser.xp, DEFAULT_USER.xp),
    hearts: normalizeHearts(initialUser.hearts),
    streak: toNumber(
      initialUser.streak,
      DEFAULT_USER.streak
    ),
    completedLessonIds,
    unlockedLessonIds: safeUnlockedLessonIds,
    completedLessons: completedLessonIds.length,
    unlockedLessons: safeUnlockedLessonIds.length
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

  const login = (username) => {

    setUser(prev => ({
      ...prev,
      username
    }));
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
          DEFAULT_USER.hearts
        )
    }));
  };

  const resetHearts = () => {

    setUser(prev => ({
      ...prev,
      hearts: DEFAULT_USER.hearts
    }));
  };

  const restoreOneHeart = () => {

    setUser(prev => ({
      ...prev,
      hearts:
        clamp(
          normalizeHearts(prev.hearts) + 1,
          0,
          DEFAULT_USER.hearts
        )
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
        addXP,
        completeLesson,
        completeLessonById,
        unlockNextLesson,
        loseHeart,
        resetHearts,
        restoreOneHeart
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

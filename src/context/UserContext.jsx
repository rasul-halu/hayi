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
  return Number.isFinite(Number(value))
    ? Number(value)
    : fallback;
}

function createSequentialIds(count) {
  return Array.from(
    { length: Math.max(count, 0) },
    (_, index) => index + 1
  );
}

function normalizeIdList(value, fallback) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const ids = value
    .map(id => Number(id))
    .filter(id =>
      Number.isInteger(id) &&
      id > 0
    );

  return [...new Set(ids)];
}

function normalizeUser(savedUser) {
  const initialUser = {
    ...DEFAULT_USER,
    ...savedUser
  };

  const completedLessons =
    toNumber(
      initialUser.completedLessons,
      DEFAULT_USER.completedLessons
    );

  const unlockedLessons =
    toNumber(
      initialUser.unlockedLessons,
      DEFAULT_USER.unlockedLessons
    );

  const hasCompletedLessonIds =
    Array.isArray(savedUser?.completedLessonIds);

  const hasUnlockedLessonIds =
    Array.isArray(savedUser?.unlockedLessonIds);

  const completedLessonIds = normalizeIdList(
    hasCompletedLessonIds
      ? savedUser.completedLessonIds
      : undefined,
    createSequentialIds(completedLessons)
  );

  const unlockedLessonIds = normalizeIdList(
    hasUnlockedLessonIds
      ? savedUser.unlockedLessonIds
      : undefined,
    createSequentialIds(unlockedLessons)
  );

  return {
    ...initialUser,
    xp: toNumber(initialUser.xp, DEFAULT_USER.xp),
    streak: toNumber(
      initialUser.streak,
      DEFAULT_USER.streak
    ),
    completedLessons:
      completedLessonIds.length,
    unlockedLessons:
      unlockedLessonIds.length,
    completedLessonIds,
    unlockedLessonIds:
      unlockedLessonIds.length > 0
        ? unlockedLessonIds
        : DEFAULT_USER.unlockedLessonIds,
    hearts: toNumber(
      initialUser.hearts,
      DEFAULT_USER.hearts
    )
  };
}

export function UserProvider({ children }) {

  const [user, setUser] = useState(() => {

    const savedUser =
      localStorage.getItem("haiyi-user");

    if (!savedUser) {
      return DEFAULT_USER;
    }

    try {
      return normalizeUser(JSON.parse(savedUser));
    } catch {
      return DEFAULT_USER;
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
      xp: toNumber(prev.xp, DEFAULT_USER.xp) + amount
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
        prev.completedLessonIds,
        []
      );

      if (completedLessonIds.includes(numericLessonId)) {
        return {
          ...prev,
          completedLessonIds,
          completedLessons: completedLessonIds.length,
          unlockedLessonIds: normalizeIdList(
            prev.unlockedLessonIds,
            DEFAULT_USER.unlockedLessonIds
          )
        };
      }

      const nextLessonId =
        getNextLessonId(numericLessonId);

      const nextCompletedLessonIds = [
        ...completedLessonIds,
        numericLessonId
      ];

      const unlockedLessonIds = normalizeIdList(
        prev.unlockedLessonIds,
        DEFAULT_USER.unlockedLessonIds
      );

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
          xpReward,
        completedLessonIds:
          nextCompletedLessonIds,
        completedLessons:
          nextCompletedLessonIds.length,
        unlockedLessonIds:
          nextUnlockedLessonIds,
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

      completedLessons:
        toNumber(
          prev.completedLessons,
          DEFAULT_USER.completedLessons
        ) + 1,

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
        Math.max(
            toNumber(
              prev.hearts,
              DEFAULT_USER.hearts
            ) - 1,
            0
        )

    }));
    };
    const resetHearts = () => {

        setUser(prev => ({

            ...prev,

            hearts: 5

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
        resetHearts
      }}
    >
      {children}
    </UserContext.Provider>
  );


}

export function useUser() {
  return useContext(UserContext);
}

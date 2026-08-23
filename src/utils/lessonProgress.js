export const LESSON_STATE = Object.freeze({
  LOCKED: "locked",
  AVAILABLE: "available",
  COMPLETED: "completed"
});

export const COURSE_PROGRESS_STATUS = Object.freeze({
  LOADING: "LOADING",
  EMPTY: "EMPTY",
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED"
});

export function normalizeProgressLessonId(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const normalizedValue = String(value).trim();
  return normalizedValue || null;
}

export function getCourseLessonProgress({
  lessons = [],
  completedLessonIds = [],
  isLoading = false
} = {}) {
  if (isLoading) {
    return {
      status: COURSE_PROGRESS_STATUS.LOADING,
      isCourseComplete: false,
      totalPublishedLessons: 0,
      completedPublishedLessons: 0,
      lessonStates: new Map()
    };
  }

  const uniqueLessons = [];
  const seenLessonIds = new Set();

  for (const lesson of Array.isArray(lessons) ? lessons : []) {
    const lessonId = normalizeProgressLessonId(lesson?.id);

    if (!lessonId || seenLessonIds.has(lessonId)) {
      continue;
    }

    seenLessonIds.add(lessonId);
    uniqueLessons.push({ lesson, lessonId });
  }

  const completedIds = new Set(
    (Array.isArray(completedLessonIds) ? completedLessonIds : [])
      .map(normalizeProgressLessonId)
      .filter(Boolean)
  );
  const lessonStates = new Map();
  let completedPublishedLessons = 0;

  uniqueLessons.forEach(({ lessonId }, index) => {
    const completed = completedIds.has(lessonId);

    if (completed) {
      completedPublishedLessons += 1;
      lessonStates.set(lessonId, LESSON_STATE.COMPLETED);
      return;
    }

    const previousLessonId = uniqueLessons[index - 1]?.lessonId;
    const previousLessonCompleted =
      index === 0 || completedIds.has(previousLessonId);

    lessonStates.set(
      lessonId,
      previousLessonCompleted
        ? LESSON_STATE.AVAILABLE
        : LESSON_STATE.LOCKED
    );
  });

  const totalPublishedLessons = uniqueLessons.length;
  const isCourseComplete =
    totalPublishedLessons > 0 &&
    completedPublishedLessons === totalPublishedLessons;
  const status = totalPublishedLessons === 0
    ? COURSE_PROGRESS_STATUS.EMPTY
    : isCourseComplete
      ? COURSE_PROGRESS_STATUS.COMPLETED
      : completedPublishedLessons > 0
        ? COURSE_PROGRESS_STATUS.IN_PROGRESS
        : COURSE_PROGRESS_STATUS.NOT_STARTED;

  return {
    status,
    isCourseComplete,
    totalPublishedLessons,
    completedPublishedLessons,
    lessonStates
  };
}

export function getLessonState(progress, lessonId) {
  const normalizedLessonId = normalizeProgressLessonId(lessonId);

  if (!normalizedLessonId) {
    return LESSON_STATE.LOCKED;
  }

  return progress?.lessonStates?.get(normalizedLessonId) || LESSON_STATE.LOCKED;
}

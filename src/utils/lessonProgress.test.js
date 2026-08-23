import {
  COURSE_PROGRESS_STATUS,
  getCourseLessonProgress,
  getLessonState,
  LESSON_STATE
} from "./lessonProgress";

const lessons = [
  { id: "lesson-a" },
  { id: "lesson-b" },
  { id: "lesson-c" }
];

test("new user can open only the first lesson", () => {
  const progress = getCourseLessonProgress({ lessons });

  expect(progress.status).toBe(COURSE_PROGRESS_STATUS.NOT_STARTED);
  expect(progress.isCourseComplete).toBe(false);
  expect(getLessonState(progress, "lesson-a")).toBe(LESSON_STATE.AVAILABLE);
  expect(getLessonState(progress, "lesson-b")).toBe(LESSON_STATE.LOCKED);
  expect(getLessonState(progress, "lesson-c")).toBe(LESSON_STATE.LOCKED);
});

test("progress from another course does not complete or lock this course", () => {
  const progress = getCourseLessonProgress({
    lessons,
    completedLessonIds: ["another-course-lesson"]
  });

  expect(progress.status).toBe(COURSE_PROGRESS_STATUS.NOT_STARTED);
  expect(progress.completedPublishedLessons).toBe(0);
  expect(progress.isCourseComplete).toBe(false);
  expect(getLessonState(progress, "lesson-a")).toBe(LESSON_STATE.AVAILABLE);
});

test("completing a lesson unlocks but does not complete the next lesson", () => {
  const progress = getCourseLessonProgress({
    lessons,
    completedLessonIds: ["lesson-a"]
  });

  expect(progress.status).toBe(COURSE_PROGRESS_STATUS.IN_PROGRESS);
  expect(getLessonState(progress, "lesson-a")).toBe(LESSON_STATE.COMPLETED);
  expect(getLessonState(progress, "lesson-b")).toBe(LESSON_STATE.AVAILABLE);
  expect(getLessonState(progress, "lesson-c")).toBe(LESSON_STATE.LOCKED);
});

test("course completes only when every unique course lesson is completed", () => {
  const progress = getCourseLessonProgress({
    lessons: [...lessons, { id: "lesson-c" }],
    completedLessonIds: [
      "lesson-a",
      "lesson-b",
      "lesson-c",
      "another-course-lesson"
    ]
  });

  expect(progress.status).toBe(COURSE_PROGRESS_STATUS.COMPLETED);
  expect(progress.isCourseComplete).toBe(true);
  expect(progress.totalPublishedLessons).toBe(3);
  expect(progress.completedPublishedLessons).toBe(3);
});

test("empty or loading course is never completed", () => {
  const emptyProgress = getCourseLessonProgress({
    lessons: [],
    completedLessonIds: []
  });
  const loadingProgress = getCourseLessonProgress({
    lessons: [],
    completedLessonIds: [],
    isLoading: true
  });

  expect(emptyProgress.status).toBe(COURSE_PROGRESS_STATUS.EMPTY);
  expect(emptyProgress.isCourseComplete).toBe(false);
  expect(loadingProgress.status).toBe(COURSE_PROGRESS_STATUS.LOADING);
  expect(loadingProgress.isCourseComplete).toBe(false);
});

import LessonNode from "./LessonNode";
import {
  getCourseLessonProgress,
  getLessonState
} from "../../utils/lessonProgress";

export default function LessonPath({
  lessons = [],
  completedLessonIds = [],
  isLoading = false,
  onLessonAttempt
}) {
  const progress = getCourseLessonProgress({
    lessons,
    completedLessonIds,
    isLoading
  });

  return (
    <div
      style={{
        marginTop: 30
      }}
    >
      {lessons.map((lesson, index) => (

        <div
          key={lesson.id}
          style={{
            display: "flex",

            justifyContent:
              index % 2 === 0
                ? "flex-end"
                : "flex-start"
          }}
        >
          <LessonNode
            lesson={lesson}
            state={getLessonState(progress, lesson.id)}
            onLessonAttempt={onLessonAttempt}
          />
        </div>

      ))}
    </div>
  );
}

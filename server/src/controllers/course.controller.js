import {
  getPublishedCourseBySlug,
  getPublishedCourses,
  getPublishedLessonById,
} from "../services/course.service.js";

export async function getCourses(req, res, next) {
  try {
    const courses = await getPublishedCourses();

    return res.json({
      courses,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCourse(req, res, next) {
  try {
    const course = await getPublishedCourseBySlug(req.params.slug);

    if (!course) {
      return res.status(404).json({
        error: "Course not found",
      });
    }

    return res.json({
      course,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getLesson(req, res, next) {
  try {
    const lesson = await getPublishedLessonById(req.params.lessonId);

    if (!lesson) {
      return res.status(404).json({
        error: "Lesson not found",
      });
    }

    // Current client-side lesson flow still needs correct answers. This is not
    // anti-cheat protection; server-side answer checking should replace it later.
    return res.json({
      lesson,
    });
  } catch (error) {
    return next(error);
  }
}

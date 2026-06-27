import {
  getAllLessons,
  getLessonById
} from "./courseHelpers";

const lessons = getAllLessons();

export {
  getLessonById,
  lessons
};

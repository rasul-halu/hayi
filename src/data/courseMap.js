import { getAllLessons } from "./courseHelpers";

export const courseMap = getAllLessons().map(
  lesson => ({
    id: lesson.id,
    title: lesson.title
  })
);

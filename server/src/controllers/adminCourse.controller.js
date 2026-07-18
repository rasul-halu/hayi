import {
  createAdminChapter,
  createAdminLesson,
  createAdminQuestion,
  duplicateAdminLesson,
  duplicateAdminQuestion,
  getAdminChapterById,
  getAdminCourseById,
  getAdminCourses,
  getAdminLessonById,
  getAdminLessonPreviewById,
  getAdminLessons,
  getAdminQuestionById,
  updateAdminChapter,
  updateAdminLesson,
  updateAdminQuestion,
} from "../services/adminCourse.service.js";

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function isPlainObject(value) {
  return Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value);
}

function normalizeNullableString(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw createHttpError(400, `${fieldName} must be a string or null`);
  }

  return value;
}

function normalizeRequiredString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw createHttpError(400, `${fieldName} is required`);
  }

  return value.trim();
}

function normalizeInteger(value, fieldName, {
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
} = {}) {
  const numberValue = typeof value === "number"
    ? value
    : Number(value);

  if (!Number.isInteger(numberValue) || numberValue < min || numberValue > max) {
    throw createHttpError(400, `${fieldName} must be an integer`);
  }

  return numberValue;
}

function normalizeOptionalInteger(value, fieldName, options = {}) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return normalizeInteger(value, fieldName, options);
}

function normalizeBoolean(value, fieldName) {
  if (typeof value !== "boolean") {
    throw createHttpError(400, `${fieldName} must be a boolean`);
  }

  return value;
}

function normalizeJsonField(value, fieldName) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  try {
    JSON.stringify(value);
  } catch {
    throw createHttpError(400, `${fieldName} must be valid JSON`);
  }

  return value;
}

const QUESTION_TYPES = new Set([
  "translate",
  "multiple-choice",
  "multipleChoice",
  "listening",
  "fillBlank",
  "match",
  "buildSentence",
]);

function assertJsonArray(value, fieldName) {
  if (value !== null && value !== undefined && !Array.isArray(value)) {
    throw createHttpError(400, `${fieldName} must be an array or null`);
  }
}

function validateQuestionPayload(data) {
  if (!QUESTION_TYPES.has(data.type)) {
    throw createHttpError(400, "Unknown question type");
  }

  assertJsonArray(data.options, "options");
  assertJsonArray(data.pairs, "pairs");
  assertJsonArray(data.words, "words");
  assertJsonArray(data.newWords, "newWords");

  if (["translate", "multiple-choice", "multipleChoice", "listening", "fillBlank"].includes(data.type)) {
    assertJsonArray(data.options, "options");
  }

  if (data.type === "match") {
    assertJsonArray(data.pairs, "pairs");
  }

  if (data.type === "buildSentence") {
    assertJsonArray(data.words, "words");
  }

  return data;
}

function getChapterPatch(body) {
  if (!isPlainObject(body)) {
    throw createHttpError(400, "Invalid chapter data");
  }

  return {
    title: normalizeRequiredString(body.title, "title"),
    description: normalizeNullableString(body.description, "description"),
    order: normalizeInteger(body.order, "order"),
  };
}

function getChapterCreate(body) {
  if (!isPlainObject(body)) {
    throw createHttpError(400, "Invalid chapter data");
  }

  return {
    title: normalizeRequiredString(body.title, "title"),
    description: normalizeNullableString(body.description, "description"),
    order: normalizeOptionalInteger(body.order, "order"),
  };
}

function getLessonPatch(body) {
  if (!isPlainObject(body)) {
    throw createHttpError(400, "Invalid lesson data");
  }

  return {
    title: normalizeRequiredString(body.title, "title"),
    description: normalizeNullableString(body.description, "description"),
    order: normalizeInteger(body.order, "order"),
    xpReward: normalizeInteger(body.xpReward, "xpReward", {
      min: 0,
      max: 1000,
    }),
    isPublished: normalizeBoolean(body.isPublished, "isPublished"),
    imageUrl: normalizeNullableString(body.imageUrl, "imageUrl"),
  };
}

function getLessonCreate(body) {
  if (!isPlainObject(body)) {
    throw createHttpError(400, "Invalid lesson data");
  }

  return {
    title: normalizeRequiredString(body.title, "title"),
    description: normalizeNullableString(body.description, "description"),
    order: normalizeOptionalInteger(body.order, "order"),
    xpReward: body.xpReward === undefined
      ? 10
      : normalizeInteger(body.xpReward, "xpReward", {
          min: 0,
          max: 1000,
        }),
    isPublished: body.isPublished === undefined
      ? false
      : normalizeBoolean(body.isPublished, "isPublished"),
    imageUrl: normalizeNullableString(body.imageUrl, "imageUrl"),
  };
}

function getQuestionPatch(body) {
  if (!isPlainObject(body)) {
    throw createHttpError(400, "Invalid question JSON");
  }

  return validateQuestionPayload({
    type: normalizeRequiredString(body.type, "type"),
    order: normalizeInteger(body.order, "order"),
    prompt: normalizeNullableString(body.prompt, "prompt"),
    translation: normalizeNullableString(body.translation, "translation"),
    correctAnswer: normalizeNullableString(body.correctAnswer, "correctAnswer"),
    audioUrl: normalizeNullableString(body.audioUrl, "audioUrl"),
    characterImage: normalizeNullableString(body.characterImage, "characterImage"),
    explanation: normalizeNullableString(body.explanation, "explanation"),
    options: normalizeJsonField(body.options, "options"),
    pairs: normalizeJsonField(body.pairs, "pairs"),
    words: normalizeJsonField(body.words, "words"),
    newWords: normalizeJsonField(body.newWords, "newWords"),
    metadata: normalizeJsonField(body.metadata, "metadata"),
  });
}

function getQuestionCreate(body) {
  if (!isPlainObject(body)) {
    throw createHttpError(400, "Invalid question JSON");
  }

  return validateQuestionPayload({
    type: normalizeRequiredString(body.type, "type"),
    order: normalizeOptionalInteger(body.order, "order"),
    prompt: normalizeNullableString(body.prompt, "prompt"),
    translation: normalizeNullableString(body.translation, "translation"),
    correctAnswer: normalizeNullableString(body.correctAnswer, "correctAnswer"),
    audioUrl: normalizeNullableString(body.audioUrl, "audioUrl"),
    characterImage: normalizeNullableString(body.characterImage, "characterImage"),
    explanation: normalizeNullableString(body.explanation, "explanation"),
    options: normalizeJsonField(body.options, "options"),
    pairs: normalizeJsonField(body.pairs, "pairs"),
    words: normalizeJsonField(body.words, "words"),
    newWords: normalizeJsonField(body.newWords, "newWords"),
    metadata: normalizeJsonField(body.metadata, "metadata"),
  });
}

function handleAdminError(error, next) {
  if (error.code === "P2025") {
    return next(createHttpError(404, "Content item not found"));
  }

  if (error.code === "P2002") {
    return next(createHttpError(400, "Order or unique field already exists"));
  }

  return next(error);
}

export async function listAdminCourses(req, res, next) {
  try {
    const courses = await getAdminCourses();

    return res.json({
      courses,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminCourse(req, res, next) {
  try {
    const course = await getAdminCourseById(req.params.courseId);

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

export async function postAdminChapter(req, res, next) {
  try {
    const chapter = await createAdminChapter(
      req.params.courseId,
      getChapterCreate(req.body)
    );

    return res.status(201).json({
      created: true,
      chapter,
    });
  } catch (error) {
    return handleAdminError(error, next);
  }
}

export async function getAdminChapter(req, res, next) {
  try {
    const chapter = await getAdminChapterById(req.params.chapterId);

    if (!chapter) {
      return res.status(404).json({
        error: "Chapter not found",
      });
    }

    return res.json({
      chapter,
    });
  } catch (error) {
    return next(error);
  }
}

export async function patchAdminChapter(req, res, next) {
  try {
    const chapter = await updateAdminChapter(
      req.params.chapterId,
      getChapterPatch(req.body)
    );

    return res.json({
      saved: true,
      chapter,
    });
  } catch (error) {
    return handleAdminError(error, next);
  }
}

export async function postAdminLesson(req, res, next) {
  try {
    const lesson = await createAdminLesson(
      req.params.chapterId,
      getLessonCreate(req.body)
    );

    return res.status(201).json({
      created: true,
      lesson,
    });
  } catch (error) {
    return handleAdminError(error, next);
  }
}

export async function listAdminLessons(req, res, next) {
  try {
    const lessons = await getAdminLessons();

    return res.json({
      lessons,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminLesson(req, res, next) {
  try {
    const lesson = await getAdminLessonById(req.params.lessonId);

    if (!lesson) {
      return res.status(404).json({
        error: "Lesson not found",
      });
    }

    return res.json({
      lesson,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminLessonPreview(req, res, next) {
  try {
    const lesson = await getAdminLessonPreviewById(req.params.lessonId);

    if (!lesson) {
      return res.status(404).json({
        error: "Lesson not found",
      });
    }

    return res.json({
      lesson,
    });
  } catch (error) {
    return next(error);
  }
}

export async function patchAdminLesson(req, res, next) {
  try {
    const lesson = await updateAdminLesson(
      req.params.lessonId,
      getLessonPatch(req.body)
    );

    return res.json({
      saved: true,
      lesson,
    });
  } catch (error) {
    return handleAdminError(error, next);
  }
}

export async function postDuplicateAdminLesson(req, res, next) {
  try {
    const lesson = await duplicateAdminLesson(req.params.lessonId);

    return res.status(201).json({
      duplicated: true,
      lesson,
    });
  } catch (error) {
    return handleAdminError(error, next);
  }
}

export async function getAdminQuestion(req, res, next) {
  try {
    const question = await getAdminQuestionById(req.params.questionId);

    if (!question) {
      return res.status(404).json({
        error: "Question not found",
      });
    }

    return res.json({
      question,
    });
  } catch (error) {
    return next(error);
  }
}

export async function patchAdminQuestion(req, res, next) {
  try {
    const question = await updateAdminQuestion(
      req.params.questionId,
      getQuestionPatch(req.body)
    );

    return res.json({
      saved: true,
      question,
    });
  } catch (error) {
    return handleAdminError(error, next);
  }
}

export async function postAdminQuestion(req, res, next) {
  try {
    const question = await createAdminQuestion(
      req.params.lessonId,
      getQuestionCreate(req.body)
    );

    return res.status(201).json({
      created: true,
      question,
    });
  } catch (error) {
    return handleAdminError(error, next);
  }
}

export async function postDuplicateAdminQuestion(req, res, next) {
  try {
    const question = await duplicateAdminQuestion(req.params.questionId);

    return res.status(201).json({
      duplicated: true,
      question,
    });
  } catch (error) {
    return handleAdminError(error, next);
  }
}

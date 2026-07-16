import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  Plus,
  RefreshCw
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createAdminChapter,
  createAdminLesson,
  duplicateAdminLesson,
  getAdminCourses,
  hasTelegramAuthData,
  updateAdminChapter,
  updateAdminLesson
} from "../../api/apiClient";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";

const cardStyle = {
  background: "#FFFFFF",
  color: "#2D2D2D",
  border: "2px solid #E6E6E6",
  boxShadow: "0 6px 0 #D9D9D9"
};

const inputStyle = {
  width: "100%",
  minHeight: 46,
  boxSizing: "border-box",
  border: "2px solid #D9D9D9",
  borderRadius: 12,
  padding: "10px 12px",
  color: "#2D2D2D",
  background: "#FFFFFF",
  fontSize: 15,
  fontWeight: 800
};

const smallButtonStyle = {
  minHeight: 42,
  padding: "9px 10px",
  fontSize: 13
};

const emptyChapterForm = {
  title: "",
  description: "",
  order: ""
};

const emptyLessonForm = {
  title: "",
  description: "",
  order: "",
  xpReward: 10,
  isPublished: false,
  imageUrl: ""
};

function updateChapterInCourses(courses, updatedChapter) {
  return courses.map(course => ({
    ...course,
    chapters: (course.chapters || []).map(chapter =>
      chapter.id === updatedChapter.id
        ? {
            ...chapter,
            ...updatedChapter,
            lessons: chapter.lessons || []
          }
        : chapter
    )
  }));
}

function getOptionalNumber(value) {
  return value === "" || value === null || value === undefined
    ? undefined
    : Number(value);
}

export default function AdminCourses() {
  const navigate = useNavigate();
  const isTelegramMode = hasTelegramAuthData();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(isTelegramMode);
  const [error, setError] = useState("");
  const [editingChapterId, setEditingChapterId] = useState("");
  const [creatingChapterCourseId, setCreatingChapterCourseId] = useState("");
  const [creatingLessonChapterId, setCreatingLessonChapterId] = useState("");
  const [chapterForm, setChapterForm] = useState({
    title: "",
    description: "",
    order: 1
  });
  const [newChapterForm, setNewChapterForm] = useState(emptyChapterForm);
  const [newLessonForm, setNewLessonForm] = useState(emptyLessonForm);
  const [saveError, setSaveError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [savingAction, setSavingAction] = useState("");

  const loadCourses = useCallback(async () => {
    if (!isTelegramMode) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await getAdminCourses();
      setCourses(data.courses || []);
    } catch (loadError) {
      setCourses([]);
      setError(
        loadError.status === 403
          ? "У вас нет доступа к админке."
          : loadError.status === 401
            ? "Админка доступна только после входа через Telegram."
            : "Не удалось загрузить курсы."
      );
    } finally {
      setIsLoading(false);
    }
  }, [isTelegramMode]);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  function startEditChapter(chapter) {
    setEditingChapterId(chapter.id);
    setSaveError("");
    setActionMessage("");
    setChapterForm({
      title: chapter.title || "",
      description: chapter.description || "",
      order: chapter.order || 1
    });
  }

  function startCreateChapter(courseId) {
    setCreatingChapterCourseId(courseId);
    setCreatingLessonChapterId("");
    setSaveError("");
    setActionMessage("");
    setNewChapterForm(emptyChapterForm);
  }

  function startCreateLesson(chapterId) {
    setCreatingLessonChapterId(chapterId);
    setCreatingChapterCourseId("");
    setSaveError("");
    setActionMessage("");
    setNewLessonForm(emptyLessonForm);
  }

  async function saveChapter(chapterId) {
    setSavingAction(`chapter:${chapterId}`);
    setSaveError("");

    try {
      const data = await updateAdminChapter(chapterId, {
        title: chapterForm.title,
        description: chapterForm.description || null,
        order: Number(chapterForm.order)
      });

      setCourses(currentCourses =>
        updateChapterInCourses(currentCourses, data.chapter)
      );
      setEditingChapterId("");
      setActionMessage("Глава сохранена.");
    } catch (saveErrorValue) {
      setSaveError(saveErrorValue.message || "Не удалось сохранить главу.");
    } finally {
      setSavingAction("");
    }
  }

  async function saveNewChapter(courseId) {
    setSavingAction(`new-chapter:${courseId}`);
    setSaveError("");

    try {
      await createAdminChapter(courseId, {
        title: newChapterForm.title,
        description: newChapterForm.description || null,
        order: getOptionalNumber(newChapterForm.order)
      });

      setCreatingChapterCourseId("");
      setNewChapterForm(emptyChapterForm);
      setActionMessage("Глава создана.");
      await loadCourses();
    } catch (saveErrorValue) {
      setSaveError(saveErrorValue.message || "Не удалось создать главу.");
    } finally {
      setSavingAction("");
    }
  }

  async function saveNewLesson(chapterId) {
    setSavingAction(`new-lesson:${chapterId}`);
    setSaveError("");

    try {
      await createAdminLesson(chapterId, {
        title: newLessonForm.title,
        description: newLessonForm.description || null,
        order: getOptionalNumber(newLessonForm.order),
        xpReward: Number(newLessonForm.xpReward),
        isPublished: Boolean(newLessonForm.isPublished),
        imageUrl: newLessonForm.imageUrl || null
      });

      setCreatingLessonChapterId("");
      setNewLessonForm(emptyLessonForm);
      setActionMessage("Урок создан.");
      await loadCourses();
    } catch (saveErrorValue) {
      setSaveError(saveErrorValue.message || "Не удалось создать урок.");
    } finally {
      setSavingAction("");
    }
  }

  async function duplicateLesson(lessonId) {
    setSavingAction(`duplicate-lesson:${lessonId}`);
    setSaveError("");

    try {
      await duplicateAdminLesson(lessonId);
      setActionMessage("Урок продублирован как черновик.");
      await loadCourses();
    } catch (saveErrorValue) {
      setSaveError(saveErrorValue.message || "Не удалось дублировать урок.");
    } finally {
      setSavingAction("");
    }
  }

  async function toggleLessonPublished(lesson) {
    setSavingAction(`publish-lesson:${lesson.id}`);
    setSaveError("");

    try {
      await updateAdminLesson(lesson.id, {
        title: lesson.title,
        description: lesson.description || null,
        order: lesson.order,
        xpReward: lesson.xpReward,
        isPublished: !lesson.isPublished,
        imageUrl: lesson.imageUrl || null
      });

      setActionMessage(
        lesson.isPublished
          ? "Урок снят с публикации."
          : "Урок опубликован."
      );
      await loadCourses();
    } catch (saveErrorValue) {
      setSaveError(saveErrorValue.message || "Не удалось изменить публикацию.");
    } finally {
      setSavingAction("");
    }
  }

  if (!isTelegramMode) {
    return (
      <PageContainer style={{ background: "#F4F7F2", color: "#2D2D2D" }}>
        <AppCard style={{ ...cardStyle, textAlign: "center", fontWeight: 900 }}>
          Админка доступна только внутри Telegram.
        </AppCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer style={{ background: "#F4F7F2", color: "#2D2D2D" }}>
      <AppButton
        onClick={() => navigate("/admin")}
        variant="secondary"
        style={{ marginBottom: 18 }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <AppIcon icon={ArrowLeft} size={18} />
          Назад в админку
        </span>
      </AppButton>

      <SectionTitle
        title="Курсы и уроки"
        subtitle="Создание, дублирование и публикация учебного контента"
      />

      {isLoading ? (
        <AppCard style={{ ...cardStyle, marginTop: 18, textAlign: "center" }}>
          Загружаем курсы...
        </AppCard>
      ) : null}

      {error ? (
        <AppCard style={{ ...cardStyle, marginTop: 18, textAlign: "center" }}>
          <div style={{ fontWeight: 900, marginBottom: 12 }}>{error}</div>
          <AppButton onClick={loadCourses} variant="secondary">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <AppIcon icon={RefreshCw} size={18} />
              Повторить
            </span>
          </AppButton>
        </AppCard>
      ) : null}

      {actionMessage ? (
        <AppCard
          style={{
            ...cardStyle,
            marginTop: 18,
            borderColor: "#CFE2C4",
            color: "#46A400",
            fontWeight: 900
          }}
        >
          {actionMessage}
        </AppCard>
      ) : null}

      {saveError ? (
        <AppCard
          style={{
            ...cardStyle,
            marginTop: 18,
            borderColor: "#F2C8C8",
            color: "#D93025",
            fontWeight: 900
          }}
        >
          {saveError}
        </AppCard>
      ) : null}

      {!isLoading && !error && courses.length === 0 ? (
        <AppCard style={{ ...cardStyle, marginTop: 18, textAlign: "center" }}>
          Курсы пока не найдены.
        </AppCard>
      ) : null}

      {!isLoading && !error && courses.map(course => (
        <AppCard key={course.id} style={{ ...cardStyle, marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{course.title}</div>
              <div style={{ color: "#6F746B", fontWeight: 800, marginTop: 4 }}>
                {course.slug} · {course.language}
              </div>
            </div>
            <span
              style={{
                alignSelf: "flex-start",
                borderRadius: 999,
                padding: "6px 10px",
                background: course.isPublished ? "#E9F8DD" : "#F1F1F1",
                color: course.isPublished ? "#46A400" : "#6F746B",
                fontWeight: 900,
                fontSize: 12
              }}
            >
              {course.isPublished ? "published" : "draft"}
            </span>
          </div>

          <AppButton
            onClick={() => startCreateChapter(course.id)}
            variant="secondary"
            style={{ marginTop: 14 }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <AppIcon icon={Plus} size={18} />
              Добавить главу
            </span>
          </AppButton>

          {creatingChapterCourseId === course.id ? (
            <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
              <input
                value={newChapterForm.title}
                onChange={event =>
                  setNewChapterForm(form => ({
                    ...form,
                    title: event.target.value
                  }))
                }
                style={inputStyle}
                placeholder="Название главы"
              />
              <textarea
                value={newChapterForm.description}
                onChange={event =>
                  setNewChapterForm(form => ({
                    ...form,
                    description: event.target.value
                  }))
                }
                style={{ ...inputStyle, minHeight: 82, resize: "vertical" }}
                placeholder="Описание главы"
              />
              <input
                type="number"
                value={newChapterForm.order}
                onChange={event =>
                  setNewChapterForm(form => ({
                    ...form,
                    order: event.target.value
                  }))
                }
                style={inputStyle}
                placeholder="Порядок, можно оставить пустым"
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <AppButton
                  onClick={() => saveNewChapter(course.id)}
                  disabled={savingAction === `new-chapter:${course.id}`}
                >
                  Создать
                </AppButton>
                <AppButton
                  onClick={() => setCreatingChapterCourseId("")}
                  variant="secondary"
                >
                  Отмена
                </AppButton>
              </div>
            </div>
          ) : null}

          {(course.chapters || []).map(chapter => (
            <div
              key={chapter.id}
              style={{
                marginTop: 18,
                paddingTop: 18,
                borderTop: "2px solid #EFEFEF"
              }}
            >
              {editingChapterId === chapter.id ? (
                <div style={{ display: "grid", gap: 10 }}>
                  <input
                    value={chapterForm.title}
                    onChange={event =>
                      setChapterForm(form => ({
                        ...form,
                        title: event.target.value
                      }))
                    }
                    style={inputStyle}
                    placeholder="Название главы"
                  />
                  <textarea
                    value={chapterForm.description}
                    onChange={event =>
                      setChapterForm(form => ({
                        ...form,
                        description: event.target.value
                      }))
                    }
                    style={{ ...inputStyle, minHeight: 86, resize: "vertical" }}
                    placeholder="Описание главы"
                  />
                  <input
                    type="number"
                    value={chapterForm.order}
                    onChange={event =>
                      setChapterForm(form => ({
                        ...form,
                        order: event.target.value
                      }))
                    }
                    style={inputStyle}
                    placeholder="Порядок"
                  />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <AppButton
                      onClick={() => saveChapter(chapter.id)}
                      disabled={savingAction === `chapter:${chapter.id}`}
                    >
                      Сохранить
                    </AppButton>
                    <AppButton
                      onClick={() => setEditingChapterId("")}
                      variant="secondary"
                    >
                      Отмена
                    </AppButton>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "flex-start"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 18 }}>
                        {chapter.title}
                      </div>
                      <div style={{ marginTop: 4, color: "#6F746B", fontWeight: 800 }}>
                        {chapter.description || "Без описания"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => startEditChapter(chapter)}
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        border: "2px solid #D9D9D9",
                        background: "#FFFFFF",
                        color: "#4B4B4B"
                      }}
                      aria-label="Редактировать главу"
                    >
                      <AppIcon icon={Edit3} size={18} />
                    </button>
                  </div>

                  <AppButton
                    onClick={() => startCreateLesson(chapter.id)}
                    variant="secondary"
                    style={{ marginTop: 14 }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <AppIcon icon={Plus} size={18} />
                      Добавить урок
                    </span>
                  </AppButton>

                  {creatingLessonChapterId === chapter.id ? (
                    <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                      <input
                        value={newLessonForm.title}
                        onChange={event =>
                          setNewLessonForm(form => ({
                            ...form,
                            title: event.target.value
                          }))
                        }
                        style={inputStyle}
                        placeholder="Название урока"
                      />
                      <textarea
                        value={newLessonForm.description}
                        onChange={event =>
                          setNewLessonForm(form => ({
                            ...form,
                            description: event.target.value
                          }))
                        }
                        style={{ ...inputStyle, minHeight: 82, resize: "vertical" }}
                        placeholder="Описание урока"
                      />
                      <input
                        type="number"
                        value={newLessonForm.order}
                        onChange={event =>
                          setNewLessonForm(form => ({
                            ...form,
                            order: event.target.value
                          }))
                        }
                        style={inputStyle}
                        placeholder="Порядок, можно оставить пустым"
                      />
                      <input
                        type="number"
                        value={newLessonForm.xpReward}
                        onChange={event =>
                          setNewLessonForm(form => ({
                            ...form,
                            xpReward: event.target.value
                          }))
                        }
                        style={inputStyle}
                        placeholder="XP"
                      />
                      <label style={{ display: "flex", gap: 10, fontWeight: 900 }}>
                        <input
                          type="checkbox"
                          checked={newLessonForm.isPublished}
                          onChange={event =>
                            setNewLessonForm(form => ({
                              ...form,
                              isPublished: event.target.checked
                            }))
                          }
                          style={{ width: 22, height: 22 }}
                        />
                        Опубликовать сразу
                      </label>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <AppButton
                          onClick={() => saveNewLesson(chapter.id)}
                          disabled={savingAction === `new-lesson:${chapter.id}`}
                        >
                          Создать
                        </AppButton>
                        <AppButton
                          onClick={() => setCreatingLessonChapterId("")}
                          variant="secondary"
                        >
                          Отмена
                        </AppButton>
                      </div>
                    </div>
                  ) : null}

                  <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                    {(chapter.lessons || []).map(lesson => (
                      <div
                        key={lesson.id}
                        style={{
                          padding: 12,
                          borderRadius: 14,
                          border: "2px solid #EFEFEF",
                          background: "#FAFAFA"
                        }}
                      >
                        <div style={{ display: "grid", gap: 10 }}>
                          <div>
                            <div style={{ fontWeight: 900 }}>
                              {lesson.order}. {lesson.title}
                            </div>
                            <div
                              style={{
                                color: "#6F746B",
                                fontWeight: 800,
                                fontSize: 13,
                                marginTop: 3
                              }}
                            >
                              {lesson.description || "Без описания"}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                flexWrap: "wrap",
                                marginTop: 8,
                                fontSize: 12,
                                fontWeight: 900
                              }}
                            >
                              <span>{lesson.xpReward} XP</span>
                              <span style={{ color: lesson.isPublished ? "#46A400" : "#8A8A8A" }}>
                                {lesson.isPublished ? "published" : "draft"}
                              </span>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                              gap: 8
                            }}
                          >
                            <AppButton
                              onClick={() => navigate(`/admin/lessons/${lesson.id}`)}
                              variant="secondary"
                              style={smallButtonStyle}
                            >
                              <AppIcon icon={BookOpen} size={16} />
                            </AppButton>
                            <AppButton
                              onClick={() => duplicateLesson(lesson.id)}
                              variant="secondary"
                              style={smallButtonStyle}
                              disabled={savingAction === `duplicate-lesson:${lesson.id}`}
                            >
                              <AppIcon icon={Copy} size={16} />
                            </AppButton>
                            <AppButton
                              onClick={() => toggleLessonPublished(lesson)}
                              variant={lesson.isPublished ? "yellow" : "secondary"}
                              style={smallButtonStyle}
                              disabled={savingAction === `publish-lesson:${lesson.id}`}
                            >
                              <AppIcon icon={lesson.isPublished ? EyeOff : Eye} size={16} />
                            </AppButton>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}

          <div
            style={{
              marginTop: 18,
              color: "#58CC02",
              fontWeight: 900,
              display: "inline-flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <AppIcon icon={CheckCircle2} size={16} />
            Изменения сразу идут в backend API
          </div>
        </AppCard>
      ))}
    </PageContainer>
  );
}

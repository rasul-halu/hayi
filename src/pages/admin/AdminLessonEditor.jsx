import {
  ArrowLeft,
  Code2,
  Copy,
  Plus,
  RefreshCw,
  Save
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createAdminQuestion,
  duplicateAdminQuestion,
  getAdminLesson,
  hasTelegramAuthData,
  updateAdminLesson,
  updateAdminQuestion
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

const newQuestionTemplate = {
  type: "translate",
  order: null,
  prompt: "Что означает:",
  translation: null,
  correctAnswer: "",
  audioUrl: null,
  characterImage: null,
  explanation: null,
  options: ["", "", ""],
  pairs: null,
  words: null,
  newWords: [],
  metadata: null
};

function getEditableQuestionPayload(question) {
  return {
    type: question.type || "",
    order: question.order || 1,
    prompt: question.prompt ?? null,
    translation: question.translation ?? null,
    correctAnswer: question.correctAnswer ?? null,
    audioUrl: question.audioUrl ?? null,
    characterImage: question.characterImage ?? null,
    explanation: question.explanation ?? null,
    options: question.options ?? null,
    pairs: question.pairs ?? null,
    words: question.words ?? null,
    newWords: question.newWords ?? null,
    metadata: question.metadata ?? null
  };
}

function sortQuestions(questions) {
  return [...(questions || [])].sort((left, right) => left.order - right.order);
}

export default function AdminLessonEditor() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const isTelegramMode = hasTelegramAuthData();
  const [lesson, setLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    order: 1,
    xpReward: 10,
    isPublished: false,
    imageUrl: ""
  });
  const [isLoading, setIsLoading] = useState(isTelegramMode);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSavingLesson, setIsSavingLesson] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);
  const [questionJson, setQuestionJson] = useState("");
  const [questionError, setQuestionError] = useState("");
  const [savingQuestionId, setSavingQuestionId] = useState("");

  const sortedQuestions = useMemo(
    () => sortQuestions(lesson?.questions),
    [lesson?.questions]
  );

  const loadLesson = useCallback(async () => {
    if (!isTelegramMode) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await getAdminLesson(lessonId);
      setLesson(data.lesson);
      setLessonForm({
        title: data.lesson.title || "",
        description: data.lesson.description || "",
        order: data.lesson.order || 1,
        xpReward: data.lesson.xpReward ?? 10,
        isPublished: Boolean(data.lesson.isPublished),
        imageUrl: data.lesson.imageUrl || ""
      });
    } catch (loadError) {
      setLesson(null);
      setError(
        loadError.status === 403
          ? "У вас нет доступа к админке."
          : loadError.status === 401
            ? "Админка доступна только после входа через Telegram."
            : loadError.status === 404
              ? "Урок не найден."
              : "Не удалось загрузить урок."
      );
    } finally {
      setIsLoading(false);
    }
  }, [isTelegramMode, lessonId]);

  useEffect(() => {
    void loadLesson();
  }, [loadLesson]);

  async function saveLesson() {
    setIsSavingLesson(true);
    setSaveError("");
    setSuccessMessage("");

    try {
      const data = await updateAdminLesson(lessonId, {
        title: lessonForm.title,
        description: lessonForm.description || null,
        order: Number(lessonForm.order),
        xpReward: Number(lessonForm.xpReward),
        isPublished: Boolean(lessonForm.isPublished),
        imageUrl: lessonForm.imageUrl || null
      });

      setLesson(data.lesson);
      setLessonForm({
        title: data.lesson.title || "",
        description: data.lesson.description || "",
        order: data.lesson.order || 1,
        xpReward: data.lesson.xpReward ?? 10,
        isPublished: Boolean(data.lesson.isPublished),
        imageUrl: data.lesson.imageUrl || ""
      });
      setSuccessMessage("Урок сохранён.");
    } catch (saveErrorValue) {
      setSaveError(saveErrorValue.message || "Не удалось сохранить урок.");
    } finally {
      setIsSavingLesson(false);
    }
  }

  function startQuestionEdit(question) {
    setEditingQuestion(question);
    setIsCreatingQuestion(false);
    setQuestionError("");
    setSuccessMessage("");
    setQuestionJson(
      JSON.stringify(getEditableQuestionPayload(question), null, 2)
    );
  }

  function startQuestionCreate() {
    setEditingQuestion(null);
    setIsCreatingQuestion(true);
    setQuestionError("");
    setSuccessMessage("");
    setQuestionJson(JSON.stringify(newQuestionTemplate, null, 2));
  }

  function closeQuestionEditor() {
    setEditingQuestion(null);
    setIsCreatingQuestion(false);
    setQuestionJson("");
    setQuestionError("");
  }

  function formatQuestionJson() {
    try {
      const parsed = JSON.parse(questionJson);
      setQuestionJson(JSON.stringify(parsed, null, 2));
      setQuestionError("");
    } catch {
      setQuestionError("JSON невалидный. Проверьте запятые, кавычки и скобки.");
    }
  }

  async function saveQuestion() {
    if (!editingQuestion && !isCreatingQuestion) {
      return;
    }

    let payload;

    try {
      payload = JSON.parse(questionJson);
    } catch {
      setQuestionError("JSON невалидный. Проверьте запятые, кавычки и скобки.");
      return;
    }

    setSavingQuestionId(editingQuestion?.id || "new");
    setQuestionError("");
    setSuccessMessage("");

    try {
      if (isCreatingQuestion) {
        await createAdminQuestion(lessonId, payload);
        setSuccessMessage("Вопрос создан.");
        closeQuestionEditor();
        await loadLesson();
      } else {
        const data = await updateAdminQuestion(editingQuestion.id, payload);
        setLesson(currentLesson => ({
          ...currentLesson,
          questions: sortQuestions(
            (currentLesson.questions || []).map(question =>
              question.id === data.question.id
                ? data.question
                : question
            )
          )
        }));
        setSuccessMessage("Вопрос сохранён.");
        closeQuestionEditor();
      }
    } catch (saveErrorValue) {
      setQuestionError(saveErrorValue.message || "Не удалось сохранить вопрос.");
    } finally {
      setSavingQuestionId("");
    }
  }

  async function duplicateQuestion(questionId) {
    setSavingQuestionId(`duplicate:${questionId}`);
    setQuestionError("");
    setSuccessMessage("");

    try {
      await duplicateAdminQuestion(questionId);
      setSuccessMessage("Вопрос продублирован.");
      await loadLesson();
    } catch (saveErrorValue) {
      setQuestionError(saveErrorValue.message || "Не удалось дублировать вопрос.");
    } finally {
      setSavingQuestionId("");
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
        onClick={() => navigate("/admin/courses")}
        variant="secondary"
        style={{ marginBottom: 18 }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <AppIcon icon={ArrowLeft} size={18} />
          Назад к курсам
        </span>
      </AppButton>

      <SectionTitle
        title={lesson?.title || "Редактор урока"}
        subtitle="Метаданные урока и JSON вопросов"
      />

      {isLoading ? (
        <AppCard style={{ ...cardStyle, marginTop: 18, textAlign: "center" }}>
          Загружаем урок...
        </AppCard>
      ) : null}

      {error ? (
        <AppCard style={{ ...cardStyle, marginTop: 18, textAlign: "center" }}>
          <div style={{ fontWeight: 900, marginBottom: 12 }}>{error}</div>
          <AppButton onClick={loadLesson} variant="secondary">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <AppIcon icon={RefreshCw} size={18} />
              Повторить
            </span>
          </AppButton>
        </AppCard>
      ) : null}

      {successMessage ? (
        <AppCard
          style={{
            ...cardStyle,
            marginTop: 18,
            borderColor: "#CFE2C4",
            color: "#46A400",
            fontWeight: 900
          }}
        >
          {successMessage}
        </AppCard>
      ) : null}

      {!isLoading && !error && lesson ? (
        <>
          <AppCard style={{ ...cardStyle, marginTop: 18 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "flex-start",
                marginBottom: 14
              }}
            >
              <div>
                <div style={{ color: "#6F746B", fontWeight: 900, fontSize: 13 }}>
                  legacyId: {lesson.legacyId || "нет"}
                </div>
                <div style={{ color: "#6F746B", fontWeight: 800, fontSize: 13 }}>
                  database id: {lesson.id}
                </div>
              </div>
              <span
                style={{
                  borderRadius: 999,
                  padding: "6px 10px",
                  background: lessonForm.isPublished ? "#E9F8DD" : "#F1F1F1",
                  color: lessonForm.isPublished ? "#46A400" : "#6F746B",
                  fontWeight: 900,
                  fontSize: 12
                }}
              >
                {lessonForm.isPublished ? "published" : "draft"}
              </span>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <input
                value={lessonForm.title}
                onChange={event =>
                  setLessonForm(form => ({ ...form, title: event.target.value }))
                }
                style={inputStyle}
                placeholder="Название урока"
              />
              <textarea
                value={lessonForm.description}
                onChange={event =>
                  setLessonForm(form => ({
                    ...form,
                    description: event.target.value
                  }))
                }
                style={{ ...inputStyle, minHeight: 96, resize: "vertical" }}
                placeholder="Описание урока"
              />
              <input
                type="number"
                value={lessonForm.order}
                onChange={event =>
                  setLessonForm(form => ({ ...form, order: event.target.value }))
                }
                style={inputStyle}
                placeholder="Порядок"
              />
              <input
                type="number"
                value={lessonForm.xpReward}
                onChange={event =>
                  setLessonForm(form => ({
                    ...form,
                    xpReward: event.target.value
                  }))
                }
                style={inputStyle}
                placeholder="XP"
              />
              <input
                value={lessonForm.imageUrl}
                onChange={event =>
                  setLessonForm(form => ({
                    ...form,
                    imageUrl: event.target.value
                  }))
                }
                style={inputStyle}
                placeholder="Image URL"
              />
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontWeight: 900
                }}
              >
                <input
                  type="checkbox"
                  checked={lessonForm.isPublished}
                  onChange={event =>
                    setLessonForm(form => ({
                      ...form,
                      isPublished: event.target.checked
                    }))
                  }
                  style={{ width: 22, height: 22 }}
                />
                Опубликован
              </label>

              {saveError ? (
                <div style={{ color: "#D93025", fontWeight: 900 }}>
                  {saveError}
                </div>
              ) : null}

              <AppButton onClick={saveLesson} disabled={isSavingLesson}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <AppIcon icon={Save} size={18} />
                  Сохранить урок
                </span>
              </AppButton>
            </div>
          </AppCard>

          <SectionTitle
            title="Вопросы"
            subtitle="Создание и редактирование структуры через JSON"
            style={{ marginTop: 26 }}
          />

          <AppButton
            onClick={startQuestionCreate}
            variant="secondary"
            style={{ marginTop: 12 }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <AppIcon icon={Plus} size={18} />
              Добавить вопрос
            </span>
          </AppButton>

          {isCreatingQuestion ? (
            <QuestionJsonEditor
              title="Новый вопрос"
              value={questionJson}
              error={questionError}
              isSaving={savingQuestionId === "new"}
              onChange={setQuestionJson}
              onSave={saveQuestion}
              onCancel={closeQuestionEditor}
              onFormat={formatQuestionJson}
            />
          ) : null}

          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {sortedQuestions.length === 0 ? (
              <AppCard style={{ ...cardStyle, textAlign: "center" }}>
                В этом уроке пока нет вопросов.
              </AppCard>
            ) : null}

            {sortedQuestions.map(question => (
              <AppCard key={question.id} style={cardStyle}>
                <div style={{ display: "grid", gap: 8 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      alignItems: "flex-start"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 900 }}>
                        {question.order}. {question.type}
                      </div>
                      <div style={{ color: "#6F746B", fontWeight: 800, marginTop: 4 }}>
                        {question.prompt || "Без prompt"}
                      </div>
                    </div>
                  </div>
                  <div style={{ color: "#2D2D2D", fontWeight: 800, fontSize: 13 }}>
                    Ответ: {question.correctAnswer || "не задан"}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8
                    }}
                  >
                    <AppButton
                      onClick={() => startQuestionEdit(question)}
                      variant="secondary"
                      style={{ minHeight: 44, padding: "10px 12px", fontSize: 14 }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <AppIcon icon={Code2} size={16} />
                        JSON
                      </span>
                    </AppButton>
                    <AppButton
                      onClick={() => duplicateQuestion(question.id)}
                      variant="secondary"
                      style={{ minHeight: 44, padding: "10px 12px", fontSize: 14 }}
                      disabled={savingQuestionId === `duplicate:${question.id}`}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <AppIcon icon={Copy} size={16} />
                        Дублировать
                      </span>
                    </AppButton>
                  </div>
                </div>

                {editingQuestion?.id === question.id ? (
                  <QuestionJsonEditor
                    title="Редактирование вопроса"
                    value={questionJson}
                    error={questionError}
                    isSaving={savingQuestionId === question.id}
                    onChange={setQuestionJson}
                    onSave={saveQuestion}
                    onCancel={closeQuestionEditor}
                    onFormat={formatQuestionJson}
                  />
                ) : null}
              </AppCard>
            ))}
          </div>
        </>
      ) : null}
    </PageContainer>
  );
}

function QuestionJsonEditor({
  title,
  value,
  error,
  isSaving,
  onChange,
  onSave,
  onCancel,
  onFormat
}) {
  return (
    <AppCard style={{ ...cardStyle, marginTop: 14 }}>
      <div style={{ fontWeight: 900, marginBottom: 10 }}>{title}</div>
      <textarea
        value={value}
        onChange={event => onChange(event.target.value)}
        spellCheck={false}
        style={{
          ...inputStyle,
          minHeight: 360,
          resize: "vertical",
          fontFamily: "Consolas, Monaco, 'Courier New', monospace",
          fontSize: 13,
          fontWeight: 700,
          lineHeight: 1.45,
          whiteSpace: "pre"
        }}
      />

      {error ? (
        <div style={{ color: "#D93025", fontWeight: 900, marginTop: 10 }}>
          {error}
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
        <AppButton onClick={onSave} disabled={isSaving}>
          Сохранить вопрос
        </AppButton>
        <AppButton onClick={onFormat} variant="secondary">
          Форматировать JSON
        </AppButton>
        <AppButton onClick={onCancel} variant="secondary" disabled={isSaving}>
          Отмена
        </AppButton>
      </div>
    </AppCard>
  );
}

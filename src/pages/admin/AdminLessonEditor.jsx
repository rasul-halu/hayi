import {
  ArrowLeft,
  Code2,
  Copy,
  Eye,
  Plus,
  RefreshCw,
  Save,
  Trash2
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
import MediaUploader from "../../components/admin/MediaUploader";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";

const QUESTION_TYPES = [
  "translate",
  "multiple-choice",
  "listening",
  "fillBlank",
  "match",
  "buildSentence"
];

const TYPE_LABELS = {
  translate: "Перевод",
  "multiple-choice": "Выбор ответа",
  listening: "Аудирование",
  fillBlank: "Пропуск",
  match: "Сопоставление",
  buildSentence: "Собрать предложение"
};

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

const compactButtonStyle = {
  minHeight: 40,
  padding: "8px 10px",
  fontSize: 13
};

function sortQuestions(questions) {
  return [...(questions || [])].sort((left, right) => left.order - right.order);
}

function createEmptyQuestionForm() {
  return {
    type: "translate",
    order: "",
    prompt: "Что означает:",
    questionText: "",
    translation: "",
    sentence: "",
    correctAnswer: "",
    explanation: "",
    audioUrl: "",
    characterImage: "",
    options: ["", "", ""],
    pairs: [
      { word: "", translation: "" },
      { word: "", translation: "" }
    ],
    words: [],
    newWords: [],
    metadata: {}
  };
}

function questionToForm(question) {
  const metadata = question?.metadata || {};

  return {
    type: question?.type || "translate",
    order: question?.order || "",
    prompt: question?.prompt || "",
    questionText: metadata.question || question?.translation || "",
    translation: question?.translation || "",
    sentence: metadata.sentence || "",
    correctAnswer: question?.correctAnswer || "",
    explanation: question?.explanation || "",
    audioUrl: question?.audioUrl || "",
    characterImage: question?.characterImage || "",
    options: Array.isArray(question?.options)
      ? question.options
      : ["", "", ""],
    pairs: normalizePairs(question?.pairs),
    words: Array.isArray(question?.words)
      ? question.words
      : [],
    newWords: normalizeNewWords(question?.newWords),
    metadata
  };
}

function normalizePairs(pairs) {
  if (!Array.isArray(pairs) || pairs.length === 0) {
    return [
      { word: "", translation: "" },
      { word: "", translation: "" }
    ];
  }

  return pairs.map(pair => ({
    word: pair.word || pair.left || "",
    translation: pair.translation || pair.right || ""
  }));
}

function normalizeNewWords(newWords) {
  if (!Array.isArray(newWords)) {
    return [];
  }

  return newWords.map(word => {
    if (typeof word === "string") {
      return {
        text: word,
        translation: ""
      };
    }

    return {
      text: word?.text || "",
      translation: word?.translation || ""
    };
  });
}

function cleanString(value) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function cleanStringArray(values) {
  return (values || [])
    .map(value => typeof value === "string" ? value.trim() : "")
    .filter(Boolean);
}

function formToPayload(form) {
  const metadata = {
    ...(form.metadata || {})
  };

  if (form.questionText.trim()) {
    metadata.question = form.questionText.trim();
  } else {
    delete metadata.question;
  }

  if (form.sentence.trim()) {
    metadata.sentence = form.sentence.trim();
  } else {
    delete metadata.sentence;
  }

  if (form.type === "buildSentence" && form.correctAnswer.trim()) {
    metadata.targetSentence = form.correctAnswer.trim();
  }

  const pairs = form.type === "match"
    ? form.pairs
        .map(pair => ({
          word: pair.word.trim(),
          translation: pair.translation.trim()
        }))
        .filter(pair => pair.word && pair.translation)
    : null;

  const words = form.type === "buildSentence"
    ? cleanStringArray(form.words)
    : null;

  const options = [
    "translate",
    "multiple-choice",
    "listening",
    "fillBlank"
  ].includes(form.type)
    ? cleanStringArray(form.options)
    : null;

  const newWords = form.newWords
    .map(word => ({
      text: word.text.trim(),
      translation: word.translation.trim()
    }))
    .filter(word => word.text);

  return {
    type: form.type,
    order: form.order === "" || form.order === null
      ? null
      : Number(form.order),
    prompt: cleanString(form.prompt),
    translation: cleanString(form.translation),
    correctAnswer: cleanString(form.correctAnswer),
    audioUrl: cleanString(form.audioUrl),
    characterImage: cleanString(form.characterImage),
    explanation: cleanString(form.explanation),
    options,
    pairs,
    words,
    newWords,
    metadata: Object.keys(metadata).length > 0
      ? metadata
      : null
  };
}

function validateQuestionForm(form) {
  const errors = [];
  const payload = formToPayload(form);

  if (!QUESTION_TYPES.includes(form.type)) {
    errors.push("Выберите тип вопроса.");
  }

  if (["translate", "multiple-choice", "listening", "fillBlank", "buildSentence"].includes(form.type) && !payload.correctAnswer) {
    errors.push("Укажите правильный ответ.");
  }

  if (["translate", "multiple-choice", "listening", "fillBlank"].includes(form.type)) {
    if (!Array.isArray(payload.options) || payload.options.length < 2) {
      errors.push("Добавьте минимум два варианта ответа.");
    }

    if (payload.correctAnswer && !payload.options.includes(payload.correctAnswer)) {
      errors.push("Правильный ответ должен совпадать с одним из вариантов.");
    }
  }

  if (form.type === "listening" && !payload.audioUrl) {
    errors.push("Аудио пока не указано. Сохранить можно, но в уроке будет placeholder.");
  }

  if (form.type === "fillBlank") {
    if (!form.sentence.includes("___")) {
      errors.push("Предложение должно содержать пропуск: ___.");
    }
  }

  if (form.type === "match") {
    if (!Array.isArray(payload.pairs) || payload.pairs.length < 2) {
      errors.push("Добавьте минимум две пары для сопоставления.");
    }
  }

  if (form.type === "buildSentence") {
    if (!Array.isArray(payload.words) || payload.words.length === 0) {
      errors.push("Добавьте слова для сборки предложения.");
    }
  }

  return {
    errors,
    payload
  };
}

function applyTypeTemplate(form, nextType) {
  const nextForm = {
    ...form,
    type: nextType
  };

  if (nextType === "listening" && !nextForm.prompt) {
    nextForm.prompt = "Что ты слышишь?";
  }

  if (nextType === "fillBlank" && !nextForm.sentence) {
    nextForm.sentence = "Салам, ___!";
  }

  if (nextType === "match" && nextForm.pairs.length < 2) {
    nextForm.pairs = [
      { word: "", translation: "" },
      { word: "", translation: "" }
    ];
  }

  if (nextType === "buildSentence" && nextForm.words.length === 0 && nextForm.correctAnswer) {
    nextForm.words = nextForm.correctAnswer.split(/\s+/).filter(Boolean);
  }

  return nextForm;
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
    setSuccessMessage("");
  }

  function startQuestionCreate() {
    setEditingQuestion(null);
    setIsCreatingQuestion(true);
    setSuccessMessage("");
  }

  function closeQuestionEditor() {
    setEditingQuestion(null);
    setIsCreatingQuestion(false);
  }

  async function saveQuestionPayload(payload) {
    setSavingQuestionId(editingQuestion?.id || "new");
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
    } finally {
      setSavingQuestionId("");
    }
  }

  async function duplicateQuestion(questionId) {
    setSavingQuestionId(`duplicate:${questionId}`);
    setSuccessMessage("");

    try {
      await duplicateAdminQuestion(questionId);
      setSuccessMessage("Вопрос продублирован.");
      await loadLesson();
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
        subtitle="Метаданные урока и визуальный редактор вопросов"
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
          <LessonSettingsCard
            lesson={lesson}
            form={lessonForm}
            setForm={setLessonForm}
            error={saveError}
            isSaving={isSavingLesson}
            onSave={saveLesson}
            onPreview={() => navigate(`/admin/lessons/${lesson.id}/preview`)}
          />

          <SectionTitle
            title="Вопросы"
            subtitle="Форма для обычной работы, JSON для продвинутого редактирования"
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
            <QuestionEditor
              key="new-question"
              title="Новый вопрос"
              question={null}
              isSaving={savingQuestionId === "new"}
              onCancel={closeQuestionEditor}
              onSave={saveQuestionPayload}
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
                        {question.order}. {TYPE_LABELS[question.type] || question.type}
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
                      style={compactButtonStyle}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <AppIcon icon={Code2} size={16} />
                        Редактировать
                      </span>
                    </AppButton>
                    <AppButton
                      onClick={() => duplicateQuestion(question.id)}
                      variant="secondary"
                      style={compactButtonStyle}
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
                  <QuestionEditor
                    key={question.id}
                    title="Редактирование вопроса"
                    question={question}
                    isSaving={savingQuestionId === question.id}
                    onCancel={closeQuestionEditor}
                    onSave={saveQuestionPayload}
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

function LessonSettingsCard({
  lesson,
  form,
  setForm,
  error,
  isSaving,
  onSave,
  onPreview
}) {
  return (
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
            background: form.isPublished ? "#E9F8DD" : "#F1F1F1",
            color: form.isPublished ? "#46A400" : "#6F746B",
            fontWeight: 900,
            fontSize: 12
          }}
        >
          {form.isPublished ? "published" : "draft"}
        </span>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <input
          value={form.title}
          onChange={event =>
            setForm(current => ({ ...current, title: event.target.value }))
          }
          style={inputStyle}
          placeholder="Название урока"
        />
        <textarea
          value={form.description}
          onChange={event =>
            setForm(current => ({ ...current, description: event.target.value }))
          }
          style={{ ...inputStyle, minHeight: 96, resize: "vertical" }}
          placeholder="Описание урока"
        />
        <input
          type="number"
          value={form.order}
          onChange={event =>
            setForm(current => ({ ...current, order: event.target.value }))
          }
          style={inputStyle}
          placeholder="Порядок"
        />
        <input
          type="number"
          value={form.xpReward}
          onChange={event =>
            setForm(current => ({ ...current, xpReward: event.target.value }))
          }
          style={inputStyle}
          placeholder="XP"
        />
        <MediaUploader
          type="image"
          label="Изображение урока"
          value={form.imageUrl}
          onChange={value =>
            setForm(current => ({ ...current, imageUrl: value }))
          }
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
            checked={form.isPublished}
            onChange={event =>
              setForm(current => ({
                ...current,
                isPublished: event.target.checked
              }))
            }
            style={{ width: 22, height: 22 }}
          />
          Опубликован
        </label>

        {error ? (
          <div style={{ color: "#D93025", fontWeight: 900 }}>{error}</div>
        ) : null}

        <AppButton onClick={onSave} disabled={isSaving}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <AppIcon icon={Save} size={18} />
            Сохранить урок
          </span>
        </AppButton>
        <AppButton onClick={onPreview} variant="secondary">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <AppIcon icon={Eye} size={18} />
            Предпросмотр урока
          </span>
        </AppButton>
      </div>
    </AppCard>
  );
}

function QuestionEditor({
  title,
  question,
  isSaving,
  onCancel,
  onSave
}) {
  const [mode, setMode] = useState("form");
  const [form, setForm] = useState(() =>
    question ? questionToForm(question) : createEmptyQuestionForm()
  );
  const [jsonValue, setJsonValue] = useState(() =>
    JSON.stringify(
      formToPayload(question ? questionToForm(question) : createEmptyQuestionForm()),
      null,
      2
    )
  );
  const [editorError, setEditorError] = useState("");

  function openJsonMode() {
    setJsonValue(JSON.stringify(formToPayload(form), null, 2));
    setEditorError("");
    setMode("json");
  }

  async function saveFromForm() {
    const { errors, payload } = validateQuestionForm(form);
    const blockingErrors = errors.filter(error =>
      !error.startsWith("Аудио пока")
    );

    if (blockingErrors.length > 0) {
      setEditorError(blockingErrors.join(" "));
      return;
    }

    setEditorError("");
    await onSave(payload);
  }

  async function saveFromJson() {
    try {
      const parsed = JSON.parse(jsonValue);
      setEditorError("");
      await onSave(parsed);
    } catch {
      setEditorError("JSON невалидный. Проверьте запятые, кавычки и скобки.");
    }
  }

  function formatJson() {
    try {
      setJsonValue(JSON.stringify(JSON.parse(jsonValue), null, 2));
      setEditorError("");
    } catch {
      setEditorError("JSON невалидный. Проверьте запятые, кавычки и скобки.");
    }
  }

  const validation = validateQuestionForm(form);
  const warnings = validation.errors.filter(error =>
    error.startsWith("Аудио пока")
  );

  return (
    <AppCard style={{ ...cardStyle, marginTop: 14 }}>
      <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 12 }}>
        {title}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 8,
          marginBottom: 14
        }}
      >
        <TabButton active={mode === "form"} onClick={() => setMode("form")}>
          Форма
        </TabButton>
        <TabButton active={mode === "json"} onClick={openJsonMode}>
          JSON
        </TabButton>
        <TabButton active={mode === "preview"} onClick={() => setMode("preview")}>
          Preview
        </TabButton>
      </div>

      {mode === "form" ? (
        <>
          <QuestionForm form={form} setForm={setForm} />
          {warnings.map(warning => (
            <div
              key={warning}
              style={{
                marginTop: 10,
                color: "#9A5600",
                fontWeight: 900
              }}
            >
              {warning}
            </div>
          ))}
        </>
      ) : null}

      {mode === "json" ? (
        <>
          <div
            style={{
              marginBottom: 10,
              color: "#9A5600",
              fontWeight: 900,
              lineHeight: 1.35
            }}
          >
            Для продвинутого редактирования. Не добавляйте id, lessonId,
            createdAt или updatedAt.
          </div>
          <textarea
            value={jsonValue}
            onChange={event => setJsonValue(event.target.value)}
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
        </>
      ) : null}

      {mode === "preview" ? (
        <QuestionPreview form={form} />
      ) : null}

      {editorError ? (
        <div style={{ color: "#D93025", fontWeight: 900, marginTop: 10 }}>
          {editorError}
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <AppButton
          onClick={mode === "json" ? saveFromJson : saveFromForm}
          disabled={isSaving}
        >
          Сохранить вопрос
        </AppButton>
        {mode === "json" ? (
          <AppButton onClick={formatJson} variant="secondary">
            Форматировать JSON
          </AppButton>
        ) : null}
        <AppButton onClick={onCancel} variant="secondary" disabled={isSaving}>
          Отмена
        </AppButton>
      </div>
    </AppCard>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 42,
        borderRadius: 12,
        border: active ? "2px solid #58CC02" : "2px solid #D9D9D9",
        background: active ? "#E9F8DD" : "#FFFFFF",
        color: active ? "#46A400" : "#4B4B4B",
        fontWeight: 900
      }}
    >
      {children}
    </button>
  );
}

function QuestionForm({ form, setForm }) {
  const update = (field, value) => {
    setForm(current => ({
      ...current,
      [field]: value
    }));
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <label style={{ display: "grid", gap: 6, fontWeight: 900 }}>
        Тип
        <select
          value={form.type}
          onChange={event =>
            setForm(current => applyTypeTemplate(current, event.target.value))
          }
          style={inputStyle}
        >
          {QUESTION_TYPES.map(type => (
            <option key={type} value={type}>
              {TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </label>

      <FormInput
        label="Порядок"
        type="number"
        value={form.order}
        onChange={value => update("order", value)}
      />

      <FormTextarea
        label="Prompt"
        value={form.prompt}
        onChange={value => update("prompt", value)}
      />

      {["translate", "multiple-choice", "buildSentence"].includes(form.type) ? (
        <FormInput
          label="Текст вопроса"
          value={form.questionText}
          onChange={value => update("questionText", value)}
          placeholder="Например: Салам"
        />
      ) : null}

      {form.type === "fillBlank" ? (
        <FormTextarea
          label="Предложение с пропуском"
          value={form.sentence}
          onChange={value => update("sentence", value)}
          placeholder="Салам, ___!"
        />
      ) : null}

      <FormInput
        label="Правильный ответ"
        value={form.correctAnswer}
        onChange={value => update("correctAnswer", value)}
      />

      <FormTextarea
        label="Translation"
        value={form.translation}
        onChange={value => update("translation", value)}
      />

      <FormTextarea
        label="Explanation"
        value={form.explanation}
        onChange={value => update("explanation", value)}
      />

      {["listening", "buildSentence"].includes(form.type) ? (
        <MediaUploader
          type="audio"
          label={form.type === "buildSentence"
            ? "Озвучка предложения"
            : "Аудио вопроса"}
          helperText={form.type === "buildSentence"
            ? "Загрузите запись правильного предложения целиком"
            : "Загрузите запись для задания на аудирование"}
          value={form.audioUrl}
          onChange={value => update("audioUrl", value)}
        />
      ) : null}

      <MediaUploader
        type="image"
        label="Изображение персонажа"
        value={form.characterImage}
        onChange={value => update("characterImage", value)}
      />

      {["translate", "multiple-choice", "listening", "fillBlank"].includes(form.type) ? (
        <OptionsEditor
          options={form.options}
          correctAnswer={form.correctAnswer}
          setOptions={options => update("options", options)}
          setCorrectAnswer={value => update("correctAnswer", value)}
        />
      ) : null}

      {form.type === "match" ? (
        <PairsEditor
          pairs={form.pairs}
          setPairs={pairs => update("pairs", pairs)}
        />
      ) : null}

      {form.type === "buildSentence" ? (
        <WordsEditor
          words={form.words}
          correctAnswer={form.correctAnswer}
          setWords={words => update("words", words)}
        />
      ) : null}

      <NewWordsEditor
        newWords={form.newWords}
        setNewWords={newWords => update("newWords", newWords)}
      />
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <label style={{ display: "grid", gap: 6, fontWeight: 900 }}>
      {label}
      <input
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        style={inputStyle}
        placeholder={placeholder}
      />
    </label>
  );
}

function FormTextarea({ label, value, onChange, placeholder = "" }) {
  return (
    <label style={{ display: "grid", gap: 6, fontWeight: 900 }}>
      {label}
      <textarea
        value={value}
        onChange={event => onChange(event.target.value)}
        style={{ ...inputStyle, minHeight: 82, resize: "vertical" }}
        placeholder={placeholder}
      />
    </label>
  );
}

function OptionsEditor({
  options,
  correctAnswer,
  setOptions,
  setCorrectAnswer
}) {
  const normalizedOptions = options.length > 0 ? options : [""];

  function updateOption(index, value) {
    setOptions(normalizedOptions.map((option, optionIndex) =>
      optionIndex === index ? value : option
    ));
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ fontWeight: 900 }}>Варианты ответа</div>
      {normalizedOptions.map((option, index) => (
        <div
          key={index}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 8
          }}
        >
          <input
            value={option}
            onChange={event => updateOption(index, event.target.value)}
            style={inputStyle}
            placeholder={`Вариант ${index + 1}`}
          />
          <button
            type="button"
            onClick={() =>
              setOptions(normalizedOptions.filter((_, optionIndex) => optionIndex !== index))
            }
            style={iconButtonStyle}
            aria-label="Удалить вариант"
          >
            <AppIcon icon={Trash2} size={18} />
          </button>
          <AppButton
            onClick={() => setCorrectAnswer(option)}
            variant={correctAnswer === option && option ? "yellow" : "secondary"}
            style={{
              gridColumn: "1 / -1",
              ...compactButtonStyle
            }}
            disabled={!option}
          >
            Сделать правильным
          </AppButton>
        </div>
      ))}
      <AppButton
        onClick={() => setOptions([...normalizedOptions, ""])}
        variant="secondary"
        style={compactButtonStyle}
      >
        Добавить вариант
      </AppButton>
      {correctAnswer && !normalizedOptions.includes(correctAnswer) ? (
        <div style={{ color: "#9A5600", fontWeight: 900 }}>
          Правильный ответ не совпадает с вариантами.
        </div>
      ) : null}
    </div>
  );
}

function PairsEditor({ pairs, setPairs }) {
  const normalizedPairs = pairs.length > 0 ? pairs : [{ word: "", translation: "" }];

  function updatePair(index, field, value) {
    setPairs(normalizedPairs.map((pair, pairIndex) =>
      pairIndex === index
        ? { ...pair, [field]: value }
        : pair
    ));
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ fontWeight: 900 }}>Пары</div>
      {normalizedPairs.map((pair, index) => (
        <div key={index} style={{ display: "grid", gap: 8 }}>
          <input
            value={pair.word}
            onChange={event => updatePair(index, "word", event.target.value)}
            style={inputStyle}
            placeholder="Левая часть"
          />
          <input
            value={pair.translation}
            onChange={event => updatePair(index, "translation", event.target.value)}
            style={inputStyle}
            placeholder="Правая часть"
          />
          <AppButton
            onClick={() => setPairs(normalizedPairs.filter((_, pairIndex) => pairIndex !== index))}
            variant="secondary"
            style={compactButtonStyle}
          >
            Удалить пару
          </AppButton>
        </div>
      ))}
      <AppButton
        onClick={() => setPairs([...normalizedPairs, { word: "", translation: "" }])}
        variant="secondary"
        style={compactButtonStyle}
      >
        Добавить пару
      </AppButton>
    </div>
  );
}

function WordsEditor({ words, correctAnswer, setWords }) {
  const normalizedWords = words.length > 0 ? words : [""];

  function updateWord(index, value) {
    setWords(normalizedWords.map((word, wordIndex) =>
      wordIndex === index ? value : word
    ));
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ fontWeight: 900 }}>Слова для сборки</div>
      {normalizedWords.map((word, index) => (
        <div
          key={index}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 8
          }}
        >
          <input
            value={word}
            onChange={event => updateWord(index, event.target.value)}
            style={inputStyle}
            placeholder={`Слово ${index + 1}`}
          />
          <button
            type="button"
            onClick={() => setWords(normalizedWords.filter((_, wordIndex) => wordIndex !== index))}
            style={iconButtonStyle}
            aria-label="Удалить слово"
          >
            <AppIcon icon={Trash2} size={18} />
          </button>
        </div>
      ))}
      <div style={{ display: "grid", gap: 8 }}>
        <AppButton
          onClick={() => setWords([...normalizedWords, ""])}
          variant="secondary"
          style={compactButtonStyle}
        >
          Добавить слово
        </AppButton>
        <AppButton
          onClick={() => setWords(correctAnswer.split(/\s+/).filter(Boolean))}
          variant="secondary"
          style={compactButtonStyle}
          disabled={!correctAnswer.trim()}
        >
          Собрать words из correctAnswer
        </AppButton>
      </div>
    </div>
  );
}

function NewWordsEditor({ newWords, setNewWords }) {
  const normalizedWords = newWords.length > 0
    ? newWords
    : [];

  function updateWord(index, field, value) {
    setNewWords(normalizedWords.map((word, wordIndex) =>
      wordIndex === index
        ? { ...word, [field]: value }
        : word
    ));
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ fontWeight: 900 }}>Новые слова</div>
      {normalizedWords.map((word, index) => (
        <div key={index} style={{ display: "grid", gap: 8 }}>
          <input
            value={word.text}
            onChange={event => updateWord(index, "text", event.target.value)}
            style={inputStyle}
            placeholder="Слово"
          />
          <input
            value={word.translation}
            onChange={event => updateWord(index, "translation", event.target.value)}
            style={inputStyle}
            placeholder="Перевод"
          />
          <AppButton
            onClick={() => setNewWords(normalizedWords.filter((_, wordIndex) => wordIndex !== index))}
            variant="secondary"
            style={compactButtonStyle}
          >
            Удалить слово
          </AppButton>
        </div>
      ))}
      <AppButton
        onClick={() => setNewWords([...normalizedWords, { text: "", translation: "" }])}
        variant="secondary"
        style={compactButtonStyle}
      >
        Добавить слово
      </AppButton>
    </div>
  );
}

const iconButtonStyle = {
  width: 46,
  minHeight: 46,
  borderRadius: 12,
  border: "2px solid #D9D9D9",
  background: "#FFFFFF",
  color: "#4B4B4B"
};

function QuestionPreview({ form }) {
  const payload = formToPayload(form);

  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        background: "#F8FAF6",
        border: "2px solid #E6E6E6"
      }}
    >
      <div style={{ color: "#6F746B", fontWeight: 900, marginBottom: 8 }}>
        {TYPE_LABELS[form.type] || form.type}
      </div>
      <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 12 }}>
        {payload.prompt || "Без prompt"}
      </div>

      {["translate", "multiple-choice"].includes(form.type) ? (
        <>
          <PreviewMainText>{form.questionText || payload.translation || "Текст вопроса"}</PreviewMainText>
          <PreviewOptions options={payload.options} />
        </>
      ) : null}

      {form.type === "listening" ? (
        <>
          <PreviewMainText>{payload.audioUrl ? "Аудио указано" : "Аудио placeholder"}</PreviewMainText>
          <PreviewOptions options={payload.options} />
        </>
      ) : null}

      {form.type === "fillBlank" ? (
        <>
          <PreviewMainText>{form.sentence || "Предложение с ___"}</PreviewMainText>
          <PreviewOptions options={payload.options} />
        </>
      ) : null}

      {form.type === "match" ? (
        <div style={{ display: "grid", gap: 8 }}>
          {(payload.pairs || []).map((pair, index) => (
            <div
              key={`${pair.word}-${index}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8
              }}
            >
              <PreviewChip>{pair.word}</PreviewChip>
              <PreviewChip>{pair.translation}</PreviewChip>
            </div>
          ))}
        </div>
      ) : null}

      {form.type === "buildSentence" ? (
        <>
          <PreviewMainText>{form.questionText || "Фраза для перевода"}</PreviewMainText>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(payload.words || []).map((word, index) => (
              <PreviewChip key={`${word}-${index}`}>{word}</PreviewChip>
            ))}
          </div>
        </>
      ) : null}

      <div
        style={{
          marginTop: 12,
          color: "#46A400",
          fontWeight: 900,
          fontSize: 13
        }}
      >
        Admin hint: {payload.correctAnswer || "правильный ответ не задан"}
      </div>

      {payload.newWords?.length > 0 ? (
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {payload.newWords.map(word => (
            <PreviewChip key={word.text}>{word.text}</PreviewChip>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PreviewMainText({ children }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 16,
        background: "#FFFFFF",
        border: "2px solid #E6E6E6",
        color: "#4B4B4B",
        fontWeight: 900,
        fontSize: 20,
        marginBottom: 12
      }}
    >
      {children}
    </div>
  );
}

function PreviewOptions({ options }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {(options || []).map(option => (
        <PreviewChip key={option}>{option}</PreviewChip>
      ))}
    </div>
  );
}

function PreviewChip({ children }) {
  return (
    <div
      style={{
        minHeight: 42,
        padding: "10px 12px",
        borderRadius: 14,
        border: "2px solid #D9D9D9",
        background: "#FFFFFF",
        color: "#4B4B4B",
        fontWeight: 900,
        boxSizing: "border-box"
      }}
    >
      {children}
    </div>
  );
}

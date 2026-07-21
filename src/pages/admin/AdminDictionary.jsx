import {
  ArrowLeft,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Search,
  WholeWord
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createAdminDictionaryWord,
  getAdminDictionary,
  updateAdminDictionaryWord
} from "../../api/apiClient";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";

const EMPTY_FORM = {
  lezgian: "",
  russian: "",
  transcription: "",
  exampleLezgian: "",
  exampleRussian: "",
  audioUrl: "",
  imageUrl: "",
  category: "",
  order: 0,
  isPublished: false
};

function toForm(word) {
  return {
    lezgian: word?.lezgian || "",
    russian: word?.russian || "",
    transcription: word?.transcription || "",
    exampleLezgian: word?.exampleLezgian || "",
    exampleRussian: word?.exampleRussian || "",
    audioUrl: word?.audioUrl || "",
    imageUrl: word?.imageUrl || "",
    category: word?.category || "",
    order: Number.isInteger(Number(word?.order))
      ? Number(word.order)
      : 0,
    isPublished: Boolean(word?.isPublished)
  };
}

function toPayload(form) {
  return {
    ...form,
    order: Number(form.order) || 0,
    isPublished: Boolean(form.isPublished)
  };
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = ""
}) {
  return (
    <label
      style={{
        display: "grid",
        gap: 7,
        color: "#4B4B4B",
        fontSize: 13,
        fontWeight: 900
      }}
    >
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
        style={{
          width: "100%",
          minHeight: 48,
          boxSizing: "border-box",
          border: "2px solid #E6E6E6",
          borderRadius: 15,
          background: "#F8FAF6",
          color: "#2D2D2D",
          outline: "none",
          padding: "0 13px",
          fontSize: 15,
          fontWeight: 800
        }}
      />
    </label>
  );
}

export default function AdminDictionary() {
  const navigate = useNavigate();
  const [words, setWords] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingWord, setEditingWord] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadWords = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await getAdminDictionary();
      setWords(data.words || []);
    } catch (loadError) {
      setError(
        loadError.status === 403
          ? "Нет доступа к словарю."
          : "Не удалось загрузить словарь."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWords();
  }, [loadWords]);

  const filteredWords = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return words.filter(word => {
      if (filter === "published" && !word.isPublished) {
        return false;
      }

      if (filter === "draft" && word.isPublished) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        word.lezgian,
        word.russian,
        word.category,
        word.transcription
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [filter, search, words]);

  function updateForm(field, value) {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  }

  function startCreate() {
    setEditingWord(null);
    setForm(EMPTY_FORM);
    setSuccess("");
    setIsFormOpen(true);
  }

  function startEdit(word) {
    setEditingWord(word);
    setForm(toForm(word));
    setSuccess("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setEditingWord(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(false);
  }

  async function saveWord(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = toPayload(form);
      const data = editingWord
        ? await updateAdminDictionaryWord(editingWord.id, payload)
        : await createAdminDictionaryWord(payload);

      setWords(prev => {
        const exists = prev.some(word => word.id === data.word.id);
        const nextWords = exists
          ? prev.map(word =>
              word.id === data.word.id ? data.word : word
            )
          : [data.word, ...prev];

        return nextWords;
      });
      setSuccess(
        editingWord ? "Слово сохранено." : "Слово добавлено как черновик."
      );
      closeForm();
    } catch (saveError) {
      setError(saveError.message || "Не удалось сохранить слово.");
    } finally {
      setIsSaving(false);
    }
  }

  async function togglePublished(word) {
    setError("");
    setSuccess("");

    try {
      const data = await updateAdminDictionaryWord(word.id, {
        isPublished: !word.isPublished
      });

      setWords(prev =>
        prev.map(item =>
          item.id === data.word.id ? data.word : item
        )
      );
      setSuccess(
        data.word.isPublished
          ? "Слово опубликовано."
          : "Слово снято с публикации."
      );
    } catch (toggleError) {
      setError("Не удалось обновить публикацию.");
    }
  }

  return (
    <PageContainer
      style={{
        background: "#F4F7F2",
        color: "#2D2D2D"
      }}
    >
      <button
        type="button"
        onClick={() => navigate("/admin")}
        aria-label="Назад"
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          border: "2px solid #E3E6DF",
          background: "#FFFFFF",
          color: "#4B4B4B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 0 #D9D9D9",
          cursor: "pointer",
          marginBottom: 16
        }}
      >
        <AppIcon icon={ArrowLeft} size={22} />
      </button>

      <SectionTitle
        title="Словарь"
        subtitle="Добавляйте слова, черновики и опубликованные записи"
      />

      <AppButton
        onClick={startCreate}
        style={{ marginTop: 16 }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}
        >
          <AppIcon icon={Plus} size={20} />
          Добавить слово
        </span>
      </AppButton>

      {success ? (
        <AppCard
          style={{
            marginTop: 14,
            background: "#E9F8DD",
            color: "#46A400",
            border: "2px solid #BFE8A7",
            boxShadow: "0 5px 0 #BFE8A7",
            fontWeight: 900
          }}
        >
          {success}
        </AppCard>
      ) : null}

      {error ? (
        <AppCard
          style={{
            marginTop: 14,
            background: "#FFF0F0",
            color: "#D93B3B",
            border: "2px solid #FFD0D0",
            boxShadow: "0 5px 0 #F0B8B8",
            fontWeight: 900
          }}
        >
          {error}
        </AppCard>
      ) : null}

      {isFormOpen ? (
        <AppCard
          style={{
            marginTop: 16,
            background: "#FFFFFF",
            color: "#2D2D2D",
            border: "2px solid #E6E6E6",
            boxShadow: "0 6px 0 #D9D9D9"
          }}
        >
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>
            {editingWord ? "Редактировать слово" : "Новое слово"}
          </h2>

          <form
            onSubmit={saveWord}
            style={{
              display: "grid",
              gap: 12,
              marginTop: 14
            }}
          >
            <Field
              label="Лезгинское слово"
              value={form.lezgian}
              onChange={value => updateForm("lezgian", value)}
              placeholder="Салам"
            />
            <Field
              label="Перевод"
              value={form.russian}
              onChange={value => updateForm("russian", value)}
              placeholder="Привет"
            />
            <Field
              label="Транскрипция"
              value={form.transcription}
              onChange={value => updateForm("transcription", value)}
            />
            <Field
              label="Пример на лезгинском"
              value={form.exampleLezgian}
              onChange={value => updateForm("exampleLezgian", value)}
            />
            <Field
              label="Перевод примера"
              value={form.exampleRussian}
              onChange={value => updateForm("exampleRussian", value)}
            />
            <Field
              label="Категория"
              value={form.category}
              onChange={value => updateForm("category", value)}
              placeholder="Приветствия"
            />
            <Field
              label="Порядок"
              type="number"
              value={form.order}
              onChange={value => updateForm("order", value)}
            />
            <Field
              label="audioUrl"
              value={form.audioUrl}
              onChange={value => updateForm("audioUrl", value)}
              placeholder="/uploads/audio/salam.mp3"
            />
            <Field
              label="imageUrl"
              value={form.imageUrl}
              onChange={value => updateForm("imageUrl", value)}
              placeholder="/uploads/images/salam.png"
            />

            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: 14,
                borderRadius: 16,
                border: "2px solid #E6E6E6",
                background: "#F8FAF6",
                fontWeight: 900
              }}
            >
              Опубликовано
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={event =>
                  updateForm("isPublished", event.target.checked)
                }
              />
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10
              }}
            >
              <AppButton disabled={isSaving} type="submit">
                Сохранить
              </AppButton>
              <AppButton
                disabled={isSaving}
                onClick={closeForm}
                variant="secondary"
              >
                Отмена
              </AppButton>
            </div>
          </form>
        </AppCard>
      ) : null}

      <AppCard
        style={{
          marginTop: 16,
          background: "#FFFFFF",
          color: "#2D2D2D",
          border: "2px solid #E6E6E6",
          boxShadow: "0 6px 0 #D9D9D9",
          padding: 14
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#F7F8F5",
            border: "2px solid #E6E6E6",
            borderRadius: 16,
            padding: "0 14px"
          }}
        >
          <AppIcon icon={Search} size={20} color="#8A8A8A" />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Поиск..."
            style={{
              width: "100%",
              minHeight: 50,
              border: "none",
              outline: "none",
              background: "transparent",
              color: "#2D2D2D",
              fontSize: 16,
              fontWeight: 800
            }}
          />
        </label>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            marginTop: 12
          }}
        >
          {[
            ["all", "Все"],
            ["published", "Опубликованные"],
            ["draft", "Черновики"]
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              style={{
                minHeight: 42,
                borderRadius: 14,
                border: `2px solid ${
                  filter === value ? "#58CC02" : "#E6E6E6"
                }`,
                background: filter === value ? "#E9F8DD" : "#FFFFFF",
                color: filter === value ? "#46A400" : "#6F746B",
                fontWeight: 900,
                cursor: "pointer"
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </AppCard>

      <div style={{ marginTop: 16 }}>
        {isLoading ? (
          <AppCard
            style={{
              background: "#FFFFFF",
              border: "2px solid #E6E6E6",
              boxShadow: "0 6px 0 #D9D9D9",
              textAlign: "center",
              fontWeight: 900
            }}
          >
            Загружаем словарь...
          </AppCard>
        ) : null}

        {!isLoading && filteredWords.length === 0 ? (
          <AppCard
            style={{
              background: "#FFFFFF",
              border: "2px solid #E6E6E6",
              boxShadow: "0 6px 0 #D9D9D9",
              textAlign: "center",
              fontWeight: 900
            }}
          >
            Слов пока нет
          </AppCard>
        ) : null}

        {filteredWords.map(word => (
          <AppCard
            key={word.id}
            style={{
              marginBottom: 12,
              background: "#FFFFFF",
              color: "#2D2D2D",
              border: "2px solid #E6E6E6",
              boxShadow: "0 5px 0 #D9D9D9"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "5px 9px",
                    borderRadius: 999,
                    background: word.isPublished ? "#E9F8DD" : "#F1F1F1",
                    color: word.isPublished ? "#46A400" : "#777",
                    fontSize: 12,
                    fontWeight: 900
                  }}
                >
                  <AppIcon
                    icon={word.isPublished ? Eye : EyeOff}
                    size={14}
                  />
                  {word.isPublished ? "Опубликовано" : "Черновик"}
                </div>

                <h3
                  style={{
                    margin: "10px 0 3px",
                    fontSize: 21,
                    fontWeight: 900
                  }}
                >
                  {word.lezgian}
                </h3>
                <div
                  style={{
                    color: "#46A400",
                    fontWeight: 900,
                    lineHeight: 1.35
                  }}
                >
                  {word.russian}
                </div>
                {word.category ? (
                  <div
                    style={{
                      marginTop: 6,
                      color: "#777",
                      fontSize: 13,
                      fontWeight: 800
                    }}
                  >
                    {word.category}
                  </div>
                ) : null}
              </div>

              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 16,
                  background: "#E9F8DD",
                  color: "#58CC02",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <AppIcon icon={WholeWord} size={24} />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginTop: 14
              }}
            >
              <AppButton
                onClick={() => startEdit(word)}
                variant="secondary"
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8
                  }}
                >
                  <AppIcon icon={Pencil} size={17} />
                  Редактировать
                </span>
              </AppButton>
              <AppButton
                onClick={() => void togglePublished(word)}
                variant={word.isPublished ? "secondary" : "primary"}
              >
                {word.isPublished ? "Скрыть" : "Опубликовать"}
              </AppButton>
            </div>
          </AppCard>
        ))}
      </div>
    </PageContainer>
  );
}

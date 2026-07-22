import {
  ArrowLeft,
  CheckCircle2,
  Music,
  Pencil,
  Plus,
  Search,
  Type
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createAdminAlphabetLetter,
  getAdminAlphabet,
  updateAdminAlphabetLetter
} from "../../api/apiClient";
import MediaUploader from "../../components/admin/MediaUploader";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import AppIcon from "../../components/ui/AppIcon";
import PageContainer from "../../components/ui/PageContainer";
import SectionTitle from "../../components/ui/SectionTitle";

const EMPTY_FORM = {
  letter: "",
  displayLetter: "",
  name: "",
  description: "",
  example: "",
  exampleMeaning: "",
  audioUrl: "",
  imageUrl: "",
  order: 0,
  isPublished: true
};

const fieldStyle = {
  width: "100%",
  minHeight: 46,
  boxSizing: "border-box",
  border: "2px solid #E6E6E6",
  borderRadius: 14,
  padding: "10px 12px",
  background: "#F8FAF6",
  color: "#2D2D2D",
  fontSize: 15,
  fontWeight: 800
};

function toForm(letter) {
  return {
    letter: letter?.letter || "",
    displayLetter: letter?.displayLetter || "",
    name: letter?.name || "",
    description: letter?.description || "",
    example: letter?.example || "",
    exampleMeaning: letter?.exampleMeaning || "",
    audioUrl: letter?.audioUrl || "",
    imageUrl: letter?.imageUrl || "",
    order: Number(letter?.order) || 0,
    isPublished: letter?.isPublished ?? true
  };
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 900 }}>
      {label}
      <input
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        style={fieldStyle}
      />
    </label>
  );
}

export default function AdminAlphabet() {
  const navigate = useNavigate();
  const [letters, setLetters] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadLetters = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await getAdminAlphabet();
      setLetters(data.letters || []);
    } catch (loadError) {
      setError(loadError.status === 403
        ? "Нет доступа к управлению алфавитом."
        : "Не удалось загрузить алфавит.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLetters();
  }, [loadLetters]);

  const filteredLetters = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return letters;

    return letters.filter(item => [
      item.letter,
      item.displayLetter,
      item.name,
      item.example
    ].filter(Boolean).join(" ").toLowerCase().includes(query));
  }, [letters, search]);

  function updateForm(field, value) {
    setForm(current => ({ ...current, [field]: value }));
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage("");
    setIsFormOpen(true);
  }

  function openEdit(letter) {
    setEditingId(letter.id);
    setForm(toForm(letter));
    setMessage("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(false);
  }

  async function saveLetter() {
    if (!form.letter.trim()) {
      setError("Укажите букву.");
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    const payload = {
      ...form,
      letter: form.letter.trim(),
      order: Number(form.order) || 0,
      isPublished: Boolean(form.isPublished)
    };

    try {
      const data = editingId
        ? await updateAdminAlphabetLetter(editingId, payload)
        : await createAdminAlphabetLetter(payload);
      const savedLetter = data.letter;

      setLetters(current => {
        const exists = current.some(item => item.id === savedLetter.id);
        const next = exists
          ? current.map(item => item.id === savedLetter.id ? savedLetter : item)
          : [...current, savedLetter];
        return next.sort((left, right) => left.order - right.order);
      });
      setMessage(editingId ? "Буква сохранена." : "Буква добавлена.");
      closeForm();
    } catch (saveError) {
      setError(saveError.message || "Не удалось сохранить букву.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageContainer style={{ background: "#F4F7F2", color: "#2D2D2D", maxWidth: 760 }}>
      <button
        type="button"
        onClick={() => navigate("/admin")}
        aria-label="Назад"
        style={{ border: 0, background: "transparent", padding: 4, cursor: "pointer" }}
      >
        <AppIcon icon={ArrowLeft} size={26} />
      </button>

      <div style={{ marginTop: 14 }}>
        <SectionTitle title="Алфавит" subtitle="Буквы и произношение" />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
        <label style={{ position: "relative", flex: "1 1 220px" }}>
          <span style={{ position: "absolute", left: 13, top: 13 }}>
            <AppIcon icon={Search} size={20} color="#777" />
          </span>
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Найти букву"
            style={{ ...fieldStyle, paddingLeft: 42 }}
          />
        </label>

        <AppButton onClick={openCreate}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <AppIcon icon={Plus} size={19} />
            Добавить букву
          </span>
        </AppButton>
      </div>

      {message ? (
        <div style={{ marginTop: 14, color: "#46A400", fontWeight: 900 }}>
          {message}
        </div>
      ) : null}

      {error ? (
        <AppCard style={{ marginTop: 14, color: "#D93025", fontWeight: 900 }}>
          {error}
        </AppCard>
      ) : null}

      {isFormOpen ? (
        <AppCard style={{ marginTop: 18, display: "grid", gap: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 900 }}>
            {editingId ? "Редактировать букву" : "Новая буква"}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <Field label="Буква" value={form.letter} onChange={value => updateForm("letter", value)} />
            <Field label="Отображение" value={form.displayLetter} onChange={value => updateForm("displayLetter", value)} />
            <Field label="Название" value={form.name} onChange={value => updateForm("name", value)} />
            <Field label="Порядок" type="number" value={form.order} onChange={value => updateForm("order", value)} />
            <Field label="Пример" value={form.example} onChange={value => updateForm("example", value)} />
            <Field label="Перевод примера" value={form.exampleMeaning} onChange={value => updateForm("exampleMeaning", value)} />
          </div>

          <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 900 }}>
            Описание
            <textarea
              value={form.description}
              onChange={event => updateForm("description", event.target.value)}
              style={{ ...fieldStyle, minHeight: 90, resize: "vertical" }}
            />
          </label>

          <MediaUploader
            type="audio"
            label="Аудио произношения"
            helperText="Загрузите произношение буквы или звука"
            value={form.audioUrl}
            onChange={value => updateForm("audioUrl", value)}
            disabled={isSaving}
          />

          <MediaUploader
            type="image"
            label="Изображение"
            value={form.imageUrl}
            onChange={value => updateForm("imageUrl", value)}
            disabled={isSaving}
          />

          <label style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 900 }}>
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={event => updateForm("isPublished", event.target.checked)}
            />
            Опубликована
          </label>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <AppButton onClick={saveLetter} disabled={isSaving}>
              {isSaving ? "Сохраняем..." : "Сохранить"}
            </AppButton>
            <AppButton onClick={closeForm} disabled={isSaving} variant="secondary">
              Отмена
            </AppButton>
          </div>
        </AppCard>
      ) : null}

      <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
        {isLoading ? (
          <AppCard style={{ textAlign: "center", fontWeight: 900 }}>
            Загружаем алфавит...
          </AppCard>
        ) : null}

        {!isLoading && filteredLetters.length === 0 ? (
          <AppCard style={{ textAlign: "center", fontWeight: 900 }}>
            Буквы не найдены.
          </AppCard>
        ) : null}

        {filteredLetters.map(item => (
          <AppCard
            key={item.id}
            style={{ display: "flex", alignItems: "center", gap: 14, padding: 16 }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                flex: "0 0 58px",
                borderRadius: 18,
                background: "#E9F8DD",
                display: "grid",
                placeItems: "center",
                fontSize: 27,
                fontWeight: 900
              }}
            >
              {item.letter}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 900 }}>{item.displayLetter || item.name || item.letter}</div>
              <div style={{ marginTop: 5, color: "#777", fontSize: 13, fontWeight: 800 }}>
                {item.example || "Пример не указан"}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <span style={{ color: item.audioUrl ? "#46A400" : "#8A8A8A", fontSize: 12, fontWeight: 900 }}>
                  <AppIcon icon={item.audioUrl ? Music : Type} size={14} /> {item.audioUrl ? "Есть аудио" : "Нет аудио"}
                </span>
                <span style={{ color: item.isPublished ? "#46A400" : "#D97706", fontSize: 12, fontWeight: 900 }}>
                  <AppIcon icon={CheckCircle2} size={14} /> {item.isPublished ? "Опубликована" : "Черновик"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openEdit(item)}
              aria-label={`Редактировать ${item.letter}`}
              style={{ border: 0, background: "#F1F3EF", borderRadius: 14, padding: 11, cursor: "pointer" }}
            >
              <AppIcon icon={Pencil} size={20} />
            </button>
          </AppCard>
        ))}
      </div>
    </PageContainer>
  );
}

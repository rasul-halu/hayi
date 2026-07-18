import { ImagePlus, Music, Upload } from "lucide-react";
import { useState } from "react";
import {
  uploadAdminAudio,
  uploadAdminImage
} from "../../api/apiClient";
import AppButton from "../ui/AppButton";
import AppIcon from "../ui/AppIcon";

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

const panelStyle = {
  display: "grid",
  gap: 10,
  padding: 12,
  borderRadius: 16,
  border: "2px solid #E6E6E6",
  background: "#F8FAF6"
};

function getUploadErrorMessage(error) {
  if (error.status === 401) {
    return "Нужно войти через Telegram.";
  }

  if (error.status === 403) {
    return "Нет доступа к загрузке файлов.";
  }

  if (error.status === 413) {
    return "Файл слишком большой.";
  }

  return error.message || "Не удалось загрузить файл.";
}

export default function MediaUploader({
  type,
  value,
  onChange,
  label,
  disabled = false
}) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const isImage = type === "image";

  async function uploadSelectedFile() {
    if (!file) {
      setError("Выберите файл для загрузки.");
      return;
    }

    setIsUploading(true);
    setError("");
    setMessage("");

    try {
      const data = isImage
        ? await uploadAdminImage(file)
        : await uploadAdminAudio(file);

      onChange(data.url);
      setMessage("Файл загружен. Не забудьте сохранить изменения.");
      setFile(null);
    } catch (uploadError) {
      setError(getUploadErrorMessage(uploadError));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div style={panelStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 900 }}>
        <AppIcon icon={isImage ? ImagePlus : Music} size={18} />
        {label}
      </div>

      {isImage && value ? (
        <img
          src={value}
          alt=""
          style={{
            width: "100%",
            maxHeight: 220,
            objectFit: "cover",
            borderRadius: 14,
            border: "2px solid #E6E6E6"
          }}
        />
      ) : null}

      {!isImage && value ? (
        <audio controls src={value} style={{ width: "100%" }}>
          <track kind="captions" />
        </audio>
      ) : null}

      <input
        value={value || ""}
        onChange={event => onChange(event.target.value)}
        style={inputStyle}
        placeholder={isImage ? "Image URL" : "Audio URL"}
        disabled={disabled || isUploading}
      />

      <input
        type="file"
        accept={isImage ? "image/jpeg,image/png,image/webp" : "audio/mpeg,audio/wav,audio/ogg,audio/mp4,.m4a"}
        onChange={event => setFile(event.target.files?.[0] || null)}
        disabled={disabled || isUploading}
        style={inputStyle}
      />

      <AppButton
        onClick={uploadSelectedFile}
        disabled={disabled || isUploading || !file}
        variant="secondary"
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <AppIcon icon={Upload} size={18} />
          {isUploading ? "Загружаем файл..." : "Загрузить"}
        </span>
      </AppButton>

      {message ? (
        <div style={{ color: "#46A400", fontWeight: 900 }}>{message}</div>
      ) : null}

      {error ? (
        <div style={{ color: "#D93025", fontWeight: 900 }}>{error}</div>
      ) : null}
    </div>
  );
}

import { AlertTriangle, X } from "lucide-react";
import { useEffect } from "react";
import AppButton from "./AppButton";
import AppIcon from "./AppIcon";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Удалить",
  cancelLabel = "Отмена",
  isLoading = false,
  error = "",
  onConfirm,
  onCancel
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = event => {
      if (event.key === "Escape" && !isLoading) {
        onCancel();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLoading, onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !isLoading) {
          onCancel();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "grid",
        placeItems: "center",
        padding: "max(18px, env(safe-area-inset-top)) 18px max(18px, env(safe-area-inset-bottom))",
        background: "rgba(30, 35, 29, 0.48)",
        backdropFilter: "blur(3px)"
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        style={{
          width: "min(100%, 420px)",
          maxHeight: "min(620px, 90dvh)",
          overflowY: "auto",
          padding: 20,
          borderRadius: 20,
          background: "#FFFFFF",
          color: "#2D2D2D",
          boxShadow: "0 18px 50px rgba(30, 35, 29, 0.22)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span
            style={{
              width: 44,
              height: 44,
              display: "grid",
              placeItems: "center",
              borderRadius: 14,
              background: "#FFF0F0",
              color: "#D93025"
            }}
          >
            <AppIcon icon={AlertTriangle} size={22} />
          </span>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onCancel}
            disabled={isLoading}
            style={{
              width: 40,
              height: 40,
              display: "grid",
              placeItems: "center",
              border: 0,
              borderRadius: 12,
              background: "#F3F4F1",
              color: "#4B4B4B",
              cursor: isLoading ? "default" : "pointer",
              opacity: isLoading ? 0.6 : 1
            }}
          >
            <AppIcon icon={X} size={20} />
          </button>
        </div>

        <h2 id="confirm-dialog-title" style={{ margin: "16px 0 0", fontSize: 22 }}>
          {title}
        </h2>
        <p
          id="confirm-dialog-description"
          style={{ margin: "8px 0 0", color: "#6F746B", lineHeight: 1.5 }}
        >
          {description}
        </p>

        {error ? (
          <div
            role="alert"
            style={{
              marginTop: 14,
              padding: "11px 12px",
              borderRadius: 12,
              background: "#FFF0F0",
              color: "#B42318",
              fontWeight: 700,
              lineHeight: 1.4
            }}
          >
            {error}
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20 }}>
          <AppButton
            onClick={onCancel}
            variant="secondary"
            disabled={isLoading}
            style={{ minHeight: 50, padding: "12px 14px" }}
          >
            {cancelLabel}
          </AppButton>
          <AppButton
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              minHeight: 50,
              padding: "12px 14px",
              background: "#E5484D",
              borderColor: "#BF3035",
              boxShadow: "0 4px 0 #BF3035"
            }}
          >
            {isLoading ? "Удаляем..." : confirmLabel}
          </AppButton>
        </div>
      </div>
    </div>
  );
}

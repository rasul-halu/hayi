import { useEffect } from "react";
import { X } from "lucide-react";
import lostMascot from "../../assets/mascot/lost.png";
import AppButton from "../ui/AppButton";
import AppIcon from "../ui/AppIcon";
import HeartCountdown from "./HeartCountdown";

export default function NoHeartsModal({
  open,
  hearts = 0,
  maxHearts = 5,
  nextHeartAt,
  onClose,
  onCountdownComplete
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const hasHeart = Number(hearts) > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="no-hearts-title"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        padding: "24px 18px",
        background: "rgba(45, 45, 45, 0.46)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box"
      }}
    >
      <div
        onClick={event => event.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 400,
          padding: "24px 20px 20px",
          borderRadius: 28,
          background: "#FFFFFF",
          color: "#2D2D2D",
          border: "2px solid #E6E6E6",
          boxShadow: "0 10px 0 rgba(0,0,0,0.12)",
          textAlign: "center"
        }}
      >
        <button
          type="button"
          aria-label="Закрыть"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 36,
            height: 36,
            borderRadius: 12,
            border: "2px solid #E6E6E6",
            background: "#F8FAF6",
            color: "#6F746B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}
        >
          <AppIcon icon={X} size={20} />
        </button>

        <img
          src={lostMascot}
          alt="Закончились сердца"
          style={{
            width: 138,
            height: 138,
            objectFit: "contain",
            marginBottom: 8
          }}
        />

        <h2
          id="no-hearts-title"
          style={{
            margin: 0,
            fontSize: 25,
            fontWeight: 900
          }}
        >
          Сердца закончились
        </h2>

        <p
          style={{
            margin: "8px 0 16px",
            color: "#6F746B",
            fontWeight: 800,
            lineHeight: 1.4
          }}
        >
          {hasHeart
            ? "Одно сердце восстановлено"
            : "Следующее сердце через"}
        </p>

        {hasHeart ? (
          <div
            style={{
              marginBottom: 16,
              fontWeight: 900,
              color: "#58CC02"
            }}
          >
            Сейчас: {hearts} из {maxHearts}
          </div>
        ) : (
          <div
            style={{
              marginBottom: 16,
              display: "grid",
              gap: 10
            }}
          >
            <HeartCountdown
              nextHeartAt={nextHeartAt}
              onComplete={onCountdownComplete}
            />
            <span
              style={{
                color: "#6F746B",
                fontWeight: 800,
                lineHeight: 1.35
              }}
            >
              Каждый час восстанавливается одно сердце
            </span>
          </div>
        )}

        <AppButton onClick={onClose}>
          Понятно
        </AppButton>
      </div>
    </div>
  );
}

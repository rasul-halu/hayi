import { LoaderCircle, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AppIcon from "../ui/AppIcon";
import { resolveMediaUrl } from "../../utils/mediaUrl";

let activeAudio = null;

function stopOtherAudio(audio) {
  if (activeAudio && activeAudio !== audio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }

  activeAudio = audio;
}

export default function AudioPlayButton({
  src,
  size = 64,
  label = "Прослушать аудио",
  disabled = false,
  variant = "primary"
}) {
  const audioRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const resolvedSrc = resolveMediaUrl(src);
  const isUnavailable = disabled || !resolvedSrc;

  useEffect(() => {
    if (!resolvedSrc) {
      setStatus("idle");
      return undefined;
    }

    const audio = new Audio(resolvedSrc);
    audio.preload = "metadata";
    audioRef.current = audio;

    const handleLoadStart = () => setStatus("loading");
    const handleCanPlay = () => setStatus(current => (
      current === "playing" ? current : "idle"
    ));
    const handlePlaying = () => setStatus("playing");
    const handlePause = () => setStatus("idle");
    const handleEnded = () => {
      setStatus("idle");
      if (activeAudio === audio) activeAudio = null;
    };
    const handleError = () => setStatus("error");

    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.pause();
      if (activeAudio === audio) activeAudio = null;
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
  }, [resolvedSrc]);

  async function handlePlay() {
    const audio = audioRef.current;
    if (isUnavailable || !audio) return;

    stopOtherAudio(audio);
    audio.currentTime = 0;
    setStatus("loading");

    try {
      await audio.play();
    } catch {
      setStatus("error");
      if (activeAudio === audio) activeAudio = null;
    }
  }

  const isSoft = variant === "soft";
  const isPlaying = status === "playing";
  const isLoading = status === "loading";
  const hasError = status === "error";

  return (
    <button
      type="button"
      onClick={handlePlay}
      disabled={isUnavailable}
      aria-label={status === "error" ? `${label}. Не удалось воспроизвести` : label}
      title={status === "error" ? "Не удалось воспроизвести аудио" : label}
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: "50%",
        border: hasError
          ? "2px solid #E9A0A0"
          : isSoft ? "2px solid #BFE8A7" : "2px solid #46A400",
        background: hasError
          ? "#FFF0F0"
          : isSoft ? "#E9F8DD" : "#58CC02",
        color: hasError
          ? "#D93025"
          : isSoft ? "#46A400" : "#FFFFFF",
        boxShadow: isSoft ? "0 4px 0 #BFE8A7" : "0 5px 0 #46A400",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        cursor: isUnavailable ? "default" : "pointer",
        opacity: isUnavailable ? 0.55 : 1,
        transform: isPlaying ? "scale(1.06)" : "scale(1)",
        transition: "transform 160ms ease",
        animation: isPlaying ? "audioButtonPulse 900ms ease-in-out infinite" : "none"
      }}
    >
      <style>{`
        @keyframes audioButtonPulse {
          0%, 100% { box-shadow: 0 5px 0 #46A400, 0 0 0 0 rgba(88, 204, 2, 0.22); }
          50% { box-shadow: 0 5px 0 #46A400, 0 0 0 8px rgba(88, 204, 2, 0); }
        }
        @keyframes audioButtonSpin { to { transform: rotate(360deg); } }
      `}</style>
      <span style={{ animation: isLoading ? "audioButtonSpin 800ms linear infinite" : "none" }}>
        <AppIcon
          icon={isLoading ? LoaderCircle : Volume2}
          size={Math.max(20, Math.round(size * 0.45))}
          color="currentColor"
          strokeWidth={2.5}
        />
      </span>
    </button>
  );
}

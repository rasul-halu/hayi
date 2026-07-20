import { useEffect, useState } from "react";

function getSecondsLeft(nextHeartAt) {
  if (!nextHeartAt) {
    return 0;
  }

  const targetTime = new Date(nextHeartAt).getTime();

  if (!Number.isFinite(targetTime)) {
    return 0;
  }

  return Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
}

function formatSeconds(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  return [hours, minutes, remainingSeconds]
    .map(value => String(value).padStart(2, "0"))
    .join(":");
}

export default function HeartCountdown({
  nextHeartAt,
  onComplete,
  compact = false
}) {
  const [secondsLeft, setSecondsLeft] = useState(
    () => getSecondsLeft(nextHeartAt)
  );

  useEffect(() => {
    setSecondsLeft(getSecondsLeft(nextHeartAt));

    if (!nextHeartAt) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const nextSecondsLeft = getSecondsLeft(nextHeartAt);

      setSecondsLeft(nextSecondsLeft);

      if (nextSecondsLeft <= 0) {
        window.clearInterval(intervalId);
        onComplete?.();
      }
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [nextHeartAt, onComplete]);

  return (
    <span
      style={{
        fontVariantNumeric: "tabular-nums",
        fontWeight: 900,
        fontSize: compact ? 18 : 34,
        color: "#2D2D2D",
        letterSpacing: 0
      }}
    >
      {formatSeconds(secondsLeft)}
    </span>
  );
}

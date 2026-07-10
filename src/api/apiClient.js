const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

function getTelegramAuthHeaders() {
  const initData = window.Telegram?.WebApp?.initData || "";

  return initData
    ? {
        "X-Telegram-Init-Data": initData,
      }
    : {};
}

export function hasTelegramAuthData() {
  return Boolean(window.Telegram?.WebApp?.initData);
}

function requireTelegramAuthHeaders() {
  const headers = getTelegramAuthHeaders();

  if (!headers["X-Telegram-Init-Data"]) {
    throw new Error("Telegram initData is required for this request");
  }

  return headers;
}

export async function checkApiHealth() {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error("API health check failed");
  }

  return response.json();
}

export async function authenticateWithTelegram(initData) {
  const response = await fetch(`${API_URL}/auth/telegram`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ initData }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Telegram authentication failed");
  }

  return data;
}

export async function getProgress() {
  const response = await fetch(`${API_URL}/progress`, {
    headers: requireTelegramAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Progress loading failed");
  }

  return data;
}

export async function saveLessonProgress({
  lessonId,
  correctAnswers,
  wrongAnswers,
  completed,
}) {
  const response = await fetch(`${API_URL}/progress/lesson`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...requireTelegramAuthHeaders(),
    },
    body: JSON.stringify({
      lessonId,
      correctAnswers,
      wrongAnswers,
      completed,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Lesson progress saving failed");
  }

  return data;
}

export async function getUserStats() {
  const response = await fetch(`${API_URL}/stats`, {
    headers: requireTelegramAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Stats loading failed");
  }

  return data;
}

export async function recordCorrectAnswer() {
  const response = await fetch(`${API_URL}/stats/correct-answer`, {
    method: "POST",
    headers: requireTelegramAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Correct answer saving failed");
  }

  return data;
}

export async function recordWrongAnswer() {
  const response = await fetch(`${API_URL}/stats/wrong-answer`, {
    method: "POST",
    headers: requireTelegramAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Wrong answer saving failed");
  }

  return data;
}

export async function completeLessonOnServer({ lessonId }) {
  const response = await fetch(`${API_URL}/progress/lesson-complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...requireTelegramAuthHeaders(),
    },
    body: JSON.stringify({
      lessonId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Lesson completion saving failed");
  }

  return data;
}

const LEADERBOARD_PERIODS = new Set([
  "global",
  "daily",
  "weekly",
]);

export async function getLeaderboard({
  limit = 50,
  period = "weekly",
} = {}) {
  if (!LEADERBOARD_PERIODS.has(period)) {
    throw new Error("Unknown leaderboard period");
  }

  const params = new URLSearchParams({
    limit: String(limit),
    period,
  });

  const response = await fetch(`${API_URL}/leaderboard?${params}`, {
    headers: requireTelegramAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Leaderboard loading failed");
  }

  return data;
}

export async function getAchievements() {
  const response = await fetch(`${API_URL}/achievements`, {
    headers: requireTelegramAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Achievements loading failed");
  }

  return data;
}

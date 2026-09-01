export const DEFAULT_HEART_REWARD_STREAK = 3;

function toSafeInteger(value, fallback = 0) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? Math.max(0, Math.floor(numericValue))
    : fallback;
}

function getBaseHeartState(state = {}) {
  const maxHearts = Math.max(1, toSafeInteger(state.maxHearts, 5));
  const hearts = Math.min(toSafeInteger(state.hearts, maxHearts), maxHearts);

  return {
    hearts,
    maxHearts,
    correctAnswerStreak: toSafeInteger(state.correctAnswerStreak, 0)
  };
}

export function getCorrectAnswerHeartState(
  state,
  rewardStreak = DEFAULT_HEART_REWARD_STREAK
) {
  const current = getBaseHeartState(state);
  const safeRewardStreak = Math.max(1, toSafeInteger(rewardStreak, 3));
  const nextCorrectAnswerStreak = current.correctAnswerStreak + 1;
  const rewardTriggered = nextCorrectAnswerStreak >= safeRewardStreak;
  const hearts = rewardTriggered
    ? Math.min(current.hearts + 1, current.maxHearts)
    : current.hearts;

  return {
    hearts,
    maxHearts: current.maxHearts,
    correctAnswerStreak: rewardTriggered ? 0 : nextCorrectAnswerStreak,
    rewardTriggered,
    heartRestored: hearts > current.hearts
  };
}

export function getWrongAnswerHeartState(state) {
  const current = getBaseHeartState(state);

  return {
    hearts: Math.max(current.hearts - 1, 0),
    maxHearts: current.maxHearts,
    correctAnswerStreak: 0
  };
}

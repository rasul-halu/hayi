const SOUND_PATHS = {
  correct: "/sounds/correct.mp3",
  wrong: "/sounds/wrong.mp3",
  lessonComplete: "/sounds/lesson-complete.mp3",
  buttonTap: "/sounds/button-tap.mp3",
  achievement: "/sounds/achievement.mp3",
  streak: "/sounds/streak.mp3"
};

const DEFAULT_VOLUME = 0.42;

export function playAudioFile(
  path,
  soundEnabled = true,
  volume = 0.45
) {
  if (!soundEnabled || !path || typeof Audio === "undefined") {
    return;
  }

  try {
    const audio = new Audio(path);
    audio.volume = volume;

    const playPromise = audio.play();

    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }
  } catch {
    // Missing files, blocked autoplay, or unsupported audio should not break UI.
  }
}

export function playSound(
  soundName,
  soundEnabled = true,
  volume = DEFAULT_VOLUME
) {
  if (!soundEnabled) {
    return;
  }

  const path = SOUND_PATHS[soundName];

  playAudioFile(path, soundEnabled, volume);
}

export function playCorrectSound(soundEnabled) {
  playSound("correct", soundEnabled);
}

export function playWrongSound(soundEnabled) {
  playSound("wrong", soundEnabled);
}

export function playLessonCompleteSound(soundEnabled) {
  playSound("lessonComplete", soundEnabled, 0.48);
}

export function playButtonTapSound(soundEnabled) {
  playSound("buttonTap", soundEnabled, 0.28);
}

export function playAchievementSound(soundEnabled) {
  playSound("achievement", soundEnabled, 0.45);
}

export function playStreakSound(soundEnabled) {
  playSound("streak", soundEnabled, 0.45);
}

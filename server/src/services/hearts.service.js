import {
  HEART_REFILL_INTERVAL_HOURS,
  MAX_HEARTS,
} from "../config/game.constants.js";
import prisma from "../lib/prisma.js";

const HEART_RESTORE_INTERVAL_MS =
  HEART_REFILL_INTERVAL_HOURS * 60 * 60 * 1000;

function clampHeartCount(value, maxHearts = MAX_HEARTS) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return maxHearts;
  }

  return Math.min(Math.max(Math.floor(numericValue), 0), maxHearts);
}

function toDate(value, fallback) {
  const date = value ? new Date(value) : null;

  return date && Number.isFinite(date.getTime())
    ? date
    : fallback;
}

export function getRegeneratedHeartState(user, now = new Date()) {
  const maxHearts = clampHeartCount(user?.maxHearts, MAX_HEARTS);
  const currentHearts = clampHeartCount(user?.hearts, maxHearts);
  const lastHeartRefillAt = toDate(user?.lastHeartRefillAt, now);

  if (currentHearts >= maxHearts) {
    return {
      hearts: maxHearts,
      maxHearts,
      nextHeartAt: null,
      secondsUntilNextHeart: 0,
      isFull: true,
      lastHeartRefillAt,
    };
  }

  const elapsedMs = Math.max(
    0,
    now.getTime() - lastHeartRefillAt.getTime()
  );
  const restoredCount = Math.floor(elapsedMs / HEART_RESTORE_INTERVAL_MS);
  const missingHearts = maxHearts - currentHearts;
  const appliedRestores = Math.min(restoredCount, missingHearts);
  const hearts = Math.min(currentHearts + appliedRestores, maxHearts);
  const nextLastHeartRefillAt =
    appliedRestores > 0
      ? new Date(
          lastHeartRefillAt.getTime() +
          appliedRestores * HEART_RESTORE_INTERVAL_MS
        )
      : lastHeartRefillAt;

  if (hearts >= maxHearts) {
    return {
      hearts: maxHearts,
      maxHearts,
      nextHeartAt: null,
      secondsUntilNextHeart: 0,
      isFull: true,
      lastHeartRefillAt: now,
    };
  }

  const nextHeartAt = new Date(
    nextLastHeartRefillAt.getTime() + HEART_RESTORE_INTERVAL_MS
  );

  return {
    hearts,
    maxHearts,
    nextHeartAt,
    secondsUntilNextHeart: Math.max(
      0,
      Math.ceil((nextHeartAt.getTime() - now.getTime()) / 1000)
    ),
    isFull: false,
    lastHeartRefillAt: nextLastHeartRefillAt,
  };
}

export function getNextHeartAt(user) {
  return getRegeneratedHeartState(user).nextHeartAt;
}

export function toHeartStateResponse(user) {
  const state = getRegeneratedHeartState(user);

  return {
    hearts: state.hearts,
    maxHearts: state.maxHearts,
    nextHeartAt: state.nextHeartAt
      ? state.nextHeartAt.toISOString()
      : null,
    secondsUntilNextHeart: state.secondsUntilNextHeart,
    isFull: state.isFull,
  };
}

export async function applyHeartRegeneration(userId) {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });
  const state = getRegeneratedHeartState(user);
  const shouldUpdate =
    state.hearts !== user.hearts ||
    state.lastHeartRefillAt.getTime() !== user.lastHeartRefillAt.getTime();

  if (!shouldUpdate) {
    return {
      user,
      heartState: toHeartStateResponse(user),
    };
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      hearts: state.hearts,
      lastHeartRefillAt: state.lastHeartRefillAt,
    },
  });

  return {
    user: updatedUser,
    heartState: toHeartStateResponse(updatedUser),
  };
}

export async function loseHeartForUser(userId) {
  const { user } = await applyHeartRegeneration(userId);
  const now = new Date();
  const maxHearts = clampHeartCount(user.maxHearts, MAX_HEARTS);
  const currentHearts = clampHeartCount(user.hearts, maxHearts);
  const nextHearts = Math.max(currentHearts - 1, 0);
  const shouldStartTimer =
    currentHearts >= maxHearts &&
    nextHearts < maxHearts;
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      hearts: nextHearts,
      ...(shouldStartTimer
        ? {
            lastHeartRefillAt: now,
          }
        : {}),
    },
  });

  return {
    user: updatedUser,
    heartState: toHeartStateResponse(updatedUser),
  };
}

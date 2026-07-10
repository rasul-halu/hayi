import prisma from "../lib/prisma.js";

function validateAwardInput({ userId, amount, source }) {
  if (!userId) {
    throw new Error("userId is required");
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("XP amount must be a positive integer");
  }

  if (!source) {
    throw new Error("XP source is required");
  }
}

async function awardXpWithClient(client, {
  userId,
  amount,
  source,
  lessonId = null,
  uniqueKey = null,
}) {
  validateAwardInput({ userId, amount, source });

  await client.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
  });

  const event = await client.xpEvent.create({
    data: {
      userId,
      amount,
      source,
      lessonId,
      uniqueKey,
    },
  });

  const user = await client.user.update({
    where: {
      id: userId,
    },
    data: {
      xp: {
        increment: amount,
      },
    },
  });

  return {
    totalXp: user.xp,
    user,
    event,
  };
}

export async function awardXp({
  userId,
  amount,
  source,
  lessonId = null,
  uniqueKey = null,
  tx = null,
}) {
  if (tx) {
    return awardXpWithClient(tx, {
      userId,
      amount,
      source,
      lessonId,
      uniqueKey,
    });
  }

  return prisma.$transaction(client =>
    awardXpWithClient(client, {
      userId,
      amount,
      source,
      lessonId,
      uniqueKey,
    })
  );
}

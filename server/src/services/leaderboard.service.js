import prisma from "../lib/prisma.js";
import { getLeaderboardPeriodRange } from "../utils/leaderboardPeriod.js";

function getDisplayName(user) {
  return user.firstName || user.username || "Ученик";
}

function toLeaderboardEntry(user, rank, currentUserId) {
  return {
    rank,
    id: user.id,
    displayName: getDisplayName(user),
    username: user.username,
    avatarUrl: user.avatarUrl,
    xp: Number(user.xp) || 0,
    streak: Number(user.streak) || 0,
    isCurrentUser: user.id === currentUserId,
  };
}

async function getGlobalLeaderboard({
  currentUserId,
  limit,
}) {
  const [topUsers, totalUsers, currentUser] = await Promise.all([
    prisma.user.findMany({
      take: limit,
      orderBy: [
        { xp: "desc" },
        { createdAt: "asc" },
        { id: "asc" },
      ],
      select: {
        id: true,
        firstName: true,
        username: true,
        avatarUrl: true,
        xp: true,
        streak: true,
        createdAt: true,
      },
    }),
    prisma.user.count(),
    prisma.user.findUniqueOrThrow({
      where: {
        id: currentUserId,
      },
      select: {
        id: true,
        firstName: true,
        username: true,
        avatarUrl: true,
        xp: true,
        streak: true,
        createdAt: true,
      },
    }),
  ]);

  const currentUserEarlierCount = await prisma.user.count({
    where: {
      OR: [
        {
          xp: {
            gt: currentUser.xp,
          },
        },
        {
          xp: currentUser.xp,
          createdAt: {
            lt: currentUser.createdAt,
          },
        },
        {
          xp: currentUser.xp,
          createdAt: currentUser.createdAt,
          id: {
            lt: currentUser.id,
          },
        },
      ],
    },
  });

  return {
    entries: topUsers.map((user, index) =>
      toLeaderboardEntry(user, index + 1, currentUserId)
    ),
    currentUser: toLeaderboardEntry(
      currentUser,
      currentUserEarlierCount + 1,
      currentUserId
    ),
    totalUsers,
  };
}

function rowToPeriodUser(row) {
  return {
    id: row.id,
    firstName: row.firstName,
    username: row.username,
    avatarUrl: row.avatarUrl,
    xp: Number(row.xp) || 0,
    streak: Number(row.streak) || 0,
    createdAt: row.createdAt,
    firstEventAt: row.firstEventAt,
  };
}

async function getPeriodLeaderboard({
  currentUserId,
  limit,
  startDate,
}) {
  const [rows, totalRows, currentRows] = await Promise.all([
    prisma.$queryRaw`
      SELECT
        u."id",
        u."firstName",
        u."username",
        u."avatarUrl",
        u."streak",
        u."createdAt",
        CAST(SUM(x."amount") AS INTEGER) AS "xp",
        MIN(x."createdAt") AS "firstEventAt"
      FROM "XpEvent" x
      INNER JOIN "User" u ON u."id" = x."userId"
      WHERE x."createdAt" >= ${startDate}
      GROUP BY
        u."id",
        u."firstName",
        u."username",
        u."avatarUrl",
        u."streak",
        u."createdAt"
      ORDER BY
        "xp" DESC,
        "firstEventAt" ASC,
        u."createdAt" ASC,
        u."id" ASC
      LIMIT ${limit}
    `,
    prisma.$queryRaw`
      SELECT COUNT(DISTINCT x."userId") AS "count"
      FROM "XpEvent" x
      WHERE x."createdAt" >= ${startDate}
    `,
    prisma.$queryRaw`
      SELECT
        u."id",
        u."firstName",
        u."username",
        u."avatarUrl",
        u."streak",
        u."createdAt",
        COALESCE(CAST(SUM(x."amount") AS INTEGER), 0) AS "xp",
        MIN(x."createdAt") AS "firstEventAt"
      FROM "User" u
      LEFT JOIN "XpEvent" x
        ON x."userId" = u."id"
        AND x."createdAt" >= ${startDate}
      WHERE u."id" = ${currentUserId}
      GROUP BY
        u."id",
        u."firstName",
        u."username",
        u."avatarUrl",
        u."streak",
        u."createdAt"
    `,
  ]);

  const currentUser = rowToPeriodUser(currentRows[0]);
  let currentRank = null;

  if (currentUser.xp > 0) {
    const rankRows = await prisma.$queryRaw`
      WITH scores AS (
        SELECT
          x."userId",
          CAST(SUM(x."amount") AS INTEGER) AS "xp",
          MIN(x."createdAt") AS "firstEventAt"
        FROM "XpEvent" x
        WHERE x."createdAt" >= ${startDate}
        GROUP BY x."userId"
      )
      SELECT COUNT(*) AS "count"
      FROM scores s
      INNER JOIN "User" u ON u."id" = s."userId"
      WHERE
        s."xp" > ${currentUser.xp}
        OR (
          s."xp" = ${currentUser.xp}
          AND (
            s."firstEventAt" < ${currentUser.firstEventAt}
            OR (
              s."firstEventAt" = ${currentUser.firstEventAt}
              AND u."createdAt" < ${currentUser.createdAt}
            )
            OR (
              s."firstEventAt" = ${currentUser.firstEventAt}
              AND u."createdAt" = ${currentUser.createdAt}
              AND u."id" < ${currentUser.id}
            )
          )
        )
    `;

    currentRank = Number(rankRows[0]?.count || 0) + 1;
  }

  return {
    entries: rows.map((row, index) =>
      toLeaderboardEntry(rowToPeriodUser(row), index + 1, currentUserId)
    ),
    currentUser: toLeaderboardEntry(
      currentUser,
      currentRank,
      currentUserId
    ),
    totalUsers: Number(totalRows[0]?.count || 0),
  };
}

export async function getLeaderboard({
  currentUserId,
  limit = 50,
  period = "weekly",
}) {
  const { startDate } = getLeaderboardPeriodRange(period);

  if (!startDate) {
    return getGlobalLeaderboard({
      currentUserId,
      limit,
    });
  }

  return getPeriodLeaderboard({
    currentUserId,
    limit,
    startDate,
  });
}

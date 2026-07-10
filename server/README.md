# Hayi API

Backend scaffold for the Hayi React and Telegram Mini App.

## Installation

```bash
cd server
npm install
```

## Environment

Copy `.env.example` to `.env` and adjust local values if needed.

```bash
cp .env.example .env
```

Do not commit the real `.env` file.

## Development

```bash
npm run dev
```

## Health Check

Open:

```text
http://localhost:4000/api/health
```

Expected JSON:

```json
{
  "status": "ok",
  "service": "hayi-api"
}
```

## Telegram Auth Test Data

Set `TELEGRAM_BOT_TOKEN` in `.env`, then generate a development-only test
`initData` string:

```bash
npm run test:telegram-auth
```

Use the generated string with:

```text
POST http://localhost:4000/api/auth/telegram
```

## Prisma

Prisma uses PostgreSQL through `@prisma/adapter-pg`.

Set `DATABASE_URL` in `.env` before running migrations.

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init_user
npm run prisma:studio
```

Database health check:

```text
http://localhost:4000/api/health/database
```

## XP History

`User.xp` is the total accumulated XP. New XP awards are also written to
`XpEvent`, which powers daily and weekly leaderboards.

Historical XP that existed before `XpEvent` was added is not backfilled into
dated events, so it appears in the global leaderboard only.

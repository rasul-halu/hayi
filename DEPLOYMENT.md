# Hayi Deployment

This project uses Vercel for the React frontend and Render for the Express API.
Do not commit real secrets or production connection strings.

## Backend: Render

Create a new Web Service.

- Root Directory: `server`
- Build Command: `npm install && npm run prisma:migrate:deploy`
- Start Command: `npm start`
- Health Check Path: `/api/health`

Environment variables:

```env
NODE_ENV=production
CLIENT_URL=https://FRONTEND_URL.vercel.app
DATABASE_URL=Neon connection string
TELEGRAM_BOT_TOKEN=BotFather token
ADMIN_TELEGRAM_IDS=your_telegram_id
```

`PORT` can usually be omitted because Render provides it. The server still
uses `process.env.PORT` when it is present.

Run migrations in production with:

```bash
npm run prisma:migrate:deploy
```

Do not use `prisma migrate dev` in production.

`ADMIN_TELEGRAM_IDS` is a comma-separated allowlist of Telegram user ids that
should receive the `ADMIN` role when they sign in through Telegram. Do not
commit real ids if you do not want them public; set them in Render environment
variables instead.

## Frontend: Vercel

Create a new Vercel project from the repository root.

- Root Directory: project root
- Framework Preset: Create React App
- Build Command: `npm run build`
- Output Directory: `build`

Environment variable:

```env
REACT_APP_API_URL=https://BACKEND_URL.onrender.com/api
```

The repository includes `vercel.json` so direct routes such as `/profile`,
`/leaderboard`, `/achievements`, `/alphabet`, and `/lesson/:lessonId` resolve to
`index.html`.

## Deployment Order

1. Deploy the backend on Render with temporary `CLIENT_URL` if the frontend URL
   is not known yet.
2. Deploy the frontend on Vercel with `REACT_APP_API_URL` pointing to the Render
   backend URL.
3. Update `CLIENT_URL` on Render to the final Vercel frontend URL.
4. Redeploy or restart the backend so the new `CLIENT_URL` is active.
5. Set the Vercel Mini App URL in BotFather.

## Never Publish

- `server/.env`
- `DATABASE_URL`
- `TELEGRAM_BOT_TOKEN`
- Neon credentials
- Render or Vercel secret values

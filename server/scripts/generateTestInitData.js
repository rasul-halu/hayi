import "dotenv/config";

import { createTelegramHash } from "../src/utils/validateTelegramInitData.js";

const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
  console.error("TELEGRAM_BOT_TOKEN is required to generate test initData.");
  process.exit(1);
}

const user = {
  id: 123456789,
  first_name: "Hayi",
  last_name: "Tester",
  username: "hayi_test_user",
  language_code: "ru",
  is_premium: false,
};

const params = new URLSearchParams({
  auth_date: String(Math.floor(Date.now() / 1000)),
  query_id: "AAHdF6IQAAAAAN0XohDhrOrc",
  user: JSON.stringify(user),
});

const dataCheckString = [...params.entries()]
  .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
  .map(([key, value]) => `${key}=${value}`)
  .join("\n");

params.set("hash", createTelegramHash(botToken, dataCheckString));

console.log(params.toString());

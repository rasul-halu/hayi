import crypto from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_ROOT = path.resolve(__dirname, "../..");
const UPLOADS_ROOT = path.join(SERVER_ROOT, "uploads");

const EXTENSIONS_BY_MIME_TYPE = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "audio/mpeg": ".mp3",
  "audio/mp3": ".mp3",
  "audio/wav": ".wav",
  "audio/x-wav": ".wav",
  "audio/ogg": ".ogg",
  "audio/mp4": ".m4a",
  "audio/m4a": ".m4a",
  "audio/x-m4a": ".m4a",
  "video/mp4": ".m4a",
};

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getPublicBaseUrl() {
  const configuredUrl = process.env.PUBLIC_API_URL || process.env.API_PUBLIC_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  return `http://localhost:${process.env.PORT || 4000}`;
}

function getFileExtension(file) {
  const originalExtension = path.extname(file.originalname || "").toLowerCase();

  return originalExtension || EXTENSIONS_BY_MIME_TYPE[file.mimetype] || "";
}

async function uploadLocalFile(file, folder) {
  if (!file?.buffer) {
    throw createHttpError(400, "No file uploaded");
  }

  const extension = getFileExtension(file);
  const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const targetDirectory = path.join(UPLOADS_ROOT, folder);
  const targetPath = path.join(targetDirectory, fileName);

  await mkdir(targetDirectory, {
    recursive: true,
  });
  await writeFile(targetPath, file.buffer);

  return `${getPublicBaseUrl()}/uploads/${folder}/${fileName}`;
}

function assertSupportedProvider() {
  const provider = process.env.MEDIA_STORAGE_PROVIDER || "local";

  if (provider !== "local") {
    throw createHttpError(500, "Media storage provider is not configured");
  }
}

export async function uploadImage(file) {
  assertSupportedProvider();
  return uploadLocalFile(file, "images");
}

export async function uploadAudio(file) {
  assertSupportedProvider();
  return uploadLocalFile(file, "audio");
}

export async function deleteFile(fileUrl) {
  // TODO: implement physical deletion when a persistent media provider is added.
  return {
    deleted: false,
    fileUrl,
  };
}

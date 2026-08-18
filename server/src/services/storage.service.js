import crypto from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  getPublicS3ObjectUrl,
  getS3Client,
  getS3Configuration,
  hasS3Configuration,
} from "../lib/s3.js";

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

function getStorageProvider() {
  if (process.env.NODE_ENV === "production") {
    return "s3";
  }

  const configuredProvider = process.env.MEDIA_STORAGE_PROVIDER?.trim();

  if (configuredProvider) {
    return configuredProvider;
  }

  return hasS3Configuration() ? "s3" : "local";
}

function getFileExtension(file) {
  return EXTENSIONS_BY_MIME_TYPE[file.mimetype] || "";
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

  return {
    url: `/uploads/${folder}/${fileName}`,
    key: `${folder}/${fileName}`,
  };
}

async function uploadS3File(file, folder) {
  if (!file?.buffer) {
    throw createHttpError(400, "No file uploaded");
  }

  const extension = getFileExtension(file);
  const key = `${folder}/${crypto.randomUUID()}${extension}`;
  const { bucket } = getS3Configuration();

  try {
    await getS3Client().send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: "public, max-age=31536000, immutable",
    }));
  } catch (error) {
    console.error("S3 media upload error:", {
      name: error?.name,
      code: error?.code,
      status: error?.$metadata?.httpStatusCode,
      message: error?.message,
    });

    const uploadError = createHttpError(503, "Media upload failed");
    uploadError.code = "S3_UPLOAD_FAILED";
    uploadError.expose = true;
    throw uploadError;
  }

  return {
    url: getPublicS3ObjectUrl(key),
    key,
  };
}

async function uploadFile(file, {
  folder,
}) {
  const provider = getStorageProvider();

  if (provider === "s3") {
    return uploadS3File(file, folder);
  }

  if (provider === "local" && process.env.NODE_ENV !== "production") {
    return uploadLocalFile(file, folder);
  }

  const error = createHttpError(503, "Media storage provider is not configured");
  error.expose = true;
  throw error;
}

export async function uploadImage(file) {
  return uploadFile(file, {
    folder: "images",
  });
}

export async function uploadAudio(file) {
  return uploadFile(file, {
    folder: "audio",
  });
}

export async function deleteFile(fileUrl) {
  // TODO: add explicit S3 object deletion when media lifecycle management is needed.
  return {
    deleted: false,
    fileUrl,
  };
}

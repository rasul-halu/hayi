import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
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

function getStorageProvider() {
  return process.env.MEDIA_STORAGE_PROVIDER || "local";
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

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw createHttpError(500, "Media storage provider is not configured");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

function uploadCloudinaryFile(file, {
  folder,
  resourceType,
}) {
  if (!file?.buffer) {
    throw createHttpError(400, "No file uploaded");
  }

  configureCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `hayi/${folder}`,
        resource_type: resourceType,
        use_filename: false,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(createHttpError(500, "Upload failed"));
          return;
        }

        resolve(result.secure_url);
      }
    );

    uploadStream.end(file.buffer);
  });
}

async function uploadFile(file, {
  folder,
  resourceType,
}) {
  const provider = getStorageProvider();

  if (provider === "cloudinary") {
    return uploadCloudinaryFile(file, {
      folder,
      resourceType,
    });
  }

  if (provider === "local") {
    return uploadLocalFile(file, folder);
  }

  throw createHttpError(500, "Media storage provider is not configured");
}

export async function uploadImage(file) {
  return uploadFile(file, {
    folder: "images",
    resourceType: "image",
  });
}

export async function uploadAudio(file) {
  return uploadFile(file, {
    folder: "audio",
    resourceType: "video",
  });
}

export async function deleteFile(fileUrl) {
  // TODO: implement physical deletion when a persistent media provider is added.
  return {
    deleted: false,
    fileUrl,
  };
}

import multer from "multer";
import path from "path";

const IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
const AUDIO_MAX_SIZE_BYTES = 12 * 1024 * 1024;

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const AUDIO_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "video/mp4",
]);

const IMAGE_EXTENSIONS = new Set([".jpeg", ".jpg", ".png", ".webp"]);
const AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".ogg", ".m4a"]);

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function isAllowedFile(file, mimeTypes, extensions) {
  const extension = path.extname(file.originalname || "").toLowerCase();

  return mimeTypes.has(file.mimetype) && extensions.has(extension);
}

function createFileFilter({
  mimeTypes,
  extensions,
  message,
}) {
  return (req, file, callback) => {
    if (!isAllowedFile(file, mimeTypes, extensions)) {
      callback(createHttpError(400, message));
      return;
    }

    callback(null, true);
  };
}

function createUpload({
  maxSizeBytes,
  mimeTypes,
  extensions,
  unsupportedMessage,
}) {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxSizeBytes,
    },
    fileFilter: createFileFilter({
      mimeTypes,
      extensions,
      message: unsupportedMessage,
    }),
  });

  return (req, res, next) => {
    upload.single("file")(req, res, error => {
      if (!error) {
        next();
        return;
      }

      if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
        next(createHttpError(413, "File is too large"));
        return;
      }

      next(error);
    });
  };
}

export const uploadImageFile = createUpload({
  maxSizeBytes: IMAGE_MAX_SIZE_BYTES,
  mimeTypes: IMAGE_MIME_TYPES,
  extensions: IMAGE_EXTENSIONS,
  unsupportedMessage: "Unsupported image type",
});

export const uploadAudioFile = createUpload({
  maxSizeBytes: AUDIO_MAX_SIZE_BYTES,
  mimeTypes: AUDIO_MIME_TYPES,
  extensions: AUDIO_EXTENSIONS,
  unsupportedMessage: "Unsupported audio type",
});

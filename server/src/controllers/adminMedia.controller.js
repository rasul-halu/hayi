import {
  uploadAudio,
  uploadImage,
} from "../services/storage.service.js";

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export async function postAdminImage(req, res, next) {
  try {
    if (!req.file) {
      throw createHttpError(400, "No file uploaded");
    }

    const { url, key } = await uploadImage(req.file);

    return res.status(201).json({
      uploaded: true,
      url,
      key,
      type: "image",
    });
  } catch (error) {
    return next(error);
  }
}

export async function postAdminAudio(req, res, next) {
  try {
    if (!req.file) {
      throw createHttpError(400, "No file uploaded");
    }

    const { url, key } = await uploadAudio(req.file);

    return res.status(201).json({
      uploaded: true,
      url,
      key,
      type: "audio",
    });
  } catch (error) {
    return next(error);
  }
}

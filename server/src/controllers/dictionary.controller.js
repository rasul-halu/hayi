import {
  createDictionaryWord,
  getDictionaryWordById,
  listAdminDictionaryWords,
  listPublishedDictionaryWords,
  updateDictionaryWord,
} from "../services/dictionary.service.js";

const MUTABLE_FIELDS = [
  "lezgian",
  "russian",
  "transcription",
  "exampleLezgian",
  "exampleRussian",
  "audioUrl",
  "imageUrl",
  "category",
  "order",
  "isPublished",
];

const OPTIONAL_STRING_FIELDS = [
  "transcription",
  "exampleLezgian",
  "exampleRussian",
  "audioUrl",
  "imageUrl",
  "category",
];

function normalizeOptionalString(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0
    ? trimmedValue
    : null;
}

function normalizeRequiredString(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function validateDictionaryPayload(body = {}, {
  partial = false,
} = {}) {
  const data = {};

  if (!partial || body.lezgian !== undefined) {
    data.lezgian = normalizeRequiredString(body.lezgian);

    if (!data.lezgian) {
      return { error: "lezgian is required" };
    }
  }

  if (!partial || body.russian !== undefined) {
    data.russian = normalizeRequiredString(body.russian);

    if (!data.russian) {
      return { error: "russian is required" };
    }
  }

  OPTIONAL_STRING_FIELDS.forEach(field => {
    if (!partial || body[field] !== undefined) {
      data[field] = normalizeOptionalString(body[field]);
    }
  });

  if (!partial || body.order !== undefined) {
    const order = Number(body.order ?? 0);

    if (!Number.isInteger(order)) {
      return { error: "order must be an integer" };
    }

    data.order = order;
  }

  if (!partial || body.isPublished !== undefined) {
    if (!partial && body.isPublished === undefined) {
      data.isPublished = false;
    } else if (typeof body.isPublished !== "boolean") {
      return { error: "isPublished must be a boolean" };
    } else {
      data.isPublished = body.isPublished;
    }
  }

  const unknownField = Object.keys(body).find(
    key => !MUTABLE_FIELDS.includes(key)
  );

  if (unknownField) {
    return {
      error: `${unknownField} is not allowed`,
    };
  }

  return {
    value: data,
  };
}

function handleDictionaryError(res, error, label) {
  if (error.code === "P2025") {
    return res.status(404).json({
      error: "Dictionary word not found",
    });
  }

  if (process.env.NODE_ENV === "development") {
    console.error(label, error.code || error.name || "UnknownError");
  }

  return res.status(503).json({
    error: "Database is temporarily unavailable",
  });
}

export async function listPublicDictionary(req, res) {
  try {
    const words = await listPublishedDictionaryWords();

    return res.json({
      words,
    });
  } catch (error) {
    return handleDictionaryError(
      res,
      error,
      "Public dictionary loading error:"
    );
  }
}

export async function listAdminDictionary(req, res) {
  try {
    const words = await listAdminDictionaryWords();

    return res.json({
      words,
    });
  } catch (error) {
    return handleDictionaryError(
      res,
      error,
      "Admin dictionary loading error:"
    );
  }
}

export async function getAdminDictionaryWord(req, res) {
  try {
    const word = await getDictionaryWordById(req.params.wordId);

    if (!word) {
      return res.status(404).json({
        error: "Dictionary word not found",
      });
    }

    return res.json({
      word,
    });
  } catch (error) {
    return handleDictionaryError(
      res,
      error,
      "Admin dictionary word loading error:"
    );
  }
}

export async function postAdminDictionaryWord(req, res) {
  try {
    const validation = validateDictionaryPayload(req.body);

    if (validation.error) {
      return res.status(400).json({
        error: validation.error,
      });
    }

    const word = await createDictionaryWord(validation.value);

    return res.status(201).json({
      created: true,
      word,
    });
  } catch (error) {
    return handleDictionaryError(
      res,
      error,
      "Admin dictionary word create error:"
    );
  }
}

export async function patchAdminDictionaryWord(req, res) {
  try {
    const validation = validateDictionaryPayload(req.body, {
      partial: true,
    });

    if (validation.error) {
      return res.status(400).json({
        error: validation.error,
      });
    }

    const word = await updateDictionaryWord(
      req.params.wordId,
      validation.value
    );

    return res.json({
      saved: true,
      word,
    });
  } catch (error) {
    return handleDictionaryError(
      res,
      error,
      "Admin dictionary word update error:"
    );
  }
}

import {
  createAlphabetLetter,
  listAdminAlphabetLetters,
  listPublishedAlphabetLetters,
  updateAlphabetLetter,
} from "../services/alphabet.service.js";

const MUTABLE_FIELDS = [
  "letter",
  "displayLetter",
  "name",
  "description",
  "example",
  "exampleMeaning",
  "audioUrl",
  "imageUrl",
  "order",
  "isPublished",
];

const OPTIONAL_STRING_FIELDS = [
  "displayLetter",
  "name",
  "description",
  "example",
  "exampleMeaning",
  "audioUrl",
  "imageUrl",
];

function normalizeOptionalString(value) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value !== "string") return null;

  const normalized = value.trim();
  return normalized || null;
}

function validateAlphabetPayload(body = {}, { partial = false } = {}) {
  const unknownField = Object.keys(body).find(
    field => !MUTABLE_FIELDS.includes(field)
  );

  if (unknownField) {
    return { error: `${unknownField} is not allowed` };
  }

  const data = {};

  if (!partial || body.letter !== undefined) {
    data.letter = typeof body.letter === "string" ? body.letter.trim() : "";
    if (!data.letter) return { error: "letter is required" };
  }

  for (const field of OPTIONAL_STRING_FIELDS) {
    if (!partial || body[field] !== undefined) {
      data[field] = normalizeOptionalString(body[field]);
    }
  }

  if (!partial || body.order !== undefined) {
    const order = Number(body.order ?? 0);
    if (!Number.isInteger(order)) return { error: "order must be an integer" };
    data.order = order;
  }

  if (!partial || body.isPublished !== undefined) {
    if (!partial && body.isPublished === undefined) {
      data.isPublished = true;
    } else if (typeof body.isPublished !== "boolean") {
      return { error: "isPublished must be a boolean" };
    } else {
      data.isPublished = body.isPublished;
    }
  }

  return { value: data };
}

function handleAlphabetError(res, error) {
  if (error.code === "P2025") {
    return res.status(404).json({ error: "Alphabet letter not found" });
  }

  if (error.code === "P2002") {
    return res.status(409).json({ error: "This letter already exists" });
  }

  if (process.env.NODE_ENV === "development") {
    console.error("Alphabet API error:", error.code || error.name || "UnknownError");
  }

  return res.status(503).json({ error: "Database is temporarily unavailable" });
}

export async function listPublicAlphabet(req, res) {
  try {
    return res.json({ letters: await listPublishedAlphabetLetters() });
  } catch (error) {
    return handleAlphabetError(res, error);
  }
}

export async function listAdminAlphabet(req, res) {
  try {
    return res.json({ letters: await listAdminAlphabetLetters() });
  } catch (error) {
    return handleAlphabetError(res, error);
  }
}

export async function postAdminAlphabetLetter(req, res) {
  try {
    const validation = validateAlphabetPayload(req.body);
    if (validation.error) return res.status(400).json({ error: validation.error });

    const letter = await createAlphabetLetter(validation.value);
    return res.status(201).json({ created: true, letter });
  } catch (error) {
    return handleAlphabetError(res, error);
  }
}

export async function patchAdminAlphabetLetter(req, res) {
  try {
    const validation = validateAlphabetPayload(req.body, { partial: true });
    if (validation.error) return res.status(400).json({ error: validation.error });

    const letter = await updateAlphabetLetter(req.params.letterId, validation.value);
    return res.json({ saved: true, letter });
  } catch (error) {
    return handleAlphabetError(res, error);
  }
}

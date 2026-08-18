function invalidMediaUrl(fieldName) {
  return {
    error: `${fieldName} must be a public HTTPS URL`,
  };
}

export function validateOptionalMediaUrl(value, fieldName) {
  if (value === undefined) {
    return { value: undefined };
  }

  if (value === null || value === "") {
    return { value: null };
  }

  if (typeof value !== "string") {
    return invalidMediaUrl(fieldName);
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return { value: null };
  }

  if (trimmedValue.startsWith("/uploads/")) {
    return process.env.NODE_ENV === "production"
      ? invalidMediaUrl(fieldName)
      : { value: trimmedValue };
  }

  if (/^[a-zA-Z]:[\\/]/.test(trimmedValue) ||
    trimmedValue.includes("\\") ||
    /^(file|blob|data):/i.test(trimmedValue)) {
    return invalidMediaUrl(fieldName);
  }

  try {
    const parsedUrl = new URL(trimmedValue);
    const hostname = parsedUrl.hostname.toLowerCase();
    const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(hostname);

    if (parsedUrl.protocol !== "https:" || isLocalHost) {
      return invalidMediaUrl(fieldName);
    }
  } catch {
    return invalidMediaUrl(fieldName);
  }

  return { value: trimmedValue };
}

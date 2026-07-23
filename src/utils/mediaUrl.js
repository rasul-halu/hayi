const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

function getApiBaseUrl() {
  try {
    const apiUrl = new URL(API_URL);
    const pathname = apiUrl.pathname.replace(/\/api\/?$/, "");

    return `${apiUrl.origin}${pathname}`.replace(/\/$/, "");
  } catch {
    return API_URL.replace(/\/api\/?$/, "").replace(/\/$/, "");
  }
}

export function resolveMediaUrl(value) {
  if (!value || typeof value !== "string") {
    return value;
  }

  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value;
  }

  const normalizedPath = value.startsWith("/") ? value : `/${value}`;

  if (normalizedPath.startsWith("/uploads/")) {
    return `${getApiBaseUrl()}${normalizedPath}`;
  }

  return value;
}

export function resolveMediaImage(image) {
  if (!image) {
    return image;
  }

  if (typeof image === "string") {
    return {
      src: resolveMediaUrl(image),
      alt: "",
    };
  }

  return {
    ...image,
    src: resolveMediaUrl(image.src),
  };
}

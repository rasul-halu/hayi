import React from "react";

const NEW_WORD_COLOR = "#8B5CF6";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizeNewWords(source) {
  if (!source) {
    return [];
  }

  if (Array.isArray(source)) {
    return source.filter(word =>
      word && typeof word.text === "string" && word.text.trim()
    );
  }

  if (Array.isArray(source.newWords)) {
    return normalizeNewWords(source.newWords);
  }

  if (source.newWord) {
    return normalizeNewWords([source.newWord]);
  }

  return [];
}

export function highlightNewWords(text, newWordsSource) {
  if (typeof text !== "string") {
    return text || "";
  }

  const newWords = normalizeNewWords(newWordsSource);

  if (newWords.length === 0) {
    return text;
  }

  const words = newWords
    .map(word => word.text.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (words.length === 0) {
    return text;
  }

  const pattern = new RegExp(`(${words.map(escapeRegExp).join("|")})`, "giu");
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    const isNewWord = words.some(word =>
      part.toLowerCase() === word.toLowerCase()
    );

    if (!isNewWord) {
      return part;
    }

    return (
      <span
        key={`${part}-${index}`}
        style={{
          color: NEW_WORD_COLOR,
          fontWeight: 900
        }}
      >
        {part}
      </span>
    );
  });
}

export const CHAPTER_THEMES = Object.freeze([
  { main: "#3D8614", depth: "#2F6810", soft: "#EAF7DF" },
  { main: "#1779AD", depth: "#105F8A", soft: "#E3F5FC" },
  { main: "#8659D3", depth: "#6841AD", soft: "#F0E9FB" },
  { main: "#C75139", depth: "#A23D2C", soft: "#FBEAE5" },
  { main: "#9B6812", depth: "#76500E", soft: "#FFF3D8" },
  { main: "#147C71", depth: "#0E6058", soft: "#E1F5F2" },
  { main: "#B63B6A", depth: "#8F2D53", soft: "#FBE5EE" },
  { main: "#5468D4", depth: "#3E4FA8", soft: "#E8EBFA" }
]);

function getChapterNumber(order, fallbackIndex = 0) {
  const numericOrder = Number(order);

  if (Number.isInteger(numericOrder) && numericOrder > 0) {
    return numericOrder;
  }

  return Math.max(0, fallbackIndex) + 1;
}

export function getChapterTheme(order, fallbackIndex = 0) {
  const chapterNumber = getChapterNumber(order, fallbackIndex);
  const paletteIndex = (chapterNumber - 1) % CHAPTER_THEMES.length;

  return CHAPTER_THEMES[paletteIndex];
}

export function getChapterPresentation(chapter = {}, fallbackIndex = 0) {
  const chapterNumber = getChapterNumber(chapter.order, fallbackIndex);
  const title = typeof chapter.title === "string"
    ? chapter.title.trim()
    : "";
  const description = typeof chapter.description === "string"
    ? chapter.description.trim()
    : "";
  const titleIsGenericChapterNumber = /^глава\s*\d+$/iu.test(title);

  return {
    label: `ГЛАВА ${chapterNumber}`,
    title: titleIsGenericChapterNumber
      ? description || title
      : title || description || `Глава ${chapterNumber}`
  };
}

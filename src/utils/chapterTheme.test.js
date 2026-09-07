import {
  CHAPTER_THEMES,
  getChapterPresentation,
  getChapterTheme
} from "./chapterTheme";

function getWhiteContrastRatio(hexColor) {
  const channels = hexColor
    .slice(1)
    .match(/.{2}/g)
    .map(channel => parseInt(channel, 16) / 255)
    .map(channel => channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4);
  const luminance =
    channels[0] * 0.2126 +
    channels[1] * 0.7152 +
    channels[2] * 0.0722;

  return 1.05 / (luminance + 0.05);
}

test("chapter themes repeat deterministically after eight chapters", () => {
  const expectedThemeIndexes = [0, 1, 2, 3, 4, 5, 6, 7, 0, 1];

  expectedThemeIndexes.forEach((themeIndex, index) => {
    expect(getChapterTheme(index + 1)).toBe(CHAPTER_THEMES[themeIndex]);
  });
});

test("every chapter header color has readable white text contrast", () => {
  CHAPTER_THEMES.forEach(theme => {
    expect(getWhiteContrastRatio(theme.main)).toBeGreaterThanOrEqual(4.5);
  });
});

test("chapter presentation avoids repeating a generic chapter title", () => {
  expect(getChapterPresentation({
    order: 2,
    title: "Глава 2",
    description: "Рассказывайте о семье"
  })).toEqual({
    label: "ГЛАВА 2",
    title: "Рассказывайте о семье"
  });
});

test("chapter presentation keeps a meaningful title", () => {
  expect(getChapterPresentation({
    order: 3,
    title: "Дом и комнаты",
    description: "Опишите свой дом"
  })).toEqual({
    label: "ГЛАВА 3",
    title: "Дом и комнаты"
  });
});

import { shuffleItems } from "./shuffle";

test("Fisher-Yates shuffles a copy without losing or duplicating items", () => {
  const source = ["брат", "сестра", "отец", "мама"];
  const shuffled = shuffleItems(source, () => 0);

  expect(shuffled).not.toBe(source);
  expect(source).toEqual(["брат", "сестра", "отец", "мама"]);
  expect([...shuffled].sort()).toEqual([...source].sort());
  expect(new Set(shuffled).size).toBe(source.length);
});

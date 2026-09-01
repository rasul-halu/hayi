export function shuffleItems(items, random = Math.random) {
  const shuffled = Array.isArray(items) ? [...items] : [];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index]
    ];
  }

  return shuffled;
}

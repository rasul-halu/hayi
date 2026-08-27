const MATCH_COMPLETE_PREFIX = "__match_complete__";

function getPairValue(pair, primaryField, fallbackField) {
  const value = pair?.[primaryField] ?? pair?.[fallbackField];
  return typeof value === "string" ? value : "";
}

export function normalizeMatchPairs(question) {
  const rawPairs = Array.isArray(question?.pairs) ? question.pairs : [];
  const questionId = question?.id ?? "match";

  return rawPairs
    .map((pair, index) => {
      const sourceId = pair?.id ?? index;

      return {
        id: `${questionId}:pair:${sourceId}:${index}`,
        left: getPairValue(pair, "word", "left"),
        right: getPairValue(pair, "translation", "right")
      };
    })
    .filter(pair => pair.left && pair.right);
}

export function shuffleMatchItems(items, random = Math.random) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index]
    ];
  }

  return shuffled;
}

function separateAlignedItems(leftItems, rightItems) {
  if (leftItems.length <= 1) {
    return rightItems;
  }

  const hasAlignedPair = leftItems.some(
    (leftItem, index) => leftItem.pairId === rightItems[index]?.pairId
  );

  if (!hasAlignedPair) {
    return rightItems;
  }

  const rightByPairId = new Map(
    rightItems.map(item => [item.pairId, item])
  );

  return leftItems.map((_, index) => {
    const nextLeftItem = leftItems[(index + 1) % leftItems.length];
    return rightByPairId.get(nextLeftItem.pairId);
  });
}

export function createMatchLayout(question, random = Math.random) {
  const pairs = normalizeMatchPairs(question);
  const leftItems = shuffleMatchItems(
    pairs.map(pair => ({
      id: `${pair.id}:left`,
      pairId: pair.id,
      text: pair.left
    })),
    random
  );
  const shuffledRightItems = shuffleMatchItems(
    pairs.map(pair => ({
      id: `${pair.id}:right`,
      pairId: pair.id,
      text: pair.right
    })),
    random
  );

  return {
    pairs,
    leftItems,
    rightItems: separateAlignedItems(leftItems, shuffledRightItems)
  };
}

export function getMatchCompletionValue(question) {
  const pairIds = normalizeMatchPairs(question).map(pair => pair.id);
  return `${MATCH_COMPLETE_PREFIX}:${pairIds.join("|")}`;
}

export function isMatchAnswerCorrect(question, selected) {
  return normalizeMatchPairs(question).length > 0 &&
    selected === getMatchCompletionValue(question);
}

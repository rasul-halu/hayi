const MAX_PRISMA_INT = 2_147_483_647;
const MIN_TEMPORARY_ORDER = 100_001;

export async function normalizeOrderInTwoPhases(items, updateOrder) {
  if (!Array.isArray(items) || items.length === 0) {
    return;
  }

  if (items.every((item, index) => item.order === index + 1)) {
    return;
  }

  const maxCurrentOrder = Math.max(
    0,
    ...items.map(item => Number(item.order) || 0)
  );
  const temporaryStart = Math.max(
    MIN_TEMPORARY_ORDER,
    maxCurrentOrder + items.length + 1
  );

  if (temporaryStart + items.length - 1 > MAX_PRISMA_INT) {
    throw new Error("Unable to allocate temporary order values");
  }

  for (const [index, item] of items.entries()) {
    await updateOrder(item.id, temporaryStart + index);
  }

  for (const [index, item] of items.entries()) {
    await updateOrder(item.id, index + 1);
  }
}

import assert from "node:assert/strict";
import test from "node:test";
import { normalizeOrderInTwoPhases } from "./orderNormalization.js";

async function normalize(initialOrders) {
  const rows = initialOrders
    .map((order, index) => ({ id: `row-${index}`, order }))
    .sort((left, right) => left.order - right.order);
  const currentOrders = new Map(rows.map(row => [row.id, row.order]));

  await normalizeOrderInTwoPhases(rows, async (id, order) => {
    assert.ok(order > 0, "temporary and final order values must stay positive");
    const hasConflict = [...currentOrders].some(([otherId, otherOrder]) =>
      otherId !== id && otherOrder === order
    );

    assert.equal(hasConflict, false, `transient collision at order ${order}`);
    currentOrders.set(id, order);
  });

  return [...currentOrders.values()].sort((left, right) => left - right);
}

test("normalizes remaining rows after deleting the middle item", async () => {
  assert.deepEqual(await normalize([1, 3]), [1, 2]);
});

test("normalizes remaining rows after deleting the first item", async () => {
  assert.deepEqual(await normalize([2, 3]), [1, 2]);
});

test("keeps a contiguous list after deleting the last item", async () => {
  assert.deepEqual(await normalize([1, 2]), [1, 2]);
});

test("handles the last item being deleted", async () => {
  assert.deepEqual(await normalize([]), []);
});

test("avoids the confirmed order zero to order one collision", async () => {
  assert.deepEqual(await normalize([0, 1]), [1, 2]);
});

test("leaves the correct next order after normalization", async () => {
  const normalized = await normalize([1, 3]);
  const nextOrder = Math.max(0, ...normalized) + 1;

  assert.equal(nextOrder, 3);
});

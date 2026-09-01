import assert from "node:assert/strict";
import test from "node:test";

import { getRewardedHeartState } from "./hearts.service.js";

test("heart reward adds one heart without exceeding maximum", () => {
  assert.deepEqual(
    getRewardedHeartState({ hearts: 2, maxHearts: 5 }),
    {
      hearts: 3,
      maxHearts: 5,
      heartRestored: true,
    }
  );
  assert.deepEqual(
    getRewardedHeartState({ hearts: 5, maxHearts: 5 }),
    {
      hearts: 5,
      maxHearts: 5,
      heartRestored: false,
    }
  );
});

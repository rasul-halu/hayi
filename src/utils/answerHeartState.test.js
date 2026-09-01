import {
  getCorrectAnswerHeartState,
  getWrongAnswerHeartState
} from "./answerHeartState";

function applyCorrect(state) {
  return {
    ...state,
    ...getCorrectAnswerHeartState(state)
  };
}

test("a correct answer never decreases hearts", () => {
  const result = getCorrectAnswerHeartState({
    hearts: 2,
    maxHearts: 5,
    correctAnswerStreak: 0
  });

  expect(result.hearts).toBe(2);
  expect(result.correctAnswerStreak).toBe(1);
});

test("three consecutive correct answers restore one missing heart", () => {
  let state = { hearts: 2, maxHearts: 5, correctAnswerStreak: 0 };

  state = applyCorrect(state);
  state = applyCorrect(state);
  state = applyCorrect(state);

  expect(state.hearts).toBe(3);
  expect(state.correctAnswerStreak).toBe(0);
  expect(state.heartRestored).toBe(true);
});

test("the fourth correct answer keeps the restored heart", () => {
  let state = { hearts: 2, maxHearts: 5, correctAnswerStreak: 0 };

  state = applyCorrect(state);
  state = applyCorrect(state);
  state = applyCorrect(state);
  state = applyCorrect(state);

  expect(state.hearts).toBe(3);
  expect(state.correctAnswerStreak).toBe(1);
});

test("a correct reward never exceeds maximum hearts", () => {
  const result = getCorrectAnswerHeartState({
    hearts: 5,
    maxHearts: 5,
    correctAnswerStreak: 2
  });

  expect(result.hearts).toBe(5);
  expect(result.correctAnswerStreak).toBe(0);
  expect(result.heartRestored).toBe(false);
});

test("a wrong answer removes one heart", () => {
  const result = getWrongAnswerHeartState({
    hearts: 3,
    maxHearts: 5,
    correctAnswerStreak: 2
  });

  expect(result.hearts).toBe(2);
});

test("wrong resets the streak and the next correct starts at one", () => {
  const wrong = getWrongAnswerHeartState({
    hearts: 3,
    maxHearts: 5,
    correctAnswerStreak: 2
  });
  const nextCorrect = getCorrectAnswerHeartState(wrong);

  expect(wrong.correctAnswerStreak).toBe(0);
  expect(nextCorrect.correctAnswerStreak).toBe(1);
  expect(nextCorrect.hearts).toBe(2);
});

import { fireEvent, render, screen } from "@testing-library/react";
import ChoiceQuestion from "./ChoiceQuestion";

function getOptionLabels() {
  return screen.getAllByRole("button").map(button => button.textContent);
}

test("hides trailing punctuation without changing the selected option value", () => {
  const setSelected = jest.fn();

  render(
    <ChoiceQuestion
      question={{
        id: "choice-punctuation",
        prompt: "Выберите правильный ответ:",
        question: "Им зи стха я.",
        answers: [
          "Это мой брат.",
          "Это моя сестра!",
          "Я твой брат?"
        ]
      }}
      selected={null}
      setSelected={setSelected}
    />
  );

  expect(screen.getByText("Им зи стха я.")).not.toBeNull();
  expect(screen.getByRole("button", { name: "Это мой брат" })).not.toBeNull();
  expect(screen.queryByText("Это мой брат.")).toBeNull();

  fireEvent.click(screen.getByRole("button", { name: "Это мой брат" }));

  expect(setSelected).toHaveBeenCalledWith("Это мой брат.");
});

test("keeps shuffled options stable for one question and preserves values", () => {
  const setSelected = jest.fn();
  const question = {
    id: "choice-1",
    prompt: "Выберите:",
    question: "стха",
    answers: ["брат", "друг", "отец", "парень"],
    correct: "брат"
  };
  const originalAnswers = [...question.answers];
  const { rerender } = render(
    <ChoiceQuestion
      question={question}
      selected={null}
      setSelected={setSelected}
    />
  );
  const firstOrder = getOptionLabels();

  expect([...firstOrder].sort()).toEqual([...originalAnswers].sort());
  expect(question.answers).toEqual(originalAnswers);

  fireEvent.click(screen.getByRole("button", { name: "брат" }));
  expect(setSelected).toHaveBeenCalledWith(question.correct);

  rerender(
    <ChoiceQuestion
      question={question}
      selected="брат"
      setSelected={setSelected}
      feedbackStatus="correct"
    />
  );

  expect(getOptionLabels()).toEqual(firstOrder);
});

test("creates a complete option set when the question changes", () => {
  const setSelected = jest.fn();
  const firstQuestion = {
    id: "choice-first",
    prompt: "Выберите:",
    question: "стха",
    answers: ["брат", "друг", "отец"]
  };
  const secondQuestion = {
    id: "choice-second",
    prompt: "Выберите:",
    question: "вах",
    answers: ["сестра", "мама", "подруга", "дочь"]
  };
  const { rerender } = render(
    <ChoiceQuestion
      question={firstQuestion}
      selected={null}
      setSelected={setSelected}
    />
  );

  expect([...getOptionLabels()].sort())
    .toEqual([...firstQuestion.answers].sort());

  rerender(
    <ChoiceQuestion
      question={secondQuestion}
      selected={null}
      setSelected={setSelected}
    />
  );

  const secondLabels = getOptionLabels();
  expect([...secondLabels].sort()).toEqual([...secondQuestion.answers].sort());
  expect(new Set(secondLabels).size).toBe(secondQuestion.answers.length);
});

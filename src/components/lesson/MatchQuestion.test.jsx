import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MatchQuestion from "./MatchQuestion";
import { isMatchAnswerCorrect } from "../../utils/matchQuestion";

const question = {
  id: "matching-component-test",
  type: "match",
  prompt: "Сопоставь слова и переводы:",
  pairs: [
    { word: "гьикI ава", translation: "как дела" },
    { word: "сагърай", translation: "спасибо" },
    { word: "салам", translation: "привет" },
    { word: "хъсан югъ", translation: "добрый день" }
  ]
};

test("keeps shuffled order stable across rerenders", () => {
  const setSelected = jest.fn();
  const { rerender } = render(
    <MatchQuestion question={question} setSelected={setSelected} />
  );
  const firstOrder = screen.getAllByRole("button").map(button => button.textContent);

  rerender(<MatchQuestion question={question} setSelected={setSelected} />);

  expect(screen.getAllByRole("button").map(button => button.textContent))
    .toEqual(firstOrder);
});

test("matches by pair identity instead of screen position", () => {
  render(<MatchQuestion question={question} setSelected={jest.fn()} />);

  const left = screen.getByRole("button", { name: "гьикI ава" });
  const correctRight = screen.getByRole("button", { name: "как дела" });

  fireEvent.click(left);
  fireEvent.click(correctRight);

  expect(left).toBeDisabled();
  expect(correctRight).toBeDisabled();
});

test("rejects a right item from another source pair", () => {
  render(<MatchQuestion question={question} setSelected={jest.fn()} />);

  const left = screen.getByRole("button", { name: "гьикI ава" });
  const wrongRight = screen.getByRole("button", { name: "спасибо" });

  fireEvent.click(left);
  fireEvent.click(wrongRight);

  expect(left).not.toBeDisabled();
  expect(wrongRight).not.toBeDisabled();
});

test("completes after the last source pair without correctAnswer", () => {
  jest.useFakeTimers();
  const setSelected = jest.fn();
  render(<MatchQuestion question={question} setSelected={setSelected} />);
  setSelected.mockClear();

  question.pairs.forEach(pair => {
    fireEvent.click(screen.getByRole("button", { name: pair.word }));
    fireEvent.click(screen.getByRole("button", { name: pair.translation }));
  });

  act(() => {
    jest.advanceTimersByTime(650);
  });

  const selected = setSelected.mock.calls.at(-1)?.[0];
  expect(isMatchAnswerCorrect(question, selected)).toBe(true);
  jest.useRealTimers();
});

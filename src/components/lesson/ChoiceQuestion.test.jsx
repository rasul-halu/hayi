import { fireEvent, render, screen } from "@testing-library/react";
import ChoiceQuestion from "./ChoiceQuestion";

test("hides trailing punctuation without changing the selected option value", () => {
  const setSelected = jest.fn();

  render(
    <ChoiceQuestion
      question={{
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

import { fireEvent, render, screen } from "@testing-library/react";
import ListeningAndTypeQuestion from "./ListeningAndTypeQuestion";

jest.mock("../audio/AudioPlayButton", () => function MockAudioPlayButton({
  src,
  label
}) {
  return <button type="button" data-src={src}>{label}</button>;
});

test("renders the blank, shared audio control and typed answer", () => {
  const setSelected = jest.fn();

  render(
    <ListeningAndTypeQuestion
      question={{
        prompt: "Прослушайте и впишите пропущенное слово",
        sentence: "Ви ___ гьикI я?",
        audioUrl: "https://cdn.example.com/sentence.mp3"
      }}
      selected=""
      setSelected={setSelected}
    />
  );

  expect(screen.getByText("___")).not.toBeNull();
  expect(screen.getByRole("button", {
    name: "Прослушать предложение"
  }).getAttribute("data-src")).toBe("https://cdn.example.com/sentence.mp3");

  fireEvent.change(screen.getByRole("textbox"), {
    target: {
      value: "къене"
    }
  });

  expect(setSelected).toHaveBeenCalledWith("къене");
});

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

  const { container } = render(
    <ListeningAndTypeQuestion
      question={{
        prompt: "Прослушайте и впишите пропущенное слово",
        sentence: "Им зи ____ я.",
        audioUrl: "https://cdn.example.com/sentence.mp3"
      }}
      selected=""
      setSelected={setSelected}
    />
  );

  const sentence = container.querySelector(".listening-type-sentence");
  const blanks = container.querySelectorAll(".listening-type-blank");

  expect(blanks).toHaveLength(1);
  expect(blanks[0].textContent).toBe("");
  expect(sentence.textContent).toBe("Им зи  я.");
  expect(sentence.textContent).not.toContain("_");
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
